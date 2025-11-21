import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UploadedFile, CoverPageData } from './types';
import FileUpload from './components/FileUpload';
import PdfList from './components/PdfList';
import AICoverPage from './components/AICoverPage';
import { mergePdfs } from './services/pdfService';
import { smartSortFiles } from './services/geminiService';
import { Download, Loader2, AlertCircle, Sparkles, Wand2, Layers, CheckCircle2 } from './components/Icons';

function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [outputName, setOutputName] = useState('merged-document');
  const [coverPageData, setCoverPageData] = useState<CoverPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    const filesWithIds = newFiles.map(f => ({
      id: uuidv4(),
      file: f,
      name: f.name,
      size: f.size
    }));
    setFiles(prev => [...prev, ...filesWithIds]);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSmartSort = async () => {
    if (files.length < 2) return;
    setIsSorting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const sortedIds = await smartSortFiles(files.map(f => ({ id: f.id, name: f.name })));
      
      if (sortedIds && sortedIds.length > 0) {
        // Create a map for O(1) lookup. Explicitly cast map entries to tuples for correct type inference.
        const fileMap = new Map(files.map(f => [f.id, f] as [string, UploadedFile]));
        
        // Reconstruct array based on sorted IDs, keeping any that might have been missed at the end
        const newOrder: UploadedFile[] = [];
        const processedIds = new Set<string>();
        
        sortedIds.forEach(id => {
          const file = fileMap.get(id);
          if (file) {
            newOrder.push(file);
            processedIds.add(id);
          }
        });
        
        // Add remaining files that might have been missed by AI
        files.forEach(f => {
          if (!processedIds.has(f.id)) {
            newOrder.push(f);
          }
        });

        setFiles(newOrder);
        setSuccessMessage("Files successfully sorted by AI!");
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setError("AI Sorting failed. Please try again.");
    } finally {
      setIsSorting(false);
    }
  };

  const handleMerge = async () => {
    if (files.length === 0) return;
    
    setIsMerging(true);
    setError(null);
    setSuccessMessage(null);
    
    setTimeout(async () => {
      try {
        await mergePdfs(files, outputName, coverPageData || undefined);
        setSuccessMessage("PDF merged and downloaded successfully!");
        setTimeout(() => setSuccessMessage(null), 4000);
      } catch (err) {
        setError("An error occurred while merging files. Please try again.");
      } finally {
        setIsMerging(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-50 font-sans text-brand-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-brand-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-900 text-white p-1.5 rounded-md shadow-sm">
              <Layers size={20} />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-brand-900">
              Muhammed's PDF Manager
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 sm:px-6 py-10">
        <div className="max-w-3xl mx-auto">
          
          {/* Hero */}
          <div className="mb-10 text-center animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-900 mb-4 tracking-tight">
              Organize & Merge PDFs
            </h2>
            <p className="text-brand-500 text-lg max-w-xl mx-auto font-light leading-relaxed">
              A professional tool powered by AI to intelligently sort and combine your documents.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-brand-200/50 border border-white overflow-hidden">
            
            {/* Upload Area */}
            <div className="p-6 sm:p-8 border-b border-brand-100">
               {files.length === 0 ? (
                 <FileUpload onFilesSelected={handleFilesSelected} />
               ) : (
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h3 className="text-lg font-medium text-brand-800">
                      {files.length} {files.length === 1 ? 'Document' : 'Documents'} Loaded
                    </h3>
                    <div className="flex gap-2">
                      {files.length > 1 && (
                        <button
                          onClick={handleSmartSort}
                          disabled={isSorting}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-700 bg-white border border-brand-300 rounded-lg hover:bg-brand-50 hover:text-brand-900 transition-colors shadow-sm"
                        >
                          {isSorting ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                          Smart Sort
                        </button>
                      )}
                      <FileUpload onFilesSelected={handleFilesSelected} compact />
                    </div>
                 </div>
               )}
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="p-6 sm:p-8 bg-brand-50/30">
                
                {/* Success Message Area */}
                {successMessage && (
                  <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 p-3 rounded-lg animate-fade-in">
                    <CheckCircle2 size={18} />
                    {successMessage}
                  </div>
                )}

                <PdfList files={files} setFiles={setFiles} />
                
                {/* AI Feature */}
                <AICoverPage onCoverDataGenerated={setCoverPageData} />

                {/* Merge Controls */}
                <div className="mt-8 pt-8 border-t border-brand-200">
                  <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
                    <div className="w-full sm:w-2/3">
                      <label className="block text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1.5">
                        Output Filename
                      </label>
                      <div className="flex items-center shadow-sm rounded-lg overflow-hidden">
                        <input
                          type="text"
                          value={outputName}
                          onChange={(e) => setOutputName(e.target.value)}
                          className="w-full px-4 py-2.5 border-y border-l border-brand-300 rounded-l-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:z-10 outline-none text-sm bg-white text-brand-900"
                          placeholder="merged-document"
                        />
                        <span className="px-4 py-2.5 bg-brand-100 border border-brand-300 rounded-r-lg text-brand-600 text-sm font-medium">
                          .pdf
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleMerge}
                      disabled={isMerging}
                      className={`w-full sm:w-auto px-8 py-2.5 rounded-lg text-white font-medium shadow-lg shadow-brand-900/10 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
                        ${isMerging 
                          ? 'bg-brand-700 cursor-wait opacity-80' 
                          : 'bg-brand-900 hover:bg-brand-800'
                        }
                      `}
                    >
                      {isMerging ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Merging...
                        </>
                      ) : (
                        <>
                          <Download size={18} />
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>
                  
                  {error && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg animate-fade-in">
                       <AlertCircle size={16} />
                       {error}
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center">
             <p className="text-xs text-brand-400">
               Files are processed locally in your browser for maximum privacy.
             </p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;