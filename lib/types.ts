export interface StyleCategory {
  id: string;
  name: string;
  type: "single" | "couple";
  gender?: "male" | "female";
  title?: string;
  subtitle?: string;
  profilePrompt: string;
  galleryPrompts: string[];
  details: {
    tags: string[];
    vibe: string;
    theme: {
      color: string;
      gradient: string;
      emojis: string[];
    };
  };
}
export interface GenerationConfig {
  style: string;
  prompt: string;
  timestamp: string;
}
