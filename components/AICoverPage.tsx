import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from './Icons';
import { generateCoverPageContent } from '../services/geminiService';
import { CoverPageData, AIStatus } from '../types';

interface AICoverPageProps {
  onCoverDataGenerated: (data: CoverPageData | null) => void;
}

const AICoverPage: React.FC<AICoverPageProps> = ({ onCoverDataGenerated }) => {
  const [isActive, setIsActive] = useState(false);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<AIStatus>(AIStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<CoverPageData | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setStatus(AIStatus.LOADING);
    setError(null);
    try {
      const data = await generateCoverPageContent(description);
      setGeneratedData(data);
      onCoverDataGenerated(data);
      setStatus(AIStatus.SUCCESS);
    } catch (err) {
      setStatus(AIStatus.ERROR);
      setError("Failed to generate content. Please check your API key and try again.");
    }
  };

  const handleReset = () => {
    setGeneratedData(null);
    onCoverDataGenerated(null);
    setStatus(AIStatus.IDLE);
    setDescription('');
  };

  if (!isActive) {
    return (
      <button
        onClick={() => setIsActive(true)}
        className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors mt-4"
      >
        <Sparkles size={16} />
        Add AI-Generated Cover Page?
      </button>
    );
  }

  return (
    <div className="mt-6 p-5 bg-gradient-to-br from-brand-50 to-white border border-brand-100 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-brand-700 font-semibold">
          <Sparkles size={18} />
          <h3>AI Cover Page Generator</h3>
        </div>
        <button onClick={() => { setIsActive(false); handleReset(); }} className="text-xs text-slate-400 hover:text-slate-600">
          Dismiss
        </button>
      </div>

      {status === AIStatus.SUCCESS && generatedData ? (
        <div className="space-y-3 animate-fade-in">
          <div className="bg-white p-4 rounded-lg border border-brand-200">
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-2">
              <CheckCircle2 size={16} />
              Cover Page Ready
            </div>
            <h4 className="font-bold text-slate-800">{generatedData.title}</h4>
            <p className="text-sm text-slate-500 mb-2">{generatedData.subtitle}</p>
            <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded">{generatedData.abstract}</p>
          </div>
          <button 
            onClick={handleReset}
            className="text-xs text-brand-600 hover:underline"
          >
            Generate Different Content
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Describe the contents of this bundle (e.g., "Monthly Financial Reports for Q1 2024"). 
            Gemini will generate a professional title, subtitle, and summary.
          </p>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Contract documents for Project Alpha..."
              className="flex-1 px-3 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              disabled={status === AIStatus.LOADING}
            />
            <button
              onClick={handleGenerate}
              disabled={!description.trim() || status === AIStatus.LOADING}
              className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2
                ${!description.trim() || status === AIStatus.LOADING ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 shadow-md'}
              `}
            >
              {status === AIStatus.LOADING ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>
          </div>
          
          {status === AIStatus.ERROR && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AICoverPage;