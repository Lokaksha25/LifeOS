
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  timestamp: number;
  mood?: string;
  aiReflection?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

export interface StatItem {
  name: string;
  value: number;
  total: number;
}
