
import React, { useState } from 'react';
import { AppState, ImageData } from './types';
import { processImageWithGemini } from './geminiService';
import { fileToBase64, getImageDimensions, downloadImage } from './utils';
import FileUploader from './components/FileUploader';
import ImageResult from './components/ImageResult';
import RefineCanvas from './components/RefineCanvas';
import ProcessingOverlay from './components/ProcessingOverlay';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [images, setImages] = useState<ImageData[]>([]);
  const [refiningImageId, setRefiningImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (files: File[]) => {
    setError(null);
    setState(AppState.PROCESSING);

    const newImages: ImageData[] = await Promise.all(
      files.map(async (file) => {
        const url = URL.createObjectURL(file);
        const dims = await getImageDimensions(url);
        return {
          id: Math.random().toString(36).substr(2, 9),
          originalUrl: url,
          processedUrl: null,
          file,
          ...dims,
          status: 'pending' as const
        };
      })
    );

    setImages(newImages);

    // Process images in parallel
    const processPromises = newImages.map(async (img) => {
      setImages(prev => prev.map(item => item.id === img.id ? { ...item, status: 'processing' } : item));
      try {
        const base64 = await fileToBase64(img.file);
        const processed = await processImageWithGemini(base64, img.file.type);
        
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, processedUrl: processed, status: 'done' } : item
        ));
      } catch (err) {
        console.error(`Failed to process image ${img.id}`, err);
        setImages(prev => prev.map(item => item.id === img.id ? { ...item, status: 'error' } : item));
      }
    });

    await Promise.all(processPromises);
    setState(AppState.RESULT);
  };

  const handleReset = () => {
    images.forEach(img => URL.revokeObjectURL(img.originalUrl));
    setImages([]);
    setState(AppState.IDLE);
    setError(null);
  };

  const startRefine = (id: string) => {
    setRefiningImageId(id);
    setState(AppState.REFINING);
  };

  const finishRefine = async (maskDataUrl: string) => {
    if (!refiningImageId) return;
    const targetImage = images.find(img => img.id === refiningImageId);
    if (!targetImage) return;

    setState(AppState.PROCESSING);
    setImages(prev => prev.map(img => img.id === refiningImageId ? { ...img, status: 'processing' } : img));
    
    try {
      const base64 = await fileToBase64(targetImage.file);
      const prompt = "A user has marked specific areas in this image to be removed. Please precisely erase any watermarks, text, or objects that look like overlays in the image, filling them in with a seamless background that matches the surrounding textures perfectly.";
      const processed = await processImageWithGemini(base64, targetImage.file.type, prompt);
      
      if (processed) {
        setImages(prev => prev.map(img => 
          img.id === refiningImageId ? { ...img, processedUrl: processed, status: 'done' } : img
        ));
      }
    } catch (err) {
      setError("Refinement failed.");
    } finally {
      setRefiningImageId(null);
      setState(AppState.RESULT);
    }
  };

  const handleDownloadAll = () => {
    images.forEach((img, index) => {
      if (img.processedUrl) {
        setTimeout(() => {
          downloadImage(img.processedUrl!, `cleared_${index + 1}.png`);
        }, index * 300); // Small delay to avoid browser blocking multiple downloads
      }
    });
  };

  const refiningImage = images.find(img => img.id === refiningImageId);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-8 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <header className="w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">PixelClear AI</h1>
            <p className="text-xs text-gray-500 font-medium">Batch Watermark Eraser</p>
          </div>
        </div>
        
        {state !== AppState.IDLE && (
          <button onClick={handleReset} className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
            Start Over
          </button>
        )}
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center gap-8 relative">
        {error && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium border border-red-100 z-50">
            {error}
          </div>
        )}

        {state === AppState.IDLE && <FileUploader onUpload={handleUpload} />}

        {(state === AppState.PROCESSING || state === AppState.RESULT) && images.length > 0 && (
          <div className="w-full flex flex-col items-center gap-8">
            <div className={`w-full grid gap-6 ${images.length === 1 ? 'max-w-2xl' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square flex flex-col bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 group">
                  <ImageResult 
                    imageData={img} 
                    isProcessing={img.status === 'processing' || img.status === 'pending'} 
                  />
                  { (img.status === 'processing' || img.status === 'pending') && <ProcessingOverlay /> }
                  
                  {state === AppState.RESULT && img.status === 'done' && (
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform flex gap-2">
                       <button 
                        onClick={() => startRefine(img.id)}
                        className="flex-1 py-2 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/30 hover:bg-white/40 transition-all"
                      >
                        Refine
                      </button>
                      <button 
                        onClick={() => downloadImage(img.processedUrl!, 'processed.png')}
                        className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {state === AppState.RESULT && (
              <div className="flex gap-4 w-full justify-center">
                <button 
                  onClick={handleDownloadAll}
                  className="px-12 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download All ({images.length})
                </button>
              </div>
            )}
          </div>
        )}

        {state === AppState.REFINING && refiningImage && (
          <RefineCanvas 
            imageUrl={refiningImage.originalUrl}
            onCancel={() => { setState(AppState.RESULT); setRefiningImageId(null); }}
            onSave={finishRefine}
          />
        )}
      </main>

      <footer className="w-full text-center py-6">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
          High Quality AI Inpainting • Multiple Files Support
        </p>
      </footer>
    </div>
  );
};

export default App;
