
import React, { useState, useMemo, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Play, Info, FileQuestion, Layout } from 'lucide-react';
import { useStore } from '../store';
import { LessonType, Lesson } from '../types';

export const Preview: React.FC = () => {
  const { course, currentLanguage, isPreviewOpen, togglePreview } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [videoWatched, setVideoWatched] = useState<Record<string, boolean>>({});

  const flatLessons = useMemo(() => {
    return course.modules.flatMap(m => 
      m.lessons.map(l => ({
        ...l,
        moduleTitle: m.title[currentLanguage] || m.title[course.settings.defaultLanguage]
      }))
    );
  }, [course, currentLanguage]);

  // Ensure currentIndex stays within bounds if course changes while preview is open
  useEffect(() => {
    if (currentIndex >= flatLessons.length && flatLessons.length > 0) {
      setCurrentIndex(flatLessons.length - 1);
    }
  }, [flatLessons.length, currentIndex]);

  // Reset index when preview is opened
  useEffect(() => {
    if (isPreviewOpen) {
      setCurrentIndex(0);
    }
  }, [isPreviewOpen]);

  if (!isPreviewOpen) return null;

  const currentLesson = flatLessons[currentIndex];
  const lang = currentLanguage;
  const defLang = course.settings.defaultLanguage;

  const getTranslation = (record: Record<string, string> | undefined) => {
    if (!record) return '';
    return record[lang] || record[defLang] || '';
  };

  const handleNext = () => {
    if (currentIndex < flatLessons.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const isNextDisabled = () => {
    if (!currentLesson) return true;
    if (currentLesson.type === LessonType.VIDEO && currentLesson.content.videoRules?.mandatoryWatch) {
      return !videoWatched[currentLesson.id];
    }
    if (currentLesson.type === LessonType.QUIZ) {
      const questions = currentLesson.content.quiz || [];
      return questions.some(q => !quizAnswers[q.id]);
    }
    return false;
  };

  const renderContent = () => {
    if (!currentLesson) return null;

    switch (currentLesson.type) {
      case LessonType.TEXT:
        return (
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: getTranslation(currentLesson.content.body) }}
          />
        );
      case LessonType.IMAGE:
        return (
          <div className="flex flex-col items-center">
             <div className="mb-4 text-center">
                <h2 className="text-xl font-bold text-slate-800">{getTranslation(currentLesson.title)}</h2>
             </div>
            <img 
              src={getTranslation(currentLesson.content.url)} 
              alt="Lesson Content" 
              className="rounded-lg shadow-md max-h-[60vh] object-contain bg-slate-50"
              onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Not+Found')}
            />
          </div>
        );
      case LessonType.VIDEO:
        const videoUrl = getTranslation(currentLesson.content.url);
        return (
          <div className="space-y-6">
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center relative group">
              {videoUrl ? (
                <div className="text-white text-center p-8">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <p className="text-sm font-mono opacity-60 break-all">{videoUrl}</p>
                  <p className="mt-4 text-xs italic opacity-40">(Simulated Video Player)</p>
                </div>
              ) : (
                <div className="text-slate-500 flex flex-col items-center">
                  <AlertCircle className="w-12 h-12 mb-2" />
                  <span>No Video URL provided</span>
                </div>
              )}
            </div>
            {currentLesson.content.videoRules?.mandatoryWatch && !videoWatched[currentLesson.id] && (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center space-x-3 text-blue-700">
                  <Info className="w-5 h-5" />
                  <span className="text-sm font-medium">Please watch the video to proceed.</span>
                </div>
                <button 
                  onClick={() => setVideoWatched(prev => ({ ...prev, [currentLesson.id]: true }))}
                  className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700 transition-colors"
                >
                  Mark as Watched
                </button>
              </div>
            )}
          </div>
        );
      case LessonType.QUIZ:
        return (
          <div className="space-y-8">
            {currentLesson.content.quiz?.map((q, qIdx) => (
              <div key={q.id} className="space-y-4">
                <h4 className="text-lg font-bold text-slate-800">
                  {qIdx + 1}. {getTranslation(q.text)}
                </h4>
                <div className="grid gap-3">
                  {q.options.map((opt) => {
                    const isSelected = quizAnswers[q.id] === opt.id;
                    const showFeedback = quizAnswers[q.id];
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <span className={isSelected ? 'font-semibold text-blue-800' : 'text-slate-600'}>
                          {getTranslation(opt.text)}
                        </span>
                        {showFeedback && opt.isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                        {isSelected && !opt.isCorrect && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const progress = flatLessons.length > 0 ? ((currentIndex + 1) / flatLessons.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col animate-in fade-in duration-300">
      {/* Top Header */}
      <header 
        className="h-16 px-6 flex items-center justify-between border-b shadow-sm"
        style={{ backgroundColor: course.settings.secondaryColor, color: 'white' }}
      >
        <div className="flex flex-col">
          {currentLesson ? (
            <>
              <span className="text-[10px] uppercase tracking-widest opacity-70 font-bold">{currentLesson.moduleTitle}</span>
              <h2 className="text-sm font-bold truncate max-w-md">
                {getTranslation(currentLesson.title)}
              </h2>
            </>
          ) : (
            <h2 className="text-sm font-bold">Course Preview</h2>
          )}
        </div>
        
        <div className="flex items-center space-x-6">
          {flatLessons.length > 0 && (
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold opacity-60 mb-1">Overall Progress</span>
              <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%`, backgroundColor: course.settings.primaryColor }}
                />
              </div>
            </div>
          )}
          <button 
            onClick={() => togglePreview(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-12 bg-white">
        {flatLessons.length > 0 ? (
          <div className="max-w-4xl mx-auto py-8">
            {renderContent()}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="p-6 bg-slate-50 rounded-full">
              <FileQuestion className="w-16 h-16 opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-slate-500">No content to preview</h3>
            <p className="max-w-xs text-center text-sm">
              Add some modules and lessons in the builder to see them here.
            </p>
            <button 
              onClick={() => togglePreview(false)}
              className="mt-4 px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-all"
            >
              Back to Editor
            </button>
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      {flatLessons.length > 0 && (
        <footer className="h-20 border-t bg-slate-50 px-6 flex items-center justify-between shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="text-sm font-bold text-slate-400">
            Lesson {currentIndex + 1} of {flatLessons.length}
          </div>

          <button
            onClick={handleNext}
            disabled={isNextDisabled() || currentIndex === flatLessons.length - 1}
            className="flex items-center space-x-2 px-8 py-2.5 rounded-xl text-white font-bold transition-all shadow-lg disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            style={{ backgroundColor: course.settings.primaryColor }}
          >
            <span>{currentIndex === flatLessons.length - 1 ? 'Finish Course' : 'Next Lesson'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </footer>
      )}
    </div>
  );
};
