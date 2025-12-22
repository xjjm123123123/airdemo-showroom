
export enum DemoStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED'
}

export interface DemoStep {
  id: number;
  title: string;
  component: string;
  script: string;
  value: string;
  fallback: string;
}

export interface Demo {
  id: string;
  title: string;
  valueProp: string;
  points: string[];
  audience: string;
  steps: DemoStep[];
  mainTable: any[];
  secondaryTable?: any[];
  secondaryTables?: {
    management?: any[];
    equipment?: any[];
    factory?: any[];
  };
  aiInsights: {
    conclusion: string;
    risks: string[];
    actions: string[];
    next: string;
  };
}

export interface BotCard {
  title: string;
  fields: { label: string; value: string }[];
  actions: { label: string; primary?: boolean }[];
}
