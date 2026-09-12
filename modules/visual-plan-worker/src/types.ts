export type Bindings = {
  CLAUDE_CODE_SERVICE_URL: string;
  CLAUDE_CODE_SERVICE_SECRET: string;
  VISUAL_SERVICE_URL: string;
  R2_BUCKET_NAME: string;
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  AI: Ai;
};

export type PlanStep = {
  label: string;
  sublabel: string;
  milestone: boolean;
  durationDays: number | null;
  imagePrompt?: string;
};

export type StructuredPlan = {
  title: string;
  isCycle?: boolean;
  totalDays: number;
  steps: PlanStep[];
};

export type GenerateResult = StructuredPlan & {
  planId: string;
  gifUrl: string;
  mp4Url: string;
};
