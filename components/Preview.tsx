
import React, { useState, useMemo, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Globe } from 'lucide-react';
import { useStore } from '../store';
import { LessonType } from '../types';

export const Preview: React.FC = () => {
  const { course, currentLanguage, isPreviewOpen, togglePreview, setCurrentLanguage } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatLessons = useMemo(() => {
    return course.modules.flatMap(m => 
      m.lessons.map(l => ({
        ...l,
        moduleTitle: m.title
      }))
    );
  }, [course]);

  useEffect(() => {
    if (isPreviewOpen) setCurrentIndex(0);
  }, [isPreviewOpen]);

  if (!isPreviewOpen) return null;

  const currentLesson = flatLessons[currentIndex];
  const lang = currentLanguage;
  const defLang = course.settings.defaultLanguage;

  const t = (record: Record<string, string> | undefined) => {
    if (!record) return '';
    return record[lang] || record[defLang] || '';
  };

  const handleNext = () => {
    if (currentIndex < flatLessons.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-in fade-in duration-300 overflow-hidden">
      {/* Simulation Header */}
      <header 
        className="h-16 px-6 flex items-center justify-between border-b shadow-md z-10"
        style={{ backgroundColor: course.settings.secondaryColor, color: 'white' }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
             <Globe className="w-3 h-3" />
             <select 
              value={currentLanguage} 
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none border-none focus:ring-0 p-0 cursor-pointer"
             >
                {course.settings.languages.map(l => <option key={l.code} value={l.code} className="text-black">{l.name}</option>)}
             </select>
          </div>
          <div className="flex flex-col">
            {currentLesson ? (
              <>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-black">{t(currentLesson.moduleTitle)}</span>
                <h2 className="text-xs font-bold truncate max-w-[200px] md:max-w-md">
                  {t(currentLesson.title)}
                </h2>
              </>
            ) : <h2 className="text-sm font-bold">Simulator</h2>}
          </div>
        </div>
        
        <button onClick={() => togglePreview(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Simulator Frame */}
      <main className="flex-1 overflow-y-auto p-4 md:p-12 bg-white scroll-smooth">
        {flatLessons.length > 0 ? (
          <div className="max-w-3xl mx-auto py-8">
            {currentLesson.type === LessonType.TEXT && (
              <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: t(currentLesson.content.body) }} />
            )}
            {currentLesson.type === LessonType.IMAGE && (
              <img src={t(currentLesson.content.url)} className="rounded-3xl shadow-2xl w-full" alt="content" />
            )}
            {currentLesson.type === LessonType.VIDEO && (
              <div className="aspect-video bg-black rounded-3xl flex items-center justify-center text-white/20 border-8 border-white shadow-2xl">
                <div className="text-center">
                  <Play className="w-16 h-16 opacity-10 mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t(currentLesson.content.url)}</p>
                </div>
              </div>
            )}
            {currentLesson.type === LessonType.QUIZ && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <h2 className="text-4xl font-black text-slate-900">Knowledge Check</h2>
                {currentLesson.content.quiz?.map((q, idx) => (
                  <div key={idx} className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-xl font-extrabold mb-6 text-slate-800 leading-snug">{t(q.text)}</p>
                    <div className="grid gap-3 pl-4">
                      {q.options.map(opt => (
                        <button key={opt.id} className="p-4 text-left bg-white border-2 rounded-2xl hover:border-indigo-500 font-bold text-slate-600 transition-all">
                          {t(opt.text)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 italic">
            Add content to see it in action.
          </div>
        )}
      </main>

      {/* Navigation Simulation */}
      {flatLessons.length > 0 && (
        <footer className="h-20 border-t bg-white px-8 flex items-center justify-between shrink-0 shadow-inner">
          <button onClick={handlePrev} disabled={currentIndex === 0} className="flex items-center space-x-2 px-6 py-2.5 rounded-xl border-2 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-20 transition-all">
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>
          <div className="text-[10px] font-black uppercase text-slate-300 tracking-widest">
            {currentIndex + 1} / {flatLessons.length}
          </div>
          <button 
            onClick={handleNext} 
            className="flex items-center space-x-2 px-10 py-2.5 rounded-xl text-white font-bold transition-all shadow-xl hover:scale-105 active:scale-95"
            style={{ backgroundColor: course.settings.primaryColor }}
          >
            <span>{currentIndex === flatLessons.length - 1 ? 'Finish' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      )}
    </div>
  );
};
