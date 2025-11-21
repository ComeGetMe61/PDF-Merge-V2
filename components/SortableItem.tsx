import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UploadedFile } from '../types';
import { GripVertical, FileText, X } from './Icons';

interface SortableItemProps {
  id: string;
  file: UploadedFile;
  index: number;
  onRemove: (id: string) => void;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, file, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative flex items-center justify-between p-4 mb-3 
        bg-white border rounded-xl transition-all duration-200 ease-in-out
        cursor-grab active:cursor-grabbing touch-none select-none
        ${isDragging 
          ? 'shadow-xl border-brand-400 scale-[1.02] opacity-90 bg-brand-50 ring-1 ring-brand-400' 
          : 'shadow-sm border-slate-200 hover:border-brand-300 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-center gap-4 overflow-hidden flex-1">
        {/* Visual Drag Affordance (Subtle) */}
        <div className={`text-slate-300 transition-colors ${isDragging ? 'text-brand-500' : 'group-hover:text-brand-400'}`}>
           <GripVertical size={18} />
        </div>

        {/* Icon Container */}
        <div className="w-10 h-10 flex items-center justify-center bg-brand-50 rounded-lg border border-brand-100 flex-shrink-0">
          <FileText size={20} className="text-brand-600" />
        </div>

        {/* File Info */}
        <div className="flex flex-col overflow-hidden min-w-0">
          <span className="text-sm font-semibold text-slate-800 truncate block" title={file.name}>
            {file.name}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {formatSize(file.size)}
          </span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-3 pl-4 border-l border-slate-100 ml-4">
         <span className="hidden sm:block text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded">
            Page {index + 1}
         </span>
        <button
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group/btn focus:outline-none focus:ring-2 focus:ring-red-200"
          aria-label="Remove file"
        >
          <X size={18} className="transition-transform group-hover/btn:scale-110" />
        </button>
      </div>
    </div>
  );
};