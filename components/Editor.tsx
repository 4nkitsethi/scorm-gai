
import React from 'react';
import ReactQuill from 'react-quill';
import { 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Video, 
  Type as TypeIcon, 
  Image as ImageIcon,
  HelpCircle,
  Hash,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../store';
import { LessonType, QuizQuestion } from '../types';

export const Editor: React.FC = () => {
  const { 
    course, 
    activeModuleId, 
    activeLessonId, 
    currentLanguage, 
    updateLesson, 
    updateModule,
    updateCourseInfo
  } = useStore();

  const activeModule = course.modules.find(m => m.id === activeModuleId);
  const activeLesson = activeModule?.lessons.find(l => l.id === activeLessonId);

  const cardClass = "bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-6";
  const labelClass = "text-xs font-black text-slate-400 uppercase tracking-widest block mb-2";
  const inputClass = "w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all font-medium text-slate-800";

  if (!activeModuleId && !activeLessonId) {
    return (
      <div className="flex-1 p-12 overflow-y-auto bg-slate-50/30">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex items-center space-x-4">
             <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100">
                <Hash className="w-8 h-8 text-white" />
             </div>
             <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Course Meta</h1>
                <p className="text-slate-400 font-medium">Define your course fundamentals.</p>
             </div>
          </div>
          
          <div className={cardClass}>
            <div>
              <label className={labelClass}>Project Title ({currentLanguage})</label>
              <input 
                type="text" 
                className={inputClass}
                value={course.title[currentLanguage] || ''}
                placeholder="Ex: Master Class in UX Design"
                onChange={(e) => updateCourseInfo(e.target.value, course.description[currentLanguage] || '')}
              />
            </div>
            <div>
              <label className={labelClass}>Description ({currentLanguage})</label>
              <textarea 
                className={`${inputClass} h-40 resize-none`}
                placeholder="What will learners achieve?"
                value={course.description[currentLanguage] || ''}
                onChange={(e) => updateCourseInfo(course.title[currentLanguage] || '', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeModuleId && !activeLessonId) {
    return (
      <div className="flex-1 p-12 bg-slate-50/30">
        <div className="max-w-4xl mx-auto space-y-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Module Config</h1>
          <div className={cardClass}>
            <label className={labelClass}>Module Title ({currentLanguage})</label>
            <input 
              type="text" 
              className={inputClass}
              value={activeModule?.title[currentLanguage] || ''}
              onChange={(e) => updateModule(activeModuleId, e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!activeLesson) return null;

  const handleLessonTitleChange = (val: string) => {
    updateLesson(activeModuleId!, activeLessonId!, {
      title: { ...activeLesson.title, [currentLanguage]: val }
    });
  };

  const handleContentChange = (updates: any) => {
    updateLesson(activeModuleId!, activeLessonId!, {
      content: { ...activeLesson.content, ...updates }
    });
  };

  const renderLessonEditor = () => {
    switch (activeLesson.type) {
      case LessonType.TEXT:
        return (
          <div className="space-y-4">
            <label className={labelClass}>Visual Editor ({currentLanguage})</label>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-inner">
              <ReactQuill 
                theme="snow" 
                value={activeLesson.content.body?.[currentLanguage] || ''}
                onChange={(val) => handleContentChange({ body: { ...activeLesson.content.body, [currentLanguage]: val } })}
              />
            </div>
          </div>
        );

      case LessonType.IMAGE:
        return (
          <div className="space-y-8">
             <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl">
                <label className={labelClass}>Asset URL ({currentLanguage})</label>
                <input 
                  type="text" 
                  className={inputClass}
                  placeholder="https://images.unsplash.com/..."
                  value={activeLesson.content.url?.[currentLanguage] || ''}
                  onChange={(e) => handleContentChange({ url: { ...activeLesson.content.url, [currentLanguage]: e.target.value } })}
                />
             </div>
             {activeLesson.content.url?.[currentLanguage] && (
               <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                 <img 
                   src={activeLesson.content.url[currentLanguage]} 
                   alt="Preview" 
                   className="w-full max-h-[500px] object-cover bg-slate-100"
                   onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image')}
                 />
               </div>
             )}
          </div>
        );

      case LessonType.VIDEO:
        return (
          <div className="space-y-10">
            <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl space-y-6">
              <div>
                <label className={labelClass}>Stream Provider URL ({currentLanguage})</label>
                <input 
                  type="text" 
                  className={inputClass}
                  placeholder="YouTube, Vimeo, or MP4 URL"
                  value={activeLesson.content.url?.[currentLanguage] || ''}
                  onChange={(e) => handleContentChange({ url: { ...activeLesson.content.url, [currentLanguage]: e.target.value } })}
                />
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-slate-100">
                <input 
                  type="checkbox" 
                  id="mandatory" 
                  className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                  checked={activeLesson.content.videoRules?.mandatoryWatch || false}
                  onChange={(e) => handleContentChange({ videoRules: { mandatoryWatch: e.target.checked } })}
                />
                <label htmlFor="mandatory" className="text-sm font-bold text-slate-600 cursor-pointer">
                  Strict Compliance: Learner must finish video to continue
                </label>
              </div>
            </div>
            {activeLesson.content.url?.[currentLanguage] && (
              <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center text-white/40 ring-8 ring-white shadow-2xl">
                <div className="text-center">
                    <Video className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <span className="font-black uppercase tracking-widest text-xs">Video Content Ready</span>
                </div>
              </div>
            )}
          </div>
        );

      case LessonType.QUIZ:
        const quiz = activeLesson.content.quiz || [];
        
        const addQuestion = () => {
          const newQ: QuizQuestion = {
            id: `q-${Date.now()}`,
            text: { [currentLanguage]: 'New Knowledge Check' },
            options: [
              { id: 'o1', text: { [currentLanguage]: 'Option A' }, isCorrect: true },
              { id: 'o2', text: { [currentLanguage]: 'Option B' }, isCorrect: false }
            ]
          };
          handleContentChange({ quiz: [...quiz, newQ] });
        };

        const removeQuestion = (qid: string) => {
          handleContentChange({ quiz: quiz.filter(q => q.id !== qid) });
        };

        return (
          <div className="space-y-10">
            <div className="flex justify-between items-center bg-slate-100/50 p-6 rounded-3xl border border-slate-200">
              <div>
                <h3 className="font-black text-slate-800 text-lg tracking-tight leading-none mb-1">Assessment Builder</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{quiz.length} Questions Created</p>
              </div>
              <button 
                onClick={addQuestion}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
            
            <div className="space-y-12 pb-20">
              {quiz.map((q, idx) => (
                <div key={q.id} className="p-10 border border-slate-100 rounded-[2.5rem] bg-white shadow-xl shadow-slate-100 relative group/q animate-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                  <button 
                    onClick={() => removeQuestion(q.id)}
                    className="absolute -top-4 -right-4 bg-white shadow-lg p-2.5 text-slate-400 hover:text-red-500 rounded-2xl border border-slate-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="mb-8 flex items-start space-x-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shrink-0">
                        {idx + 1}
                    </div>
                    <div className="flex-1">
                        <label className={labelClass}>Question Text</label>
                        <input 
                        type="text" 
                        className="w-full p-4 bg-transparent border-b-2 border-slate-100 focus:border-indigo-500 outline-none font-black text-xl text-slate-800 transition-all placeholder-slate-200"
                        value={q.text[currentLanguage] || ''}
                        placeholder="Type your question here..."
                        onChange={(e) => handleContentChange({
                            quiz: quiz.map(item => item.id === q.id ? { ...item, text: { ...item.text, [currentLanguage]: e.target.value } } : item)
                        })}
                        />
                    </div>
                  </div>
                  <div className="grid gap-4 pl-14">
                    {q.options.map((o) => (
                      <div key={o.id} className="flex items-center space-x-4 animate-in slide-in-from-left-2">
                        <button 
                            onClick={() => handleContentChange({
                                quiz: quiz.map(item => item.id === q.id ? { 
                                ...item, 
                                options: item.options.map(opt => ({ ...opt, isCorrect: opt.id === o.id })) 
                                } : item)
                            })}
                        >
                          {o.isCorrect ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-slate-200 hover:text-indigo-400" />}
                        </button>
                        <input 
                          type="text" 
                          className={`flex-1 p-4 text-sm rounded-2xl border-2 transition-all ${o.isCorrect ? 'border-green-100 bg-green-50/50 text-green-900' : 'border-slate-50 bg-slate-50 focus:bg-white text-slate-600 focus:border-indigo-200'} outline-none font-bold`}
                          value={o.text[currentLanguage] || ''}
                          onChange={(e) => handleContentChange({
                            quiz: quiz.map(item => item.id === q.id ? { 
                                ...item, 
                                options: item.options.map(opt => opt.id === o.id ? { ...opt, text: { ...opt.text, [currentLanguage]: e.target.value } } : opt) 
                            } : item)
                          })}
                        />
                      </div>
                    ))}
                    <button 
                      onClick={() => handleContentChange({
                        quiz: quiz.map(item => item.id === q.id ? { 
                          ...item, 
                          options: [...item.options, { id: `o-${Date.now()}`, text: { [currentLanguage]: 'New Option' }, isCorrect: false }] 
                        } : item)
                      })}
                      className="flex items-center space-x-2 text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 mt-4 ml-10 group"
                    >
                      <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                      <span>Append Choice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/30 p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-6 pb-10 border-b border-slate-200/50">
          <div className="flex items-center space-x-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">{activeModule?.title[currentLanguage] || 'Module'}</span>
            <ArrowRight className="w-3 h-3" />
            <span className="flex items-center space-x-1">
              {activeLesson.type === LessonType.TEXT && <TypeIcon className="w-3.5 h-3.5" />}
              {activeLesson.type === LessonType.IMAGE && <ImageIcon className="w-3.5 h-3.5" />}
              {activeLesson.type === LessonType.VIDEO && <Video className="w-3.5 h-3.5" />}
              {activeLesson.type === LessonType.QUIZ && <HelpCircle className="w-3.5 h-3.5" />}
              <span>{activeLesson.type} Lesson</span>
            </span>
          </div>
          <input 
            type="text" 
            className="text-5xl font-black text-slate-900 bg-transparent border-none outline-none w-full placeholder-slate-200 tracking-tight"
            value={activeLesson.title[currentLanguage] || ''}
            onChange={(e) => handleLessonTitleChange(e.target.value)}
            placeholder="Untitled Lesson"
          />
        </header>

        <main className="pb-32">
          {renderLessonEditor()}
        </main>
      </div>
    </div>
  );
};
