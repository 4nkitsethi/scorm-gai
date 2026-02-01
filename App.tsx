
import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { CourseSettings } from './components/CourseSettings';
import { Preview } from './components/Preview';
import { useStore } from './store';
import { exportSCORM12 } from './services/scormExporter';
import { Globe, Package, Layout, Play, Save } from 'lucide-react';

const App: React.FC = () => {
  const { 
    course, 
    currentLanguage, 
    setCurrentLanguage, 
    toggleSettings,
    togglePreview
  } = useStore();

  const handleExport = async () => {
    try {
      await exportSCORM12(course);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export SCORM package. Check console for details.");
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 z-10 shadow-sm shrink-0">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-600 rounded-lg shadow-blue-200 shadow-lg">
             <Layout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">CourseBuilder</h1>
            <p className="text-xs text-slate-400 font-medium">Professional Authoring Tool</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Language Selector */}
          <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <Globe className="w-4 h-4 text-slate-400" />
            <select 
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none pr-2 cursor-pointer"
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
            >
              {course.settings.languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => togglePreview(true)}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg font-bold text-sm"
            >
              <Play className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center space-x-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100 font-bold text-sm"
            >
              <Package className="w-4 h-4" />
              <span>Build SCORM</span>
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
    </div>
  );
};

export default App;
