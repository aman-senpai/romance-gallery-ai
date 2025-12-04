export interface StyleCategory {
  id: string;
  name: string;
  prompts: string[];
}

export interface GenerationConfig {
  style: string;
  prompt: string;
  timestamp: string;
}
