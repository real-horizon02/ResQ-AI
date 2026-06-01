/**
 * Simple CSV parser for parsing fire/incident data from NASA FIRMS and similar APIs
 */

export interface FireData {
  latitude: string | number;
  longitude: string | number;
  [key: string]: any;
}

/**
 * Parse CSV string into array of objects
 * Handles NASA FIRMS CSV format
 * @param csvData - Raw CSV string
 * @returns Array of parsed objects
 */
export function parseCSV(csvData: string): FireData[] {
  if (!csvData || typeof csvData !== 'string') {
    console.warn('[csvParser] Invalid CSV data provided');
    return [];
  }

  const lines = csvData.trim().split('\n');
  
  if (lines.length < 2) {
    console.warn('[csvParser] CSV has no data rows');
    return [];
  }

  // First line is header
  const headers = lines[0].split(',').map(h => h.trim());
  
  const result: FireData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;

    // Parse CSV line (handles quoted values)
    const values = parseCSVLine(line);
    
    if (values.length !== headers.length) {
      console.warn(`[csvParser] Line ${i} has ${values.length} values, expected ${headers.length}`);
      continue;
    }

    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      obj[header.toLowerCase()] = values[index];
    });

    result.push(obj as FireData);
  }

  return result;
}

/**
 * Parse a single CSV line handling quoted values
 * @param line - CSV line string
 * @returns Array of values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}
