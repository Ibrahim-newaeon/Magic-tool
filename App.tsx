import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Wand2, Layout, Sparkles, Zap, Smartphone, PlayCircle, Type, Music, Upload, X, Library, Palette, Move, Type as TypeIcon, Play, Pause, ShoppingBag, Info, HelpCircle } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { Button } from './components/Button';
import { StoryViewer } from './components/StoryViewer';
import { MusicSelector } from './components/MusicSelector';
import { OfferCreator } from './components/OfferCreator';
import { editImageWithGemini, detectTextInImage } from './services/geminiService';
import { ProcessingState, TextOverlay, HistoryItem } from './types';
import { OFFER_TEMPLATES } from './templates/offerTemplates';
import { ProductInfo, CreativeSize, GeneratedOfferCopy, BrandKit } from './types/offerTemplate';
import { Wizard } from './components/Wizard';

// --- Feature Info Modal Component ---
const FeatureModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl custom-scrollbar relative" onClick={e => e.stopPropagation()}>
       {/* Header */}
       <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-6 flex justify-between items-center z-10">
         <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="text-indigo-400" /> System Capabilities
            </h2>
            <p className="text-xs text-slate-400 mt-1">Powered by Gemini 2.5 Flash</p>
         </div>
         <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={20} />
         </button>
       </div>
       
       <div className="p-6 grid gap-8 md:grid-cols-2">
          {/* Section 1: AI Studio */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-800">
             <h3 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
                <Wand2 size={18}/> AI Image Studio
             </h3>
             <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2"><span className="text-indigo-500">•</span> <span><strong>Magic Prompt:</strong> Edit images using natural language instructions (e.g. "Add fireworks").</span></li>
                <li className="flex gap-2"><span className="text-indigo-500">•</span> <span><strong>Smart Clean:</strong> Auto-detect text, remove it, and intelligently fill the background.</span></li>
                <li className="flex gap-2"><span className="text-indigo-500">•</span> <span><strong>Source Manager:</strong> Import via Drag & Drop, URL, or History.</span></li>
             </ul>
          </div>

          {/* Section 2: Offer Creator */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-800">
             <h3 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                <ShoppingBag size={18}/> Offer Creator
             </h3>
             <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2"><span className="text-emerald-500">•</span> <span><strong>Offer Recipes:</strong> Quick presets for Square, Story, and Reel formats.</span></li>
                <li className="flex gap-2"><span className="text-emerald-500">•</span> <span><strong>Brand Kit:</strong> Maintain consistent colors and fonts across designs.</span></li>
                <li className="flex gap-2"><span className="text-emerald-500">•</span> <span><strong>Social Caption Gen:</strong> AI-generated captions and hashtags.</span></li>
             </ul>
          </div>

          {/* Section 3: Story Animator */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-800">
             <h3 className="text-pink-400 font-semibold mb-3 flex items-center gap-2">
                <Smartphone size={18}/> Story Animator
             </h3>
             <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2"><span className="text-pink-500">•</span> <span><strong>Cinematic Moves:</strong> Pan, Zoom, Tilt, and Parallax effects.</span></li>
                <li className="flex gap-2"><span className="text-pink-500">•</span> <span><strong>Text Effects:</strong> Rich overlay styling with Typewriter & Fade animations.</span></li>
                <li className="flex gap-2"><span className="text-pink-500">•</span> <span><strong>Video Export:</strong> Render 9:16 MP4s/WebMs for social media.</span></li>
             </ul>
          </div>

          {/* Section 4: Audio Engine */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-800">
             <h3 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                <Music size={18}/> Audio Engine
             </h3>
             <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2"><span className="text-cyan-500">•</span> <span><strong>Music Library:</strong> Curated royalty-free tracks sorted by mood.</span></li>
                <li className="flex gap-2"><span className="text-cyan-500">•</span> <span><strong>Custom Upload:</strong> Support for user MP3 files.</span></li>
                <li className="flex gap-2"><span className="text-cyan-500">•</span> <span><strong>Smart Mixing:</strong> Auto-syncs audio loops with video duration.</span></li>
             </ul>
          </div>
       </div>
    </div>
  </div>
);

// Default Brand Kit
const DEFAULT_BRAND_KIT: BrandKit = {
  primaryColor: '#6366f1', // Indigo 500
  secondaryColor: '#ffffff',
  accentColor: '#f43f5e', // Rose 500
  primaryFont: 'Inter, sans-serif',
  secondaryFont: '"Roboto Mono", monospace',
  defaultBorderRadius: 'lg',
  defaultShadow: 'strong'
};

function App() {
  // Application State
  const [sourceImage, setSourceImage] = useState<{ url: string; mimeType: string } | null>(null);
  const [imageHistory, setImageHistory] = useState<HistoryItem[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Text State
  const [extractedTextData, setExtractedTextData] = useState<TextOverlay | null>(null);
  const [customText, setCustomText] = useState('');
  
  // Text Styling State
  const [fontFamily, setFontFamily] = useState('Inter');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSizeRatio, setFontSizeRatio] = useState(1.0);
  const [textPosition, setTextPosition] = useState<TextOverlay['style']['position']>('center');
  
  // Audio State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [activeMusicTab, setActiveMusicTab] = useState<'upload' | 'library'>('library');
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  // Offer Creator State (Lifted)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(OFFER_TEMPLATES[0]?.id || "");
  const [selectedSize, setSelectedSize] = useState<CreativeSize>(OFFER_TEMPLATES[0]?.defaultSize || "SQUARE_1080");
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    id: "",
    name: "",
    priceBefore: 0,
    priceAfter: 0,
    currency: "USD",
  });
  const [offerCopy, setOfferCopy] = useState<GeneratedOfferCopy | null>(null);
  
  // Brand Kit State (Lifted & Persisted)
  const [brandKit, setBrandKit] = useState<BrandKit>(DEFAULT_BRAND_KIT);

  // Audio Preview State (App level)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);

  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<ProcessingState>({ isGenerating: false, error: null });
  const [activeTab, setActiveTab] = useState<'edit' | 'story' | 'offer'>('edit');
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  // Load History & Brand Kit from Local Storage
  useEffect(() => {
    try {
      console.log("App v2.5 Loaded");
      const savedHistory = localStorage.getItem('image_history');
      if (savedHistory) {
        setImageHistory(JSON.parse(savedHistory));
      }
      const savedBrand = localStorage.getItem('brand_kit');
      if (savedBrand) {
        setBrandKit(JSON.parse(savedBrand));
      }
    } catch (e) {
      console.error("Failed to load local storage", e);
    }
  }, []);

  // Save Brand Kit updates
  const handleBrandKitUpdate = (newKit: BrandKit) => {
      setBrandKit(newKit);
      localStorage.setItem('brand_kit', JSON.stringify(newKit));
  };

  // Stop preview if audio source changes
  useEffect(() => {
    setIsPreviewPlaying(false);
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.currentTime = 0;
    }
  }, [audioUrl]);

  const addToHistory = useCallback((url: string, mimeType: string) => {
    setImageHistory(prev => {
      // Avoid duplicates based on URL length/content to save performance
      const exists = prev.some(item => item.url === url);
      if (exists) return prev;

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        url,
        mimeType,
        timestamp: Date.now()
      };
      
      // Limit to 6 items to prevent localStorage quota exceeded errors with base64 strings
      const newHistory = [newItem, ...prev].slice(0, 6);
      
      try {
        localStorage.setItem('image_history', JSON.stringify(newHistory));
      } catch (e) {
        console.warn("Local storage likely full, could not save history", e);
      }
      return newHistory;
    });
  }, []);

  const handleImageSelect = useCallback((base64: string, mimeType: string, fromHistory = false) => {
    setSourceImage({ url: base64, mimeType });
    setGeneratedImage(null); // Clear previous result on new upload
    setExtractedTextData(null);
    setStatus({ isGenerating: false, error: null });
    
    if (!fromHistory) {
      addToHistory(base64, mimeType);
    }
  }, [addToHistory]);

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'audio/mpeg' && file.type !== 'audio/mp3') {
        alert("Please upload an MP3 file.");
        return;
      }
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setAudioFileName(file.name);
    }
  };

  const handleLibrarySelect = (url: string, title: string) => {
    setAudioUrl(url);
    setAudioFileName(title);
  };

  const clearAudio = () => {
    setAudioUrl(null);
    setAudioFileName(null);
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const toggleAudioPreview = () => {
    if (!audioPreviewRef.current || !audioUrl) return;
    
    if (isPreviewPlaying) {
      audioPreviewRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      audioPreviewRef.current.play().catch(console.error);
      setIsPreviewPlaying(true);
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage || !prompt.trim()) return;

    setStatus({ isGenerating: true, error: null });
    setExtractedTextData(null);
    
    try {
      // Extract clean base64 string (remove data:image/xyz;base64, prefix)
      const base64Data = sourceImage.url.split(',')[1];
      
      const editedImageUrl = await editImageWithGemini(
        base64Data,
        sourceImage.mimeType,
        prompt
      );

      setGeneratedImage(editedImageUrl);
      setActiveTab('story'); 
    } catch (error) {
      console.error(error);
      setStatus({ 
        isGenerating: false, 
        error: error instanceof Error ? error.message : "Something went wrong. Please try again." 
      });
    } finally {
      setStatus(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleExtractAndAnimateText = async () => {
    if (!sourceImage) return;

    setStatus({ isGenerating: true, error: null });
    setExtractedTextData(null);
    setGeneratedImage(null);
    setCustomText('');

    try {
      const base64Data = sourceImage.url.split(',')[1];

      // 1. Detect Text and Position
      const textOverlay = await detectTextInImage(base64Data, sourceImage.mimeType);
      
      if (!textOverlay.text) {
        throw new Error("No text detected in the image.");
      }
      setExtractedTextData(textOverlay);

      // 2. Remove Text from Image (Clean Background)
      const cleanedImageUrl = await editImageWithGemini(
        base64Data,
        sourceImage.mimeType,
        "Remove all the text from this image and fill in the background naturally."
      );

      setGeneratedImage(cleanedImageUrl);
      setActiveTab('story');

    } catch (error) {
      console.error(error);
      setStatus({ 
        isGenerating: false, 
        error: error instanceof Error ? error.message : "Failed to extract and animate text." 
      });
    } finally {
       setStatus(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleUseOriginal = () => {
    if (!sourceImage) return;
    setGeneratedImage(sourceImage.url);
    setExtractedTextData(null);
    setActiveTab('story');
  };

  const suggestions = [
    "Make it cyberpunk style",
    "Add a vintage film filter",
    "Remove the background",
    "Turn into a pencil sketch",
    "Add fireworks in the sky"
  ];

  const isStoryMode = activeTab === 'story';

  // Determine active overlay configuration
  const activeOverlayText: TextOverlay | null = extractedTextData 
    ? { ...extractedTextData } 
    : (customText ? { 
        text: customText,
        style: {
          fontFamily,
          color: textColor,
          fontSizeRatio,
          position: textPosition
        }
      } : null);

  const fontOptions = [
    { value: 'Inter', label: 'Modern (Sans)' },
    { value: '"Playfair Display", serif', label: 'Classic (Serif)' },
    { value: '"Montserrat", sans-serif', label: 'Bold (Geometric)' },
    { value: '"Roboto Mono", monospace', label: 'Tech (Mono)' },
    { value: '"Permanent Marker", cursive', label: 'Handwritten' },
  ];

  const positionOptions: { value: TextOverlay['style']['position'], icon: string }[] = [
    { value: 'top-left', icon: '⌜' }, { value: 'top-center', icon: '↑' }, { value: 'top-right', icon: '⌝' },
    { value: 'middle-left', icon: '←' }, { value: 'center', icon: '•' }, { value: 'middle-right', icon: '→' },
    { value: 'bottom-left', icon: '⌞' }, { value: 'bottom-center', icon: '↓' }, { value: 'bottom-right', icon: '⌟' },
  ];

  return (
      <div className="min-h-screen flex flex-col bg-slate-950">
      
      {showFeatureModal && <FeatureModal onClose={() => setShowFeatureModal(false)} />}
      
      {showWizard && (
          <Wizard 
             initialBrandKit={brandKit}
             onClose={() => setShowWizard(false)}
             onComplete={(data) => {
                 setProductInfo(data.product);
                 setSelectedTemplateId(data.templateId);
                 setSelectedSize(data.size);
                 setOfferCopy(data.offerCopy);
                 handleBrandKitUpdate(data.brandKit);
                 setActiveTab(data.activeTab);
                 setShowWizard(false);
             }}
          />
      )}

      {/* Header */}
      <header className={`border-b border-slate-800 bg-[#0A0F1E] sticky top-0 z-50 transition-all duration-300 ${isStoryMode ? 'hidden lg:flex' : 'flex'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
             <img 
               src="NewAeon.png" 
               alt="New Aeon Apps" 
               className="object-contain" 
               style={{ maxWidth: '100%', height: 'auto', width: '120px' }}
             />
             <button 
                onClick={() => setShowFeatureModal(true)}
                className="p-1.5 text-slate-400 hover:text-indigo-400 bg-slate-900 hover:bg-slate-800 rounded-full transition-colors"
                title="View System Features"
             >
                <HelpCircle size={18} />
             </button>
             <button
                onClick={() => setShowWizard(true)}
                className="ml-2 flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-bold transition-all"
             >
                <Wand2 size={14} /> Wizard
             </button>
          </div>
          
          <div className="flex bg-slate-800/50 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('edit')}
              className={`px-3 lg:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'edit' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Studio Editor
            </button>
            <button 
              onClick={() => setActiveTab('story')}
              disabled={!generatedImage}
              className={`px-3 lg:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'story' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'}`}
            >
              <Smartphone size={14} /> Story Mode
            </button>
            <button 
              onClick={() => setActiveTab('offer')}
              className={`px-3 lg:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'offer' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <ShoppingBag size={14} /> Offer Creator
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 w-full mx-auto flex flex-col lg:flex-row gap-8 transition-all duration-300 ${isStoryMode ? 'p-0 lg:p-8 h-[100dvh] lg:h-auto max-w-none lg:max-w-7xl' : 'p-4 lg:p-8 max-w-7xl'}`}>
        
        {/* TAB: OFFER CREATOR */}
        {activeTab === 'offer' && (
             <OfferCreator 
                sourceImageUrl={sourceImage?.url || null}
                product={productInfo}
                setProduct={setProductInfo}
                selectedTemplateId={selectedTemplateId}
                setSelectedTemplateId={setSelectedTemplateId}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                offerCopy={offerCopy}
                setOfferCopy={setOfferCopy}
                brandKit={brandKit}
                setBrandKit={handleBrandKitUpdate}
                onAnimate={(url) => {
                    setGeneratedImage(url);
                    setExtractedTextData(null);
                    setCustomText('');
                    setActiveTab('story');
                }}
             />
        )}

        {/* TAB: EDIT & STORY (Legacy UI) */}
        {activeTab !== 'offer' && (
            <>
                {/* LEFT PANEL: Editor & Input */}
                <section className={`flex-1 flex-col gap-6 transition-all duration-500 ${isStoryMode ? 'hidden lg:flex' : 'flex'}`}>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Layout size={18} className="text-indigo-400" /> 
                        Source Image
                    </h2>
                    {sourceImage && (
                        <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
                        {sourceImage.mimeType.split('/')[1].toUpperCase()}
                        </span>
                    )}
                    </div>
                    
                    <div className="aspect-[4/3] lg:aspect-[16/9]">
                    <ImageUpload 
                        currentImage={sourceImage?.url || null}
                        onImageSelect={handleImageSelect}
                        onClear={() => { setSourceImage(null); setGeneratedImage(null); setExtractedTextData(null); }}
                        disabled={status.isGenerating}
                        recentImages={imageHistory}
                    />
                    </div>
                </div>

                {/* Text and Audio Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Custom Text Input with Formatting */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Type size={18} className="text-pink-400" />
                            Text Overlay
                        </h2>
                        {extractedTextData && (
                        <span className="text-xs text-yellow-500 font-medium px-2 py-1 bg-yellow-500/10 rounded">Auto-Extracted</span>
                        )}
                    </div>

                    {/* Formatting Toolbar */}
                    {!extractedTextData && (
                        <div className="flex flex-col gap-3 mb-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <TypeIcon size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                                <select 
                                    value={fontFamily} 
                                    onChange={(e) => setFontFamily(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 pl-7 pr-2 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                                >
                                    {fontOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                            </div>
                            <div className="relative w-20 flex items-center">
                                <div 
                                className="w-full h-8 rounded-lg border border-slate-700 cursor-pointer overflow-hidden relative"
                                >
                                    <input 
                                    type="color" 
                                    value={textColor} 
                                    onChange={(e) => setTextColor(e.target.value)}
                                    className="absolute -top-2 -left-2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                    />
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 text-xs font-mono font-bold text-white shadow-sm" style={{ textShadow: '0 1px 2px black' }}>
                                        COLOR
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs text-slate-500"><Palette size={12} /></span>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="2.5" 
                                    step="0.1" 
                                    value={fontSizeRatio} 
                                    onChange={(e) => setFontSizeRatio(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                            
                            {/* Position Grid 3x3 */}
                            <div className="grid grid-cols-3 gap-0.5 bg-slate-800 p-0.5 rounded">
                                {positionOptions.map((pos) => (
                                    <button
                                        key={pos.value}
                                        onClick={() => setTextPosition(pos.value!)}
                                        className={`w-4 h-4 text-[8px] flex items-center justify-center rounded-sm transition-colors ${textPosition === pos.value ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                        title={pos.value}
                                    >
                                        {pos.icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                        </div>
                    )}

                    <textarea
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Type text to overlay on the story..."
                        className="w-full h-full min-h-[100px] bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                        disabled={!!extractedTextData} 
                        style={{ 
                            fontFamily: fontFamily.replace(/"/g, ''),
                            color: extractedTextData ? undefined : textColor 
                        }}
                    />
                    </div>

                    {/* Audio Upload */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[340px] md:h-auto min-h-[340px]">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Music size={18} className="text-cyan-400" />
                        Background Music
                        </h2>
                        
                        {/* Tabs */}
                        <div className="flex bg-slate-800 p-0.5 rounded-lg">
                        <button
                            onClick={() => setActiveMusicTab('library')}
                            className={`p-1.5 rounded-md transition-all ${activeMusicTab === 'library' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            title="Library"
                        >
                            <Library size={16} />
                        </button>
                        <button
                            onClick={() => setActiveMusicTab('upload')}
                            className={`p-1.5 rounded-md transition-all ${activeMusicTab === 'upload' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            title="Upload"
                        >
                            <Upload size={16} />
                        </button>
                        </div>
                    </div>
                    
                    {/* Selected Track Display with Play Button */}
                    {audioUrl && (
                        <div className="mb-3 bg-slate-950 border border-cyan-500/30 rounded-xl flex items-center justify-between p-3 shrink-0">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <button 
                            onClick={toggleAudioPreview}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isPreviewPlaying ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'}`}
                            >
                            {isPreviewPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                            </button>
                            
                            <div className="flex flex-col overflow-hidden">
                            <span className="text-xs text-cyan-200 truncate font-medium">{audioFileName}</span>
                            <span className="text-xs text-slate-500">Selected Track • {isPreviewPlaying ? 'Playing' : 'Ready'}</span>
                            </div>
                        </div>

                        {/* Hidden audio element for the selected track preview */}
                        <audio ref={audioPreviewRef} src={audioUrl} onEnded={() => setIsPreviewPlaying(false)} />

                        <button 
                            onClick={clearAudio}
                            className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                        </div>
                    )}

                    {/* Tab Content */}
                    <div className="flex-1 overflow-hidden relative">
                        {activeMusicTab === 'library' ? (
                        <MusicSelector 
                            onSelect={handleLibrarySelect} 
                            selectedUrl={audioUrl}
                        />
                        ) : (
                        <div 
                            onClick={() => audioInputRef.current?.click()}
                            className="w-full h-full border border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-slate-800/50 hover:border-slate-500 transition-all text-center"
                        >
                            <Upload size={32} className="text-slate-400 mb-2" />
                            <span className="text-sm text-slate-300 font-medium">Upload MP3</span>
                            <span className="text-xs text-slate-500 mt-1">Select a file from your device</span>
                        </div>
                        )}
                    </div>
                    
                    <input 
                        type="file" 
                        accept="audio/mp3,audio/mpeg" 
                        ref={audioInputRef} 
                        className="hidden" 
                        onChange={handleAudioSelect}
                    />
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-yellow-400" />
                    Magic Prompt
                    </h2>
                    
                    <div className="relative flex-1 min-h-[120px]">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe how you want to change the image (e.g., 'Add a neon sign that says Hello', 'Make it look like a van gogh painting')..."
                        className="w-full h-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                        disabled={status.isGenerating}
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-slate-600">
                        {prompt.length} chars
                    </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                        <button
                        key={s}
                        onClick={() => setPrompt(s)}
                        disabled={status.isGenerating}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-700 hover:border-slate-500"
                        >
                        {s}
                        </button>
                    ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col gap-4">
                    {/* Error Message Area */}
                    <div className="text-sm text-slate-500">
                        {status.error && <span className="text-red-400">{status.error}</span>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full">
                        {sourceImage && !status.isGenerating && (
                            <div className="flex items-center gap-2 w-full">
                            <Button 
                                variant="secondary" 
                                onClick={handleUseOriginal}
                                className="flex-1 text-xs lg:text-sm py-3 px-2 whitespace-nowrap"
                                disabled={status.isGenerating}
                            >
                                <PlayCircle size={16} /> Use Original
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handleExtractAndAnimateText}
                                className="flex-1 text-xs lg:text-sm py-3 px-2 bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500 border-none shadow-emerald-500/20 whitespace-nowrap"
                                disabled={status.isGenerating}
                            >
                                <Type size={16} /> Smart Extract & Clean
                            </Button>
                            </div>
                        )}
                        <Button 
                        onClick={handleGenerate} 
                        disabled={!sourceImage || !prompt.trim() || status.isGenerating}
                        isLoading={status.isGenerating}
                        className="flex-1 text-xs lg:text-sm py-3 px-2 whitespace-nowrap"
                        >
                        <Wand2 size={18} />
                        Generate Story
                        </Button>
                    </div>
                    </div>
                </div>
                </section>

                {/* RIGHT PANEL: Story Preview */}
                <section className={`flex-1 flex flex-col gap-6 lg:h-[calc(100vh-8rem)] ${activeTab === 'edit' ? 'hidden lg:flex' : 'flex h-full'}`}>
                <div className={`flex-1 bg-slate-900 border-slate-800 overflow-hidden relative transition-all duration-300 ${isStoryMode ? 'rounded-none border-0 shadow-none' : 'rounded-2xl border shadow-2xl'}`}>
                    
                    {!isStoryMode && (
                        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
                        <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 pointer-events-auto">
                            <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                            Result Preview
                            </span>
                        </div>
                        </div>
                    )}

                    {generatedImage ? (
                        <StoryViewer 
                        imageUrl={generatedImage}
                        overlayText={activeOverlayText} 
                        audioUrl={audioUrl}
                        isActive={true}
                        onClose={() => setActiveTab('edit')} 
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 p-8">
                        {status.isGenerating ? (
                            <div className="text-center animate-pulse">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="text-indigo-400 animate-spin" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-slate-300">Creating Magic...</h3>
                            <p className="text-sm mt-2 max-w-xs mx-auto">
                                {extractedTextData === null && !customText ? "Gemini 2.5 is reimagining your image..." : "Processing text and image..."}
                            </p>
                            </div>
                        ) : (
                            <div className="text-center">
                            <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800 rotate-3">
                                <Smartphone size={40} className="text-slate-700" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-400">No Story Yet</h3>
                            <p className="text-sm mt-2 max-w-xs mx-auto text-slate-500">Upload an image to start creating your animated story.</p>
                            </div>
                        )}
                        </div>
                    )}
                </div>
                </section>
            </>
        )}

      </main>

      {/* Footer / Version Info */}
      <footer className="py-4 text-center text-slate-600 text-xs border-t border-slate-900">
         <p>New Aeon Apps v2.5 • Powered by Gemini 2.5 Flash</p>
      </footer>
    </div>
  );
}

export default App;