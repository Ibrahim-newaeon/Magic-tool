import React, { useState, useRef, useCallback } from 'react';
import { Upload, Link as LinkIcon, History, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { HistoryItem } from '../types';

interface ImageUploadProps {
  currentImage: string | null;
  onImageSelect: (base64: string, mimeType: string, fromHistory?: boolean) => void;
  onClear: () => void;
  disabled?: boolean;
  recentImages: HistoryItem[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImage, 
  onImageSelect, 
  onClear, 
  disabled = false,
  recentImages
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'history'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (disabled) return;
    
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      alert("Please upload a JPEG or PNG image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageSelect(result, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [disabled]);

  const handleUrlImport = async () => {
    if (!urlInput.trim() || disabled) return;
    
    setIsLoadingUrl(true);
    setUrlError(null);

    const fetchImage = async (url: string): Promise<Blob> => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load image: ${response.statusText}`);
      return await response.blob();
    };

    try {
      let blob: Blob;
      
      // Attempt 1: Direct Fetch
      try {
        blob = await fetchImage(urlInput);
      } catch (directError) {
        console.warn("Direct fetch failed, trying CORS proxy...", directError);
        
        // Attempt 2: CORS Proxy
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlInput)}`;
        blob = await fetchImage(proxyUrl);
      }

      if (blob.type !== 'image/jpeg' && blob.type !== 'image/png' && blob.type !== 'image/webp') {
         throw new Error("URL must point to an image (JPEG, PNG, WebP).");
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string, blob.type);
        setIsLoadingUrl(false);
        setUrlInput(''); // Reset input on success
      };
      reader.readAsDataURL(blob);

    } catch (error) {
      console.error(error);
      setUrlError("Failed to load image. Ensure direct link and CORS permissions.");
      setIsLoadingUrl(false);
    }
  };

  if (currentImage) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden group border border-slate-700 bg-black/50">
        <img 
          src={currentImage} 
          alt="Source" 
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={onClear}
            className="p-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-transform hover:scale-110"
            disabled={disabled}
          >
            <X size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 mb-3 bg-slate-950 p-1 rounded-lg self-start">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === 'upload' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Upload size={14} /> Upload
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === 'url' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <LinkIcon size={14} /> Link
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === 'history' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <History size={14} /> History
        </button>
      </div>

      <div className="flex-1 relative">
        {activeTab === 'upload' && (
          <div 
            className={`w-full h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-colors cursor-pointer
              ${isDragging 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-indigo-400">
              <Upload size={32} />
            </div>
            <h3 className="text-white font-medium mb-1">Upload a photo</h3>
            <p className="text-sm text-slate-400">Drag & drop or click to select a JPEG or PNG file</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/png, image/jpeg" 
              className="hidden"
              disabled={disabled}
            />
          </div>
        )}

        {activeTab === 'url' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 border border-slate-700 rounded-xl bg-slate-900/30">
            <div className="w-full max-w-sm space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-cyan-400">
                  <LinkIcon size={24} />
                </div>
                <h3 className="text-white font-medium">Import from URL</h3>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
                />
              </div>

              {urlError && (
                <div className="flex items-start gap-2 text-red-400 text-xs bg-red-500/10 p-2 rounded">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{urlError}</span>
                </div>
              )}

              <button
                onClick={handleUrlImport}
                disabled={isLoadingUrl || !urlInput.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoadingUrl ? 'Fetching...' : 'Import Image'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="w-full h-full border border-slate-700 rounded-xl bg-slate-900/30 overflow-hidden flex flex-col">
             {recentImages.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <History size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">No recent images</p>
               </div>
             ) : (
               <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-3 custom-scrollbar">
                  {recentImages.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onImageSelect(item.url, item.mimeType, true)}
                      className="aspect-square rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/50 transition-all relative group"
                    >
                      <img src={item.url} alt="History" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </button>
                  ))}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
