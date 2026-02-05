
import React from 'react';

const ProcessingOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[2px]"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-blue-700 font-bold tracking-widest text-xs uppercase animate-pulse">
          AI Detection & Inpainting...
        </p>
      </div>

      <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent scanning-line shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
    </div>
  );
};

export default ProcessingOverlay;
