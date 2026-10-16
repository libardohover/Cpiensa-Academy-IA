export type TenantOrg = {
  id: string;
  name: string;
  slug: string;
  country: string;
  studentCount: number;
  activePlan: 'Institución Enterprise' | 'Universidad Campus' | 'Corporativo Pro';
  logoPlaceholder: string;
};

export type UserRole = 'SuperAdmin' | 'OrgAdmin' | 'Profesor/Tutor' | 'Estudiante';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId: string;
  avatar: string;
  enrolledCourseId: string;
  completedLessons: string[];
  certificatesEarned: string[];
  mfaEnabled: boolean;
};

export type Lesson = {
  id: string;
  moduleId: number;
  order: number;
  title: string;
  summary: string;
  durationMinutes: number;
  objectives: string[];
  prerequisites: string[];
  content: string[];
  codeSample?: string;
  reusablePrompt: string;
  exercise: {
    instruction: string;
    expectedOutputFormat: string;
    starterInput: string;
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  rubric: {
    criterion: string;
    excellent: string;
    good: string;
    needsImprovement: string;
  }[];
  resources: {
    title: string;
    type: 'Guía' | 'Código' | 'Dataset' | 'Documento';
    url: string;
  }[];
};

export type CourseModule = {
  id: number;
  title: string;
  shortDesc: string;
  iconName: string;
  lessons: Lesson[];
};

export type AIModel = {
  id: string;
  name: string;
  provider: string;
  family: 'gemini' | 'openai' | 'anthropic' | 'open_models';
  contextWindow: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  status: 'online' | 'degraded' | 'maintenance';
  isDefault?: boolean;
  capabilities: string[];
};

export type PromptVersion = {
  id: string;
  versionNumber: number;
  title: string;
  category: string;
  systemPrompt: string;
  userPromptTemplate: string;
  model: string;
  temperature: number;
  scoreAvg?: number;
  createdAt: string;
  notes: string;
};

export type AgentTool = {
  id: string;
  name: string;
  description: string;
  requiresApproval: boolean;
  enabled: boolean;
};

export type AgentDefinition = {
  id: string;
  name: string;
  roleTitle: string;
  model: string;
  systemPersona: string;
  tools: string[];
  knowledgeBases: string[];
  maxIterations: number;
  temperature: number;
  requireHumanApproval: boolean;
  publishedToMarketplace: boolean;
  runsCount: number;
};

export type WorkflowNode = {
  id: string;
  type: 'trigger' | 'condition' | 'ai_action' | 'approval' | 'integration';
  label: string;
  config: Record<string, any>;
};

export type Workflow = {
  id: string;
  title: string;
  description: string;
  nodes: WorkflowNode[];
  status: 'active' | 'draft' | 'paused';
  totalRuns: number;
  successRate: number;
  lastRunAt?: string;
};

export type KnowledgeDocument = {
  id: string;
  title: string;
  category: 'Legal' | 'Metodología' | 'Casos' | 'Gobernanza';
  fileType: 'PDF' | 'DOCX' | 'MD';
  chunksCount: number;
  uploadedAt: string;
  sizeKb: number;
  status: 'indexed' | 'processing';
  summary: string;
};

export type NoCodeTool = {
  id: string;
  title: string;
  description: string;
  icon: string;
  inputs: {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select';
    placeholder?: string;
    options?: string[];
  }[];
  systemPrompt: string;
  model: string;
  category: string;
  author: string;
};

export type Certificate = {
  code: string;
  studentName: string;
  courseTitle: string;
  issueDate: string;
  institution: string;
  hours: number;
  grade: string;
  skills: string[];
  verificationUrl: string;
  signatureHash: string;
};

export type IntegrationConnector = {
  id: string;
  name: string;
  provider: string;
  icon: string;
  status: 'connected' | 'not_configured' | 'error';
  scopes: string[];
  description: string;
  webhookUrl?: string;
  lastPing?: string;
};
