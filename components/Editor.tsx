
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import { 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Video, 
  Eye, 
  Type as TypeIcon, 
  Image as ImageIcon,
  HelpCircle
} from 'lucide-react';
import { useStore } from '../store';
import { LessonType, Lesson, QuizQuestion } from '../types';

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

  if (!activeModuleId && !activeLessonId) {
    return (
      <div className="flex-1 p-8 overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-slate-800">Course Overview</h1>
          <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Course Title ({currentLanguage})</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={course.title[currentLanguage] || ''}
                onChange={(e) => updateCourseInfo(e.target.value, course.description[currentLanguage] || '')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Description ({currentLanguage})</label>
              <textarea 
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none h-32"
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
      <div className="flex-1 p-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Module Settings</h1>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <label className="block text-sm font-medium text-slate-500 mb-1">Module Title ({currentLanguage})</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
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
            <label className="block text-sm font-medium text-slate-500">Rich Text Content ({currentLanguage})</label>
            <div className="bg-white border rounded-md">
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
          <div className="space-y-6">
             <div className="p-4 bg-slate-50 border rounded-lg">
                <label className="block text-sm font-medium text-slate-500 mb-2">Image URL ({currentLanguage})</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                  value={activeLesson.content.url?.[currentLanguage] || ''}
                  onChange={(e) => handleContentChange({ url: { ...activeLesson.content.url, [currentLanguage]: e.target.value } })}
                />
             </div>
             {activeLesson.content.url?.[currentLanguage] && (
               <div className="border rounded-lg overflow-hidden shadow-sm">
                 <img 
                   src={activeLesson.content.url[currentLanguage]} 
                   alt="Preview" 
                   className="w-full max-h-96 object-contain bg-slate-100"
                   onError={(e) => (e.currentTarget.src = 'https://picsum.photos/400/300?text=Invalid+Image')}
                 />
               </div>
             )}
          </div>
        );

      case LessonType.VIDEO:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Video URL ({currentLanguage})</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Direct video link or YouTube/Vimeo"
                  value={activeLesson.content.url?.[currentLanguage] || ''}
                  onChange={(e) => handleContentChange({ url: { ...activeLesson.content.url, [currentLanguage]: e.target.value } })}
                />
              </div>
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="mandatory" 
                  className="w-4 h-4 text-blue-600 rounded"
                  checked={activeLesson.content.videoRules?.mandatoryWatch || false}
                  onChange={(e) => handleContentChange({ videoRules: { mandatoryWatch: e.target.checked } })}
                />
                <label htmlFor="mandatory" className="text-sm text-slate-700">Learner must watch full video to complete lesson</label>
              </div>
            </div>
            {activeLesson.content.url?.[currentLanguage] && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center text-white">
                <Video className="w-12 h-12 opacity-50" />
                <span className="ml-2 font-medium">Video Player Placeholder</span>
              </div>
            )}
          </div>
        );

      case LessonType.QUIZ:
        const quiz = activeLesson.content.quiz || [];
        
        const addQuestion = () => {
          const newQ: QuizQuestion = {
            id: `q-${Date.now()}`,
            text: { [currentLanguage]: 'New Question' },
            options: [
              { id: 'o1', text: { [currentLanguage]: 'Option 1' }, isCorrect: true },
              { id: 'o2', text: { [currentLanguage]: 'Option 2' }, isCorrect: false }
            ]
          };
          handleContentChange({ quiz: [...quiz, newQ] });
        };

        const updateQuestion = (qid: string, text: string) => {
          handleContentChange({
            quiz: quiz.map(q => q.id === qid ? { ...q, text: { ...q.text, [currentLanguage]: text } } : q)
          });
        };

        const addOption = (qid: string) => {
          handleContentChange({
            quiz: quiz.map(q => q.id === qid ? { 
              ...q, 
              options: [...q.options, { id: `o-${Date.now()}`, text: { [currentLanguage]: 'New Option' }, isCorrect: false }] 
            } : q)
          });
        };

        const setCorrectOption = (qid: string, oid: string) => {
          handleContentChange({
            quiz: quiz.map(q => q.id === qid ? { 
              ...q, 
              options: q.options.map(o => ({ ...o, isCorrect: o.id === oid })) 
            } : q)
          });
        };

        const updateOptionText = (qid: string, oid: string, text: string) => {
          handleContentChange({
            quiz: quiz.map(q => q.id === qid ? { 
              ...q, 
              options: q.options.map(o => o.id === oid ? { ...o, text: { ...o.text, [currentLanguage]: text } } : o) 
            } : q)
          });
        };

        const removeQuestion = (qid: string) => {
          handleContentChange({ quiz: quiz.filter(q => q.id !== qid) });
        };

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-500">Questions ({currentLanguage})</label>
              <button 
                onClick={addQuestion}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
            
            <div className="space-y-8">
              {quiz.map((q, idx) => (
                <div key={q.id} className="p-6 border border-slate-200 rounded-xl bg-slate-50/30 shadow-sm relative group">
                  <button 
                    onClick={() => removeQuestion(q.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="mb-4">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-tight">Question {idx + 1}</span>
                    <input 
                      type="text" 
                      className="w-full mt-1 p-2 bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none font-medium"
                      value={q.text[currentLanguage] || ''}
                      onChange={(e) => updateQuestion(q.id, e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    {q.options.map((o) => (
                      <div key={o.id} className="flex items-center space-x-2">
                        <button onClick={() => setCorrectOption(q.id, o.id)}>
                          {o.isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-slate-300 hover:text-blue-400" />}
                        </button>
                        <input 
                          type="text" 
                          className={`flex-1 p-2 text-sm rounded-md border ${o.isCorrect ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'} outline-none focus:ring-1 focus:ring-blue-500`}
                          value={o.text[currentLanguage] || ''}
                          onChange={(e) => updateOptionText(q.id, o.id, e.target.value)}
                        />
                      </div>
                    ))}
                    <button 
                      onClick={() => addOption(q.id)}
                      className="text-sm text-blue-600 font-medium hover:underline mt-2 ml-7"
                    >
                      + Add Option
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
    <div className="flex-1 overflow-y-auto bg-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-4 border-b pb-6">
          <div className="flex items-center space-x-2 text-slate-400 text-sm">
            <span>{activeModule?.title[currentLanguage] || 'Untitled Module'}</span>
            <span>/</span>
            <span className="flex items-center space-x-1">
              {activeLesson.type === LessonType.TEXT && <TypeIcon className="w-3.5 h-3.5" />}
              {activeLesson.type === LessonType.IMAGE && <ImageIcon className="w-3.5 h-3.5" />}
              {activeLesson.type === LessonType.VIDEO && <Video className="w-3.5 h-3.5" />}
              {activeLesson.type === LessonType.QUIZ && <HelpCircle className="w-3.5 h-3.5" />}
              <span>Lesson</span>
            </span>
          </div>
          <input 
            type="text" 
            className="text-3xl font-bold text-slate-800 bg-transparent border-none outline-none w-full placeholder-slate-300"
            value={activeLesson.title[currentLanguage] || ''}
            onChange={(e) => handleLessonTitleChange(e.target.value)}
            placeholder="Lesson Title"
          />
        </header>

        <main className="pb-20">
          {renderLessonEditor()}
        </main>
      </div>
    </div>
  );
};
