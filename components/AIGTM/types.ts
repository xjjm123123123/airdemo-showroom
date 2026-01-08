export interface SuggestionCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface TableRow {
  id: string;
  company: string;
  logo: string;
  domain: string;
  industry: string;
  size: string;
  enrichmentStatus: 'complete' | 'loading' | 'pending';
  enrichmentValue: string;
}

export interface EnrichmentTool {
  id: string;
  name: string;
  description: string;
  provider: string;
  icon: string;
  cost: number;
  link?: string;
  categories: string[];
}
