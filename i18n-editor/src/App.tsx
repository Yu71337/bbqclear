import React, { useState, useMemo, useEffect } from 'react';
import { parseXliff, buildXliff, TransUnit } from './utils/xliffParser';
import { TranslationCard } from './components/TranslationCard';
import { Download, Upload, Settings, Languages } from 'lucide-react';

export default function App() {
  const [doc, setDoc] = useState<Document | null>(null);
  const [targetLang, setTargetLang] = useState('en');
  const [items, setItems] = useState<TransUnit[]>([]);
  const [updates, setUpdates] = useState<Record<string, {target: string, state: string}>>({});
  
  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({
    apiKey: localStorage.getItem('xliff_apikey') || '',
    baseUrl: localStorage.getItem('xliff_baseurl') || 'https://api.openai.com/v1',
    model: localStorage.getItem('xliff_model') || 'gpt-4o-mini'
  });

  // Filters
  const [searchId, setSearchId] = useState('');
  const [searchSource, setSearchSource] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [onlyUntranslated, setOnlyUntranslated] = useState(false);

  useEffect(() => {
    localStorage.setItem('xliff_apikey', config.apiKey);
    localStorage.setItem('xliff_baseurl', config.baseUrl);
    localStorage.setItem('xliff_model', config.model);
  }, [config]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = parseXliff(text);
        setDoc(parsed._doc);
        setTargetLang(parsed.targetLanguage);
        setItems(parsed.items);
        setUpdates({});
      } catch (err) {
        alert("Failed to parse XLIFF file");
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be uploaded again if needed
    e.target.value = '';
  };

  const handleDownload = () => {
    if (!doc) return;
    const newXmlStr = buildXliff(doc, updates);
    const blob = new Blob([newXmlStr], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translations_${targetLang}.xliff`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdate = (id: string, target: string, state: string) => {
    setUpdates(prev => ({ ...prev, [id]: { target, state } }));
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const currentTarget = updates[item.id]?.target ?? item.target;
      const currentState = updates[item.id]?.state ?? item.state;
      
      if (onlyUntranslated && currentState !== 'needs-translation') return false;
      if (searchId && !item.id.toLowerCase().includes(searchId.toLowerCase())) return false;
      if (searchSource && !item.source.toLowerCase().includes(searchSource.toLowerCase())) return false;
      if (searchTarget && !currentTarget.toLowerCase().includes(searchTarget.toLowerCase())) return false;
      return true;
    });
  }, [items, updates, searchId, searchSource, searchTarget, onlyUntranslated]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white shadow-sm border-b border-slate-200 py-3 px-6 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">MultiLingual AI Editor</h1>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors">
            <Upload size={16} /> Open XLIFF
            <input type="file" accept=".xliff,.xml" className="hidden" onChange={handleFileUpload} />
          </label>
          <button 
            disabled={!doc}
            onClick={handleDownload}
            className="disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Download size={16} /> Export
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="text-slate-500 hover:text-slate-800 p-2"
            title="AI Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-lg font-bold mb-4">AI Configuration</h2>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium">
                OpenAI Base URL
                <input type="text" className="w-full mt-1 border border-gray-300 rounded p-2" value={config.baseUrl} onChange={e => setConfig({...config, baseUrl: e.target.value})} />
              </label>
              <label className="text-sm font-medium">
                Model Name
                <input type="text" className="w-full mt-1 border border-gray-300 rounded p-2" value={config.model} onChange={e => setConfig({...config, model: e.target.value})} />
              </label>
              <label className="text-sm font-medium">
                API Key
                <input type="password" placeholder="sk-..." className="w-full mt-1 border border-gray-300 rounded p-2" value={config.apiKey} onChange={e => setConfig({...config, apiKey: e.target.value})} />
              </label>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto p-6">
        {!doc ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-500 mb-4">
              <Languages size={32} />
            </div>
            <h2 className="text-xl font-medium text-slate-800">No Translations Loaded</h2>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Upload an XLIFF file from the top right to start viewing and translating your content.</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white p-4 rounded shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-end">
               <label className="flex flex-col flex-1 min-w-[200px] text-xs font-semibold text-slate-600">
                  Search ID
                  <input type="text" className="mt-1 border border-slate-300 rounded p-2 text-sm font-normal" placeholder="header.title..." value={searchId} onChange={e => setSearchId(e.target.value)} />
               </label>
               <label className="flex flex-col flex-1 min-w-[200px] text-xs font-semibold text-slate-600">
                  Search Source
                  <input type="text" className="mt-1 border border-slate-300 rounded p-2 text-sm font-normal" placeholder="Hello..." value={searchSource} onChange={e => setSearchSource(e.target.value)} />
               </label>
               <label className="flex flex-col flex-1 min-w-[200px] text-xs font-semibold text-slate-600">
                  Search Target
                  <input type="text" className="mt-1 border border-slate-300 rounded p-2 text-sm font-normal" placeholder="你好..." value={searchTarget} onChange={e => setSearchTarget(e.target.value)} />
               </label>
               <label className="flex items-center gap-2 text-sm font-medium text-slate-700 py-2">
                  <input type="checkbox" checked={onlyUntranslated} onChange={e => setOnlyUntranslated(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                  Untranslated Only
               </label>
            </div>

            {/* List */}
            <div className="mb-2 text-sm text-slate-500">
               Showing {filteredItems.length} of {items.length} items (Target Language: <span className="font-bold">{targetLang}</span>)
            </div>
            <div className="space-y-4">
               {filteredItems.map(item => (
                 <TranslationCard 
                   key={item.id} 
                   item={{
                     ...item, 
                     target: updates[item.id]?.target ?? item.target,
                     state: updates[item.id]?.state ?? item.state
                   }} 
                   targetLang={targetLang}
                   config={config}
                   onUpdate={(target, state) => handleUpdate(item.id, target, state)} 
                 />
               ))}
               {filteredItems.length === 0 && (
                 <div className="py-10 text-center text-slate-500 bg-white shadow-sm rounded border border-slate-200">No items match your filters.</div>
               )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
