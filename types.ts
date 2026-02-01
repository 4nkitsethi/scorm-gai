
export type LanguageCode = string;

export enum LessonType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  QUIZ = 'QUIZ'
}

export interface QuizQuestion {
  id: string;
  text: Record<LanguageCode, string>;
  options: {
    id: string;
    text: Record<LanguageCode, string>;
    isCorrect: boolean;
  }[];
}

export interface Lesson {
  id: string;
  type: LessonType;
  title: Record<LanguageCode, string>;
  content: {
    body?: Record<LanguageCode, string>;
    url?: Record<LanguageCode, string>;
    videoRules?: {
      mandatoryWatch: boolean;
    };
    quiz?: QuizQuestion[];
  };
}

export interface Module {
  id: string;
  title: Record<LanguageCode, string>;
  lessons: Lesson[];
}

export interface CourseSettings {
  primaryColor: string;
  secondaryColor: string;
  languages: { code: string; name: string }[];
  defaultLanguage: string;
}

export interface Course {
  id: string;
  title: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
  settings: CourseSettings;
  modules: Module[];
}

export interface AppState {
  course: Course;
  activeModuleId: string | null;
  activeLessonId: string | null;
  currentLanguage: LanguageCode;
  isSettingsOpen: boolean;
  isPreviewOpen: boolean;
}
