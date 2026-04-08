import React, { useState } from 'react';
import { Bot, Check, Languages } from 'lucide-react';
import { generateAISuggestion } from '../utils/aiTranslation';
import { TransUnit } from '../utils/xliffParser';

interface Props {
  item: TransUnit;
  targetLang: string;
  config: { apiKey: string; baseUrl: string; model: string };
  onUpdate: (target: string, state: string) => void;
}

export function TranslationCard({ item, targetLang, config, onUpdate }: Props) {
  const [localTarget, setLocalTarget] = useState(item.target);
  const [localState, setLocalState] = useState(item.state);
  
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiError, setAiError] = useState('');

  const handleBlur = () => {
    if (localTarget !== item.target || localState !== item.state) {
      onUpdate(localTarget, localState);
    }
  };

  const handleAskAI = async () => {
    if (!config.apiKey) {
      setAiError('Please configure API keys first.');
      return;
    }
    setLoadingAI(true);
    setAiError('');
    try {
      const res = await generateAISuggestion({
        sourceText: item.source,
        targetLang,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl || 'https://api.openai.com/v1',
        model: config.model || 'gpt-4'
      });
      setAiSuggestion(res);
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4 flex flex-col md:flex-row gap-4 border border-gray-200">
      <div className="flex-1 flex flex-col">
        <div className="text-xs font-mono text-gray-500 mb-1">{item.id}</div>
        <div className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100 min-h-[4rem]">
           {item.source}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <select 
               className="text-xs border border-gray-300 rounded p-1"
               value={localState} 
               onChange={(e) => {
                 setLocalState(e.target.value);
                 onUpdate(localTarget, e.target.value);
               }}
            >
               <option value="needs-translation">needs-translation</option>
               <option value="translated">translated</option>
               <option value="reviewed">reviewed</option>
               <option value="final">final</option>
            </select>
            
            <button 
               onClick={handleAskAI} 
               disabled={loadingAI}
               className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 flex items-center gap-1 rounded transition-colors disabled:opacity-50"
            >
               <Bot size={14} />
               {loadingAI ? 'Thinking...' : 'Ask AI'}
            </button>
        </div>
        
        <textarea 
          className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none min-h-[4rem]"
          value={localTarget}
          onChange={(e) => setLocalTarget(e.target.value)}
          onBlur={handleBlur}
          dir="auto"
        />
        
        {aiError && <div className="text-xs text-red-500 mt-1">{aiError}</div>}
        
        {aiSuggestion && (
          <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded p-3 text-sm">
             <div className="text-xs text-indigo-500 mb-1 font-semibold flex items-center gap-1">
               <Languages size={14} /> AI Suggestion
             </div>
             <div>{aiSuggestion}</div>
             <button 
               className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors"
               onClick={() => {
                 const newState = 'translated';
                 setLocalTarget(aiSuggestion);
                 setLocalState(newState);
                 onUpdate(aiSuggestion, newState);
                 setAiSuggestion('');
               }}
             >
               <Check size={14} /> Apply Translation
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
