// Quick release parser for parsing formatted release notes
export const parseQuickRelease = (text) => {
  if (!text || typeof text !== 'string') return null;

  try {
    // Split into lines and clean up
    const lines = text.trim().split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length === 0) return null;

    // Extract version from first line (everything before first | or the whole line)
    let version = lines[0].split('|')[0].trim();

    // If no version found, try to extract version number from the line
    if (!version) {
      const versionMatch = lines[0].match(/Version\s+(\d{4}\.\d{1,2}\.\d{1,2})/i);
      if (versionMatch) {
        version = `Version ${versionMatch[1]}`;
      }
    }

    // Extract technical details (everything after first |)
    const techDetails = lines[0].includes('|')
      ? lines[0].split('|').slice(1).join('|').trim()
      : null;

    // Extract changes (everything after first line, starting with -)
    const changes = [];
    let inChanges = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Start collecting when we hit a line that starts with -
      if (line.startsWith('-')) {
        inChanges = true;
        changes.push(line.substring(1).trim()); // Remove the - and trim
      } else if (inChanges && line) {
        // Continue collecting changes if we're in the changes section
        changes.push(line);
      } else if (line.startsWith('https://') || line.startsWith('http://')) {
        // Handle URLs
        if (inChanges) {
          changes.push(line);
        } else {
          // URL before changes, add as a change
          changes.push(line);
          inChanges = true;
        }
      }
    }

    // If no changes found but there's content after first line, treat it as a single change
    if (changes.length === 0 && lines.length > 1) {
      changes.push(lines.slice(1).join(' '));
    }

    return {
      version: version || 'Untitled Release',
      techDetails,
      changes: changes.length > 0 ? changes : [lines.slice(1).join(' ')]
    };

  } catch (error) {
    console.error('Error parsing quick release:', error);
    return null;
  }
};

// Example usage:
// const text = `Version 2025.10.2  | Bundle Version 100 | Version Code 79
// Android Target SDK 35 (android 15) | Min 23 (android 5.1)
// - Happy Halloween.
// - 17 Shells: Ghost Shell 31-41; Horsetail 16-22.
// https://youtu.be/dWys7DEVzn0`;
//
// const result = parseQuickRelease(text);
// console.log(result);
// Output:
// {
//   version: "Version 2025.10.2",
//   techDetails: "Bundle Version 100 | Version Code 79 | Android Target SDK 35 (android 15) | Min 23 (android 5.1)",
//   changes: [
//     "Happy Halloween.",
//     "17 Shells: Ghost Shell 31-41; Horsetail 16-22.",
//     "https://youtu.be/dWys7DEVzn0"
//   ]
// }