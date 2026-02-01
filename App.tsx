
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { CourseSettings } from './components/CourseSettings';
import { Preview } from './components/Preview';
import { ExportModal } from './components/ExportModal';
import { useStore } from './store';
import { Globe, Package, Layout, Play, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const { 
    course, 
    currentLanguage, 
    setCurrentLanguage, 
    toggleSettings,
    togglePreview
  } = useStore();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Top Bar */}
      <header className="h-20 bg-white/80 backdrop-blur-lg border-b border-slate-200 flex items-center justify-between px-8 z-40 shrink-0">
        <div className="flex items-center space-x-5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center transform hover:rotate-6 transition-transform">
             <Layout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-slate-800 text-xl tracking-tight leading-none mb-1">AuthorCloud</h1>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Draft</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          {/* Language Selector */}
          <div className="group relative">
            <div className="flex items-center space-x-3 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-2xl border border-slate-200 transition-all cursor-pointer">
              <Globe className="w-4 h-4 text-slate-500" />
              <select 
                className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none pr-6"
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
              >
                {course.settings.languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-4 pointer-events-none" />
            </div>
          </div>

          <div className="h-10 w-px bg-slate-200" />

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => togglePreview(true)}
              className="group flex items-center space-x-2 px-6 py-3 text-slate-600 hover:text-indigo-600 transition-all rounded-2xl font-bold text-sm hover:bg-indigo-50"
            >
              <Play className="w-4 h-4 group-hover:fill-indigo-600 transition-all" />
              <span>Preview</span>
            </button>
            <button 
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center space-x-2 px-7 py-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-2xl shadow-slate-200 font-bold text-sm"
            >
              <Package className="w-4 h-4" />
              <span>Publish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Editor />
      </main>

      <CourseSettings />
      <Preview />
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </div>
  );
};

export default App;
