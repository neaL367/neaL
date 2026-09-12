export interface WebSourceItem {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

export interface WebSearchResult {
  found: boolean;
  answer: string;
  sourceTitle: string;
  sourceUrl: string;
  sources?: WebSourceItem[];
}
