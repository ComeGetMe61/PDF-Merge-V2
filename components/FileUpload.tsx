import React, { ChangeEvent, useRef } from 'react';
import { UploadCloud, FilePlus } from './Icons';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  compact?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, compact = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Fix: Explicitly type 'f' as 'File' to resolve TS 'unknown' type error
      const fileList = Array.from(e.target.files).filter((f: File) => f.type === 'application/pdf');
      if (fileList.length === 0) {
        alert("Please select PDF files only.");
        return;
      }
      onFilesSelected(fileList);
      // Reset input value to allow selecting the same file again if needed
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const triggerUpload = () => {
    inputRef.current?.click();
  };

  if (compact) {
    return (
      <>
        <input
          type="file"
          multiple
          accept=".pdf"
          className="hidden"
          ref={inputRef}
          onChange={handleFileChange}
        />
        <button
          onClick={triggerUpload}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors"
        >
          <FilePlus size={18} />
          Add More Files
        </button>
      </>
    );
  }

  return (
    <div 
      className="w-full group cursor-pointer"
      onClick={triggerUpload}
    >
      <input
        type="file"
        multiple
        accept=".pdf"
        className="hidden"
        ref={inputRef}
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-brand-400 transition-all duration-300">
        <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300 mb-4">
           <UploadCloud className="w-10 h-10 text-brand-500" />
        </div>
        <p className="mb-2 text-lg font-semibold text-slate-700">
          Click to upload PDF files
        </p>
        <p className="text-sm text-slate-500">
          Select multiple files to begin merging
        </p>
      </div>
    </div>
  );
};

export default FileUpload;