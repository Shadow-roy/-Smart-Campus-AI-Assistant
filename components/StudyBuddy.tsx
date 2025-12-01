
import React, { useState, useRef, useEffect, useContext } from 'react';
import { createStudyBuddyChat } from '../services/geminiService';
import { type Chat, type Content } from '@google/genai';
import { Send, Loader2, Trash2, Bot, User, Sparkles } from 'lucide-react';
import { UserContext } from '../App';
import { ToastContext } from '../contexts/ToastContext';
import { formatDueDate } from '../utils/time';

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1.5 p-3">
      <span className="w-1.5 h-1.5 bg-primary/60 dark:bg-dark-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="w-1.5 h-1.5 bg-primary/60 dark:bg-dark-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
      <span className="w-1.5 h-1.5 bg-primary/60 dark:bg-dark-primary/60 rounded-full animate-bounce"></span>
    </div>
);

const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return (
        <div className="space-y-2 text-sm leading-relaxed">
            {parts.map((part, index) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const content = part.substring(3, part.length - 3).replace(/^[a-z]+\n/, '');
                    return (
                        <pre key={index} className="bg-black/80 text-gray-100 p-3 rounded-xl overflow-x-auto font-mono text-xs my-2 border border-white/10">
                            <code>{content}</code>
                        </pre>
                    );
                }

                const lines = part.split('\n');
                return (
                    <div key={index}>
                        {lines.map((line, lineIdx) => {
                            if (!line.trim()) return <div key={lineIdx} className="h-2"></div>;
                            
                            const isList = line.trim().startsWith('* ') || line.trim().startsWith('- ');
                            const cleanLine = isList ? line.trim().substring(2) : line;
                            
                            const boldParts = cleanLine.split(/(\*\*.*?\*\*)/g);
                            const renderedLine = boldParts.map((bp, bpIdx) => {
                                if (bp.startsWith('**') && bp.endsWith('**')) {
                                    return <strong key={bpIdx} className="font-bold text-primary dark:text-dark-primary">{bp.substring(2, bp.length - 2)}</strong>;
                                }
                                const italicParts = bp.split(/(\*.*?\*)/g);
                                return italicParts.map((ip, ipIdx) => {
                                     if (ip.startsWith('*') && ip.endsWith('*') && ip.length > 2) {
                                        return <em key={`${bpIdx}-${ipIdx}`} className="italic opacity-90">{ip.substring(1, ip.length - 1)}</em>;
                                    }
                                    return <span key={`${bpIdx}-${ipIdx}`}>{ip}</span>;
                                });
                            });

                            if (isList) {
                                return (
                                    <div key={lineIdx} className="flex items-start ml-2 mb-1">
                                        <span className="mr-2 mt-2 w-1.5 h-1.5 bg-primary dark:bg-dark-primary rounded-full flex-shrink-0"></span>
                                        <span>{renderedLine}</span>
                                    </div>
                                );
                            }
                            return <p key={lineIdx} className="mb-1">{renderedLine}</p>;
                        })}
                    </div>
                );
            })}
        </div>
    );
};

const StudyBuddy: React.FC = () => {
    const userContext = useContext(UserContext);
    const toastContext = useContext(ToastContext);
    const { chatHistory, setChatHistory, assignments, timetableData, userProfile, semesters } = userContext;
    
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const suggestions = [
        "Explain Quantum Entanglement",
        "Write a python script for a calculator",
        "When is my next assignment due?",
        "Help me draft an email to my professor"
    ];

    // Build rich context from app data and update chat instance when data changes
    useEffect(() => {
        let context = `STUDENT PROFILE:\n`;
        context += `- Name: ${userProfile.name}\n`;
        context += `- Department: ${userProfile.department}\n`;
        context += `- Current Semester: ${userProfile.semester || 'Not Set'}\n`;
        context += `- Academic Year: ${userProfile.academicYear || 'Not Set'}\n`;
        
        context += "\n--- CURRENT WEEKLY SCHEDULE ---\n";
        if (timetableData.length === 0) {
            context += "No classes scheduled.\n";
        } else {
            timetableData.forEach(day => {
                context += `${day.day}:\n`;
                day.classes.forEach(c => {
                    context += `  - ${c.time}: ${c.subject} (${c.code}) at ${c.location} with ${c.lecturer}\n`;
                });
            });
        }

        context += "\n--- PENDING ASSIGNMENTS ---\n";
        const pending = assignments.filter(a => a.status !== 'Submitted');
        if (pending.length === 0) {
            context += "No pending assignments.\n";
        } else {
            pending.forEach(a => {
                context += `- [${a.status}] ${a.title} for ${a.subject}. Due: ${a.dueDate} (${formatDueDate(a.dueDate)}). Description: ${a.description || 'N/A'}\n`;
            });
        }
        
        context += "\n--- ACADEMIC SUBJECTS / SEMESTERS ---\n";
        if (semesters.length === 0) {
            context += "No specific subjects or grades recorded yet.\n";
        } else {
            semesters.forEach(sem => {
                context += `Semester ${sem.semesterNumber}:\n`;
                sem.subjects.forEach(sub => {
                    context += `  - ${sub.subjectName} (Credits: ${sub.credits})\n`;
                });
            });
        }

        const apiHistory: Content[] = chatHistory.filter(msg => msg.text !== '').map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
            
        // Re-initialize chat with updated context
        chatRef.current = createStudyBuddyChat(context, apiHistory);
        
    }, [timetableData, assignments, semesters, userProfile, chatHistory.length]); 
    // Intentionally omitted chatHistory content to avoid loop, but depend on length to re-sync history

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, isLoading]);

    const handleSend = async (messageText = input) => {
        if (!messageText.trim()) return;
        
        const currentChat = chatRef.current;
        if (!currentChat) {
             toastContext?.addToast("Initializing chat... please wait.", "info");
             return;
        }

        setChatHistory(prev => [...prev, { sender: 'user', text: messageText }]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await currentChat.sendMessageStream({ message: messageText });
            setChatHistory(prev => [...prev, { sender: 'ai', text: '' }]);
            
            let aiResponse = '';
            for await (const chunk of stream) {
                aiResponse += chunk.text;
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1].text = aiResponse;
                    return newHistory;
                });
            }
        } catch (error) {
            console.error(error);
            setChatHistory(prev => [...prev, { sender: 'ai', text: "I'm having trouble connecting right now. Please check your internet connection or API key." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        if (window.confirm("Are you sure you want to clear your chat history?")) {
            setChatHistory([{ sender: 'ai', text: "Hello! I'm Gemini. How can I help you today?" }]);
            chatRef.current = null; // Force context reload on next render/effect
            toastContext?.addToast("Chat history cleared", "info");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] md:h-full bg-surface dark:bg-dark-surface rounded-[2rem] border border-outlineVariant/30 dark:border-dark-outlineVariant/30 shadow-2xl shadow-primary/5 dark:shadow-none overflow-hidden relative">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-outlineVariant/30 dark:border-dark-outlineVariant/30 bg-white/50 dark:bg-black/20 backdrop-blur-md z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl text-white bg-gradient-to-br from-primary to-secondary shadow-md">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-onSurface dark:text-dark-onSurface">Gemini Chat</h2>
                        <p className="text-xs text-onSurfaceVariant dark:text-dark-onSurfaceVariant font-medium">Powered by Google AI</p>
                    </div>
                </div>
                <button 
                    onClick={handleClearChat} 
                    className="p-2.5 text-onSurfaceVariant hover:text-white hover:bg-error rounded-xl transition-all duration-200"
                    title="Clear Chat History"
                >
                    <Trash2 size={20} />
                </button>
            </div>
            
            <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar space-y-6 relative z-0 pb-28">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && (
                             <div className="w-8 h-8 rounded-full bg-primaryContainer dark:bg-dark-primaryContainer flex items-center justify-center text-primary dark:text-dark-primary flex-shrink-0 mb-1 shadow-sm">
                                <Bot size={16} />
                            </div>
                        )}
                        <div className={`max-w-[85%] md:max-w-2xl px-5 py-3.5 rounded-2xl shadow-sm ${
                            msg.sender === 'user' 
                            ? 'bg-gradient-to-br from-primary to-violet-600 text-white rounded-br-sm shadow-primary/20' 
                            : 'bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 text-onSurface dark:text-dark-onSurface rounded-bl-sm'
                        }`}>
                           {msg.sender === 'ai' && msg.text === '' && isLoading && index === chatHistory.length - 1 ? (
                               <TypingIndicator />
                           ) : (
                               <SimpleMarkdown text={msg.text} />
                           )}
                        </div>
                        {msg.sender === 'user' && (
                             <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-dark-surface shadow-sm mb-1 ring-2 ring-primary/20 dark:ring-dark-primary/20">
                                {userProfile.avatar ? <img src={userProfile.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-secondary text-white flex items-center justify-center"><User size={14}/></div>}
                            </div>
                        )}
                    </div>
                ))}
                {chatHistory.length === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-12 max-w-2xl mx-auto">
                        {suggestions.map((suggestion, idx) => (
                            <button key={idx} onClick={() => handleSend(suggestion)} className="text-sm text-left p-4 rounded-2xl bg-surface/50 dark:bg-dark-surface/50 border border-outlineVariant/50 dark:border-dark-outlineVariant/30 hover:border-primary dark:hover:border-dark-primary hover:bg-primaryContainer/30 dark:hover:bg-dark-primaryContainer/10 hover:shadow-md transition-all text-onSurfaceVariant dark:text-dark-onSurfaceVariant group backdrop-blur-sm">
                                <span className="group-hover:text-primary dark:group-hover:text-dark-primary transition-colors">{suggestion}</span>
                            </button>
                        ))}
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Redesigned to remove white border */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-surface via-surface/95 to-transparent dark:from-dark-surface dark:via-dark-surface/95 z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-end gap-2 p-2 pl-4 bg-surfaceVariant/80 dark:bg-dark-surfaceVariant/80 rounded-[2rem] shadow-lg backdrop-blur-xl">
                         <div className="flex-1 py-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (!isLoading) handleSend();
                                    }
                                }}
                                placeholder="Message Gemini..."
                                className="w-full max-h-32 bg-transparent border-none focus:ring-0 text-sm text-onSurface dark:text-dark-onSurface placeholder-onSurfaceVariant/50 resize-none custom-scrollbar"
                                rows={1}
                                disabled={isLoading}
                                style={{ minHeight: '24px' }}
                            />
                        </div>
                        <button
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="p-3 mb-0.5 mr-0.5 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all duration-300"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyBuddy;
