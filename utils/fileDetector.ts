export type FileType = 'world' | 'combined' | 'daily' | 'killDates' | 'unknown';

export function detectFileType(filename: string, content: string): FileType {
  // Check filename patterns first
  if (filename.includes('ALL_WORLDS_COMBINED')) {
    return 'combined';
  }

  if (filename.match(/RubinOT_Kills_[A-Z][a-z]+\.txt/)) {
    return 'world';
  }

  // Check content patterns
  if (content.includes('RUBINOT DAILY UPDATE')) {
    return 'daily';
  }

  if (content.includes('RubinOT COMPLETE KILL DATES')) {
    return 'killDates';
  }

  if (content.includes('RubinOT Boss Kill Tracker -') && content.includes('Last Updated:')) {
    return 'world';
  }

  if (content.includes('COMBINED STATISTICS')) {
    return 'combined';
  }

  return 'unknown';
}

export function extractWorldName(filename: string): string | null {
  const match = filename.match(/RubinOT_Kills_([^.]+)\.txt/);
  return match ? match[1] : null;
}
