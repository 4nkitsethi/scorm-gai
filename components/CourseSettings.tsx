
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useStore } from '../store';

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'jp', name: 'Japanese' }
];

export const CourseSettings: React.FC = () => {
  const { course, updateSettings, isSettingsOpen, toggleSettings } = useStore();
  const [selectedLangs, setSelectedLangs] = useState(course.settings.languages.map(l => l.code));

  if (!isSettingsOpen) return null;

  const handleLangToggle = (code: string) => {
    const newLangs = selectedLangs.includes(code)
      ? selectedLangs.filter(c => c !== code)
      : [...selectedLangs, code];
    
    // Always keep at least one
    if (newLangs.length === 0) return;
    
    setSelectedLangs(newLangs);
    updateSettings({
      languages: AVAILABLE_LANGUAGES.filter(l => newLangs.includes(l.code))
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Course Settings</h2>
          <button onClick={() => toggleSettings(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          {/* Colors */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Visual Identity</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                    value={course.settings.primaryColor}
                    onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                  />
                  <span className="text-sm font-mono text-slate-500 uppercase">{course.settings.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Secondary Color</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                    value={course.settings.secondaryColor}
                    onChange={(e) => updateSettings({ secondaryColor: e.target.value })}
                  />
                  <span className="text-sm font-mono text-slate-500 uppercase">{course.settings.secondaryColor}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Languages */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Multi-Language Options</h3>
            <p className="text-sm text-slate-500">Select languages supported in this course. You'll be able to toggle between them during content creation.</p>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangToggle(lang.code)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    selectedLangs.includes(lang.code)
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <span>{lang.name}</span>
                  {selectedLangs.includes(lang.code) && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-end">
          <button 
            onClick={() => toggleSettings(false)}
            className="px-6 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all shadow-lg font-bold"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
