export interface DetailedTopic {
  id: string;
  keywords: string[];
  title: string;
  summary: string;
  detail: string;
  level: 'beginner' | 'intermediate' | 'expert';
  relatedConcepts: string[];
  category: 'javascript' | 'typescript' | 'react' | 'css' | 'web' | 'architecture' | 'tools';
}
