
import { create } from 'zustand';
import { Course, LessonType, AppState, LanguageCode, Module, Lesson } from './types';

interface CourseStore extends AppState {
  setCourse: (course: Course) => void;
  updateCourseInfo: (title: string, description: string) => void;
  updateSettings: (settings: Partial<Course['settings']>) => void;
  setCurrentLanguage: (lang: LanguageCode) => void;
  setActiveModule: (id: string | null) => void;
  setActiveLesson: (moduleId: string | null, lessonId: string | null) => void;
  addModule: () => void;
  deleteModule: (id: string) => void;
  updateModule: (id: string, title: string) => void;
  reorderModules: (modules: Module[]) => void;
  addLesson: (moduleId: string, type: LessonType) => void;
  deleteLesson: (moduleId: string, lessonId: string) => void;
  updateLesson: (moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  reorderLessons: (moduleId: string, lessons: Lesson[]) => void;
  toggleSettings: (open: boolean) => void;
  togglePreview: (open: boolean) => void;
}

const DEFAULT_LANG = 'en';

const initialCourse: Course = {
  id: 'course-1',
  title: { [DEFAULT_LANG]: 'New Custom Course' },
  description: { [DEFAULT_LANG]: 'Enter course description here' },
  settings: {
    primaryColor: '#3b82f6',
    secondaryColor: '#1e293b',
    languages: [{ code: 'en', name: 'English' }],
    defaultLanguage: 'en',
  },
  modules: []
};

export const useStore = create<CourseStore>((set) => ({
  course: initialCourse,
  activeModuleId: null,
  activeLessonId: null,
  currentLanguage: DEFAULT_LANG,
  isSettingsOpen: false,
  isPreviewOpen: false,

  setCourse: (course) => set({ course }),
  
  updateCourseInfo: (title, description) => set((state) => ({
    course: {
      ...state.course,
      title: { ...state.course.title, [state.currentLanguage]: title },
      description: { ...state.course.description, [state.currentLanguage]: description }
    }
  })),

  updateSettings: (settings) => set((state) => ({
    course: { ...state.course, settings: { ...state.course.settings, ...settings } }
  })),

  setCurrentLanguage: (lang) => set({ currentLanguage: lang }),
  
  setActiveModule: (id) => set({ activeModuleId: id, activeLessonId: null }),
  
  setActiveLesson: (moduleId, lessonId) => set({ activeModuleId: moduleId, activeLessonId: lessonId }),

  addModule: () => set((state) => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: { [state.currentLanguage]: 'New Module' },
      lessons: []
    };
    return {
      course: { ...state.course, modules: [...state.course.modules, newModule] },
      activeModuleId: newModule.id,
      activeLessonId: null
    };
  }),

  deleteModule: (id) => set((state) => ({
    course: { ...state.course, modules: state.course.modules.filter(m => m.id !== id) },
    activeModuleId: state.activeModuleId === id ? null : state.activeModuleId,
    activeLessonId: state.activeModuleId === id ? null : state.activeLessonId
  })),

  updateModule: (id, title) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.map(m => 
        m.id === id ? { ...m, title: { ...m.title, [state.currentLanguage]: title } } : m
      )
    }
  })),

  reorderModules: (modules) => set((state) => ({
    course: { ...state.course, modules }
  })),

  addLesson: (moduleId, type) => set((state) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      type,
      title: { [state.currentLanguage]: `New ${type.toLowerCase()} lesson` },
      content: {
        body: type === LessonType.TEXT ? { [state.currentLanguage]: '' } : undefined,
        url: (type === LessonType.IMAGE || type === LessonType.VIDEO) ? { [state.currentLanguage]: '' } : undefined,
        videoRules: type === LessonType.VIDEO ? { mandatoryWatch: false } : undefined,
        quiz: type === LessonType.QUIZ ? [] : undefined
      }
    };
    
    return {
      course: {
        ...state.course,
        modules: state.course.modules.map(m => 
          m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
        )
      },
      activeLessonId: newLesson.id,
      activeModuleId: moduleId
    };
  }),

  deleteLesson: (moduleId, lessonId) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.map(m => 
        m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m
      )
    },
    activeLessonId: state.activeLessonId === lessonId ? null : state.activeLessonId
  })),

  updateLesson: (moduleId, lessonId, updates) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.map(m => 
        m.id === moduleId ? {
          ...m,
          lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l)
        } : m
      )
    }
  })),

  reorderLessons: (moduleId, lessons) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.map(m => m.id === moduleId ? { ...m, lessons } : m)
    }
  })),

  toggleSettings: (open) => set({ isSettingsOpen: open }),
  togglePreview: (open) => set({ isPreviewOpen: open })
}));
