
export const parseTime = (input: any): [Date, Date] | [null, null] => {
    try {
        // robustly handle null, undefined, or non-string inputs
        if (input === null || input === undefined) return [null, null];
        
        const timeStr = String(input).trim();
        if (!timeStr) return [null, null];

        const now = new Date();
        
        // Flexible splitter: matches " - ", "-", " to ", en-dash, em-dash, math minus, with optional surrounding spaces
        // This fixes inputs like "9:00 AM -10 AM" and "10:00 am-11 am"
        const parts = timeStr.split(/\s*(?:-|–|—|−|to)\s*/i);

        // Handle cases where split might result in empty parts or insufficient parts (e.g. "werbtv")
        if (parts.length < 2) {
            return [null, null];
        }

        const parseOne = (t: string): Date | null => {
            if (!t) return null;
            t = t.trim();
            
            // Matches HH:MM or HH (optional AM/PM)
            const match = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
            
            if (!match) return null;

            let hours = parseInt(match[1], 10);
            const minutes = match[2] ? parseInt(match[2], 10) : 0;
            const period = match[3] ? match[3].toLowerCase() : null;

            if (hours > 24) return null; // Simple sanity check

            if (period === 'pm' && hours < 12) hours += 12;
            if (period === 'am' && hours === 12) hours = 0;
            
            const date = new Date(now);
            date.setHours(hours, minutes, 0, 0);
            return date;
        };

        const startDate = parseOne(parts[0]);
        const endDate = parseOne(parts[1]);

        if (!startDate || !endDate) return [null, null];

        return [startDate, endDate];
    } catch (e) {
        console.error("Error parsing time string:", input, e);
        return [null, null];
    }
};

export const formatDueDate = (dueDate: string) => {
    try {
        if (!dueDate) return "No date";
        
        const due = new Date(dueDate);
        if (isNaN(due.getTime())) return "Invalid date";

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date
        due.setHours(0, 0, 0, 0); // Normalize due date for comparison
        
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
        if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day(s)`;
        if (diffDays === 0) return "Due today";
        if (diffDays === 1) return "Due tomorrow";
        return `Due in ${diffDays} days`;
    } catch (e) {
        return "Invalid date";
    }
};
