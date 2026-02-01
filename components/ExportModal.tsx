
import React, { useState } from 'react';
import { X, Package, Globe, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';
import { exportSCORM12 } from '../services/scormExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { course } = useStore();
  const [exportType, setExportType] = useState<'single' | 'all'>('all');
  const [selectedLang, setSelectedLang] = useState(course.settings.defaultLanguage);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportSCORM12(course, exportType === 'single' ? selectedLang : undefined);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Export failed. Check console.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col border border-white/20">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">SCORM Export</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Configuration</label>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setExportType('all')}
                className={`flex items-center p-4 rounded-2xl border-2 transition-all text-left ${
                  exportType === 'all' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg mr-4 ${exportType === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Multi-lingual Package</p>
                  <p className="text-xs text-slate-500">Includes all available languages.</p>
                </div>
                {exportType === 'all' && <CheckCircle2 className="w-5 h-5 ml-auto text-blue-500" />}
              </button>

              <button
                onClick={() => setExportType('single')}
                className={`flex items-center p-4 rounded-2xl border-2 transition-all text-left ${
                  exportType === 'single' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg mr-4 ${exportType === 'single' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Single Language</p>
                  <p className="text-xs text-slate-500">Export only the selected language.</p>
                </div>
                {exportType === 'single' && <CheckCircle2 className="w-5 h-5 ml-auto text-blue-500" />}
              </button>
            </div>
          </div>

          {exportType === 'single' && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Language</label>
              <select 
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
              >
                {course.settings.languages.map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-slate-50 flex flex-col space-y-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isExporting ? (
              <span className="animate-pulse">Building Package...</span>
            ) : (
              <>
                <Package className="w-5 h-5" />
                <span>Export SCORM 1.2 ZIP</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-slate-400 font-medium">
            This will generate a SCORM 1.2 compliant ZIP package ready for LMS upload.
          </p>
        </div>
      </div>
    </div>
  );
};
