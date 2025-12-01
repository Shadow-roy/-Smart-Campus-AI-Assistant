
import { GoogleGenAI, Chat, Type, Content } from "@google/genai";
import { type ClassSchedule } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const result = reader.result as string;
        if (result && result.includes(',')) {
            resolve(result.split(',')[1]);
        } else {
            resolve("");
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const parseTimetableFromFile = async (file: File): Promise<ClassSchedule[]> => {
  if (!API_KEY) throw new Error("API Key not configured. Please check the console.");

  const filePart = await fileToGenerativePart(file);

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            filePart,
            { text: "Extract the weekly class schedule from this document. Identify the day, time, subject, course code, lecturer, and location for each class. Format the output as a JSON array, where each object represents a day of the week ('Monday', 'Tuesday', etc.) and contains a list of classes for that day." }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING, description: "Day of the week, e.g., 'Monday'" },
                classes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING, description: "Time range, e.g., '09:00 - 11:00'" },
                      subject: { type: Type.STRING, description: "Name of the subject" },
                      code: { type: Type.STRING, description: "Course code, e.g., 'CS301'" },
                      lecturer: { type: Type.STRING, description: "Name of the lecturer" },
                      location: { type: Type.STRING, description: "Location of the class, e.g., 'Hall A'" },
                    },
                    required: ["time", "subject", "code", "lecturer", "location"]
                  }
                }
              },
              required: ["day", "classes"]
            }
          }
        }
      });

      const jsonString = response.text;
      const parsedJson = JSON.parse(jsonString);
      return parsedJson as ClassSchedule[];
  } catch(error) {
      console.error("Error parsing timetable from file:", error);
      throw new Error("Failed to parse timetable. The AI could not understand the document or the document is not a valid timetable.");
  }
};


export const summarizeText = async (text: string): Promise<string> => {
  if (!API_KEY) return "API Key not configured. Please check the console.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert academic assistant. Summarize the following lecture notes or text.
      
      Strictly follow this structure and format the output using simple HTML tags (do not use Markdown ticks or \`\`\`html wrappers):
      
      <div class="summary-container">
        <h3 class="text-lg font-bold text-primary dark:text-dark-primary mb-2">Topic Overview</h3>
        <p class="mb-4">[A concise 1-2 sentence summary of the main topic]</p>
        
        <h4 class="font-semibold text-onSurface dark:text-dark-onSurface mb-1">Key Concepts</h4>
        <ul class="list-disc pl-5 mb-4 space-y-1">
            <li>[Key Point 1]</li>
            <li>[Key Point 2]</li>
            <li>[Key Point 3]</li>
        </ul>

        <h4 class="font-semibold text-onSurface dark:text-dark-onSurface mb-1">Important Details</h4>
        <p class="mb-4 text-sm">[Crucial facts, dates, formulas, or definitions mentioned]</p>
        
        <div class="bg-secondaryContainer/50 dark:bg-dark-secondaryContainer/50 p-3 rounded-lg border-l-4 border-secondary dark:border-dark-secondary">
            <span class="font-bold text-xs uppercase tracking-wide">Action Item:</span>
            <span class="text-sm ml-2">[What needs to be studied or remembered most]</span>
        </div>
      </div>

      Input Text:
      ${text}`,
      config: {
        temperature: 0.3, // Lower temperature for more factual summaries
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    return "<p class='text-error'>Failed to generate summary. Please check the console for details.</p>";
  }
};

export const createStudyBuddyChat = (context?: string, history?: Content[]): Chat => {
  const systemInstruction = `You are Gemini, a helpful, intelligent, and versatile AI assistant integrated into a student's personal dashboard.

  **YOUR IDENTITY:**
  - You are a general-purpose AI (like ChatGPT) but with specific awareness of the student's academic life.
  - Tone: Friendly, concise, and smart.

  **CONTEXT AWARENESS (CRITICAL):**
  - **Academic Year & Semester:** Pay close attention to the student's 'Current Semester' and 'Academic Year' in the provided context. 
    - Use this to tailor your advice (e.g., advice for a 1st-year student differs from a final-year student).
    - If the user asks about their subjects, refer to the "ACADEMIC SUBJECTS" list in the context.
  - **Schedule & Assignments:** You know the student's timetable and pending tasks. Use this when relevant (e.g., "Good luck with your exam on Friday!").
  - **General Knowledge:** If the user asks about general topics (Python, History, Physics), answer freely without needing personal context.

  **STRICT GUIDELINES:**
  1. **Direct Answers:** Don't start with "As an AI..." or "Based on your context...". Just answer naturally.
  2. **Formatting:** Use Markdown. Use **bold** for emphasis, lists for steps, and \`\`\`code blocks\`\`\` for code.
  3. **Privacy:** If specific data (like a syllabus topic) isn't in the context, admit it honestly or provide general knowledge, but don't hallucinate user-specific details.

  ${context ? `\n--- USER CONTEXT (Reference) ---\n${context}` : ''}`;
  
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
    history: history
  });
};
