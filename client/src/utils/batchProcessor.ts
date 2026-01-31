import { EditorElement } from '../store/editorStore';


export interface BatchRow {
    [key: string]: string;
}

export interface GeneratedCard {
    id: string;
    elements: EditorElement[];
    data: BatchRow; // The specific row data used
}

/**
 * Validates file extension
 */
export const isValidCSV = (file: File): boolean => {
    return file.name.toLowerCase().endsWith('.csv');
};

/**
 * Parses a CSV file string into an array of objects.
 * Assumes first row is header.
 */
export const parseCSV = async (file: File): Promise<BatchRow[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return resolve([]);

            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) return resolve([]); // Need at least header + 1 row

            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '')); // Remove quotes

            const data: BatchRow[] = [];

            for (let i = 1; i < lines.length; i++) {
                // Basic CSV split, doesn't handle commas inside quotes perfectly
                // For a prototype, this is often acceptable, but a library like PapaParse is better for prod
                const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));

                if (values.length === headers.length) {
                    const row: BatchRow = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index];
                    });
                    data.push(row);
                }
            }
            resolve(data);
        };

        reader.onerror = () => reject('Error reading file');
        reader.readAsText(file);
    });
};

/**
 * Generates previews by replacing placeholders in the template with row data.
 * @param templateElements The base design elements
 * @param data Array of parsed CSV rows
 */
export const generateBatchPreviews = (templateElements: EditorElement[], data: BatchRow[]): GeneratedCard[] => {
    return data.map((row, index) => {
        // Deep copy elements for this card
        const cardElements = JSON.parse(JSON.stringify(templateElements)).map((el: EditorElement) => {
            if (el.type === 'text' && el.text) {
                let newText = el.text;

                // Replace all {{Key}} or {Key} patterns
                Object.keys(row).forEach(key => {
                    const value = row[key];
                    // Replace {Name} or {{Name}} case-insensitive
                    const regex = new RegExp(`{{?${key}}}?`, 'gi');
                    newText = newText.replace(regex, value);
                });

                return { ...el, text: newText };
            }
            return el;
        });

        return {
            id: `card-${index}`,
            elements: cardElements,
            data: row
        };
    });
};
