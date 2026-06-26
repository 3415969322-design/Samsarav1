export const examQuestionTypes = [
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "SHORT_ANSWER",
] as const;

export const examDifficulties = ["EASY", "MEDIUM", "HARD"] as const;

export const examPracticeModes = ["SEQUENTIAL", "RANDOM", "WRONG_ONLY"] as const;

export type ExamQuestionType = (typeof examQuestionTypes)[number];
export type ExamDifficulty = (typeof examDifficulties)[number];
export type ExamPracticeMode = (typeof examPracticeModes)[number];

export type MultipleChoiceAnswer = {
  correctIndex: number;
  correctText: string;
  type: "MULTIPLE_CHOICE";
};

export type TrueFalseAnswer = {
  type: "TRUE_FALSE";
  value: boolean;
};

export type ShortAnswer = {
  keywords: string[];
  text: string;
  type: "SHORT_ANSWER";
};

export type ExamAnswerPayload =
  | MultipleChoiceAnswer
  | TrueFalseAnswer
  | ShortAnswer;

export type GeneratedKnowledgePoint = {
  difficulty: ExamDifficulty;
  orderIndex: number;
  summary: string;
  title: string;
};

export type GeneratedQuestion = {
  answer: ExamAnswerPayload;
  difficulty: ExamDifficulty;
  explanation: string;
  knowledgePointIndex: number;
  options?: string[];
  stem: string;
  type: ExamQuestionType;
};

export type GeneratedExam = {
  knowledgePoints: GeneratedKnowledgePoint[];
  questions: GeneratedQuestion[];
};

export type ParsedExamFile = {
  contentText: string;
  filename: string;
  mimeType: string;
  size: number;
};
