
import React, { useRef, useState } from 'react';

interface Props {
  onUpload: (files: File[]) => void;
}

const FileUploader: React.FC<Props> = ({ onUpload }) => {
  const singleInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (files) {
      const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (validFiles.length > 0) {
        onUpload(validFiles);
      }
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        onClick={() => singleInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`
          aspect-square flex flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed cursor-pointer transition-all duration-300
          ${isDragging ? 'bg-blue-50 border-blue-400 scale-[1.02]' : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50'}
        `}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={singleInputRef} 
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-1">Single Image</h3>
        <p className="text-sm text-gray-500">Fast AI Processing</p>
      </div>

      <div 
        onClick={() => batchInputRef.current?.click()}
        className="aspect-square flex flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed bg-white border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all cursor-pointer group"
      >
        <input 
          type="file" 
          className="hidden" 
          ref={batchInputRef} 
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-1">Batch Processing</h3>
        <p className="text-sm text-gray-400 italic">Upload multiple photos</p>
      </div>
    </div>
  );
};

export default FileUploader;
