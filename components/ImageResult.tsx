
import React, { useState } from 'react';
import { ImageData } from '../types';

interface Props {
  imageData: ImageData;
  isProcessing: boolean;
}

const ImageResult: React.FC<Props> = ({ imageData, isProcessing }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center select-none overflow-hidden"
      onMouseDown={() => !isProcessing && setShowOriginal(true)}
      onMouseUp={() => setShowOriginal(false)}
      onMouseLeave={() => setShowOriginal(false)}
      onTouchStart={() => !isProcessing && setShowOriginal(true)}
      onTouchEnd={() => setShowOriginal(false)}
    >
      <img 
        src={imageData.originalUrl} 
        alt="Original"
        className={`w-full h-full object-cover transition-all duration-500 ${isProcessing ? 'blur-lg scale-[1.05]' : 'blur-0 scale-100'}`}
      />

      {!isProcessing && imageData.processedUrl && !showOriginal && (
        <img 
          src={imageData.processedUrl} 
          alt="Processed"
          className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-300"
        />
      )}

      {/* Indicators */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
        <span className="px-2 py-0.5 bg-black/40 backdrop-blur-md text-white text-[9px] font-bold rounded-full uppercase tracking-widest w-fit">
          {showOriginal ? 'Original' : 'Cleared'}
        </span>
        {isProcessing && (
          <span className="px-2 py-0.5 bg-blue-600/60 backdrop-blur-md text-white text-[9px] font-bold rounded-full uppercase tracking-widest w-fit">
            AI Working
          </span>
        )}
      </div>

      {!isProcessing && !showOriginal && (
        <div className="absolute bottom-3 right-3 text-white/40 text-[9px] font-medium tracking-tight">
          Hold to Compare
        </div>
      )}
      
      {imageData.status === 'error' && (
        <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
           <span className="bg-red-600 text-white text-[10px] px-3 py-1 rounded-full font-bold">Failed</span>
        </div>
      )}
    </div>
  );
};

export default ImageResult;
