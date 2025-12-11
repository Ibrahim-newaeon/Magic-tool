import React, { useState, useRef } from 'react';
import { OfferTemplate, ProductInfo, CreativeSize, GeneratedOfferCopy, OfferPreset, BrandKit, SocialContent, Project } from '../types/offerTemplate';
import { OFFER_TEMPLATES, getOfferTemplateById } from '../templates/offerTemplates';
import { generateOfferCopy, generateSocialContent, generateOfferVariants } from '../services/geminiService';
import { ProductForm } from './ProductForm';
import { OfferPreview } from './OfferPreview';
import { Layout, Wand2, Type, Palette, Hash, Copy, RefreshCw, Bookmark, Layers, FolderOpen, Upload, Trash2, Check } from 'lucide-react';
import { Button } from './Button';
import { BrandSettings } from './BrandSettings';
import { ProjectLibrary } from './ProjectLibrary';

// --- PRESET DEFINITIONS ---
const OFFER_PRESETS: OfferPreset[] = [
  { id: 'p1', name: 'Square Flash Sale', templateId: 'promo-square', size: 'SQUARE_1080', description: 'Classic 1:1 promo' },
  { id: 'p2', name: 'Story Vertical', templateId: 'story-offer', size: 'STORY_9_16', description: 'Full screen 9:16' },
  { id: 'p3', name: 'Reel Cover', templateId: 'story-offer', size: 'REEL_9_16', description: 'Safe zones for Reels' },
];

interface OfferCreatorProps {
  sourceImageUrl: string | null;
  product: ProductInfo;
  setProduct: (p: ProductInfo) => void;
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  selectedSize: CreativeSize;
  setSelectedSize: (s: CreativeSize) => void;
  offerCopy: GeneratedOfferCopy | null;
  setOfferCopy: (c: GeneratedOfferCopy) => void;
  brandKit: BrandKit | null;
  setBrandKit: (k: BrandKit) => void;
  onAnimate: (imageUrl: string) => void;
}

export const OfferCreator: React.FC<OfferCreatorProps> = ({
  sourceImageUrl,
  product,
  setProduct,
  selectedTemplateId,
  setSelectedTemplateId,
  selectedSize,
  setSelectedSize,
  offerCopy,
  setOfferCopy,
  brandKit,
  setBrandKit,
  onAnimate
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [showBrandSettings, setShowBrandSettings] = useState(false);
  const [showProjectLibrary, setShowProjectLibrary] = useState(false);
  
  // Custom Template State
  const [customTemplateBg, setCustomTemplateBg] = useState<string | null>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);

  // Ready-Made Template State (complete designs used as-is)
  const [readyTemplate, setReadyTemplate] = useState<string | null>(null);
  const readyTemplateInputRef = useRef<HTMLInputElement>(null);

  // Variants State
  const [variants, setVariants] = useState<{ tone: string, copy: GeneratedOfferCopy }[]>([]);
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  
  const [socialContent, setSocialContent] = useState<SocialContent | null>(null);

  const selectedTemplate = getOfferTemplateById(selectedTemplateId) || OFFER_TEMPLATES[0];

  // --- HANDLERS ---
  const handlePresetSelect = (presetId: string) => {
      const preset = OFFER_PRESETS.find(p => p.id === presetId);
      if (preset) {
          setSelectedTemplateId(preset.templateId);
          setSelectedSize(preset.size);
      }
  };

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = getOfferTemplateById(id);
    if (tmpl && !tmpl.supportedSizes.includes(selectedSize)) {
      setSelectedSize(tmpl.defaultSize);
    }
  };

  const handleCustomTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setCustomTemplateBg(ev.target.result as string);
                setSelectedTemplateId('custom-uploaded');
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleClearCustomTemplate = () => {
      setCustomTemplateBg(null);
      if (templateInputRef.current) templateInputRef.current.value = '';
      if (selectedTemplateId === 'custom-uploaded') {
          setSelectedTemplateId(OFFER_TEMPLATES[0].id);
      }
  };

  // Ready-Made Template Handlers (complete designs used as-is, no text overlays)
  const handleReadyTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setReadyTemplate(ev.target.result as string);
                // Clear custom background if any
                setCustomTemplateBg(null);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleClearReadyTemplate = () => {
      setReadyTemplate(null);
      if (readyTemplateInputRef.current) readyTemplateInputRef.current.value = '';
  };

  const handleGenerateCopy = async () => {
    if (!product.name) {
      alert("Please enter a product name first.");
      return;
    }
    setIsGenerating(true);
    setVariants([]); // Clear old variants
    try {
      const copy = await generateOfferCopy(product, selectedTemplate, selectedSize);
      setOfferCopy(copy);
      setSocialContent(null);
    } catch (e) {
      console.error(e);
      alert("Failed to generate copy.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVariants = async () => {
    if (!product.name) return;
    setIsGeneratingVariants(true);
    try {
        const results = await generateOfferVariants(product, selectedTemplate);
        setVariants(results);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingVariants(false);
    }
  };

  const handleGenerateSocial = async () => {
     if (!offerCopy) return;
     setIsGeneratingSocial(true);
     try {
         const content = await generateSocialContent(product, offerCopy);
         setSocialContent(content);
     } catch (e) {
         console.error(e);
     } finally {
         setIsGeneratingSocial(false);
     }
  };

  const handleLoadProject = (proj: Project) => {
      setProduct(proj.product);
      setSelectedTemplateId(proj.templateId);
      setSelectedSize(proj.size);
      setOfferCopy(proj.offerCopy);
      if (proj.brandKit) setBrandKit(proj.brandKit);
      if (proj.socialContent) setSocialContent(proj.socialContent);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 p-2 lg:p-0 relative">
      
      {showBrandSettings && brandKit && (
          <BrandSettings 
             brandKit={brandKit} 
             onChange={setBrandKit} 
             onClose={() => setShowBrandSettings(false)} 
          />
      )}

      {showProjectLibrary && brandKit && (
          <ProjectLibrary 
             currentProjectState={{
                 product,
                 templateId: selectedTemplateId,
                 size: selectedSize,
                 offerCopy,
                 brandKit,
                 socialContent
             }}
             onLoadProject={handleLoadProject}
             onClose={() => setShowProjectLibrary(false)}
          />
      )}

      {/* LEFT: Controls */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar pb-20">
        
        {/* 1. Quick Presets & Top Bar */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
           <div className="flex justify-between items-start mb-4">
               <h3 className="text-white font-semibold flex items-center gap-2">
                    <Bookmark size={18} className="text-blue-400" /> Quick Start
               </h3>
               <div className="flex gap-2">
                    <button 
                        onClick={() => setShowProjectLibrary(true)}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors border border-slate-700"
                    >
                        <FolderOpen size={12} /> Projects
                    </button>
                    <button 
                        onClick={() => setShowBrandSettings(true)}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors border border-slate-700"
                    >
                        <Palette size={12} /> {brandKit ? 'Edit Brand' : 'Setup'}
                    </button>
               </div>
           </div>

           <div className="grid grid-cols-3 gap-2 mb-4">
               {OFFER_PRESETS.map(preset => (
                   <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className="text-xs bg-slate-950 border border-slate-700 hover:border-indigo-500 hover:text-white p-2 rounded-lg text-slate-400 transition-all text-center"
                   >
                      {preset.name}
                   </button>
               ))}
           </div>
           
           <div className="mb-4 pt-4 border-t border-slate-800 space-y-3">
             <div className="flex flex-col gap-2">
                 <label className="text-xs text-slate-400 block">Select Template</label>
                 
                 <div className="flex gap-2">
                     <select 
                        value={selectedTemplateId}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                     >
                        {OFFER_TEMPLATES.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                     </select>
                 </div>
                 
                 {/* Prominent Upload Area */}
                 <div className="mt-1">
                     <button 
                        onClick={() => templateInputRef.current?.click()}
                        className={`w-full py-2.5 border border-dashed rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                            customTemplateBg 
                            ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400' 
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                     >
                        <Upload size={14} /> 
                        {customTemplateBg ? 'Change Custom Background' : 'Upload Your Background'}
                     </button>

                     {customTemplateBg && (
                         <div className="flex items-center justify-between mt-2 px-1">
                             <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                                 <Check size={10} /> Background Active
                             </div>
                             <button 
                                onClick={handleClearCustomTemplate}
                                className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300"
                             >
                                 <Trash2 size={10} /> Remove
                             </button>
                         </div>
                     )}

                     <input
                        type="file"
                        ref={templateInputRef}
                        className="hidden"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleCustomTemplateUpload}
                     />
                 </div>

                 {/* Ready-Made Template Upload */}
                 <div className="mt-4 pt-4 border-t border-slate-700">
                     <label className="text-xs text-slate-400 block mb-2">Or Upload Ready-Made Design</label>
                     <button
                        onClick={() => readyTemplateInputRef.current?.click()}
                        className={`w-full py-3 border-2 border-dashed rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            readyTemplate
                            ? 'bg-purple-900/30 border-purple-500 text-purple-300'
                            : 'bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-600 text-slate-300 hover:border-purple-500 hover:text-purple-300'
                        }`}
                     >
                        <Layout size={16} />
                        {readyTemplate ? 'Change Ready Template' : 'Upload Complete Design'}
                     </button>
                     <p className="text-[10px] text-slate-500 mt-1.5 text-center">
                        Upload a fully designed template (no text will be added)
                     </p>

                     {readyTemplate && (
                         <div className="flex items-center justify-between mt-2 px-1">
                             <div className="flex items-center gap-1.5 text-xs text-purple-400">
                                 <Check size={12} /> Ready Template Active
                             </div>
                             <button
                                onClick={handleClearReadyTemplate}
                                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                             >
                                 <Trash2 size={12} /> Remove
                             </button>
                         </div>
                     )}

                     <input
                        type="file"
                        ref={readyTemplateInputRef}
                        className="hidden"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleReadyTemplateUpload}
                     />
                 </div>
             </div>
           </div>

           <div>
             <div className="flex gap-2 p-1 bg-slate-950 rounded-lg">
               {[
                 { id: "SQUARE_1080", label: "Square" },
                 { id: "STORY_9_16", label: "Story" },
                 { id: "REEL_9_16", label: "Reel" }
               ].map(opt => {
                 const isSupported = selectedTemplate.supportedSizes.includes(opt.id as CreativeSize);
                 return (
                    <button
                        key={opt.id}
                        onClick={() => setSelectedSize(opt.id as CreativeSize)}
                        disabled={!isSupported}
                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                            selectedSize === opt.id 
                            ? 'bg-slate-700 text-white shadow' 
                            : 'text-slate-500 hover:text-slate-300'
                        } ${!isSupported ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                        {opt.label}
                    </button>
                 );
               })}
             </div>
           </div>
        </div>

        {/* 2. Product Form */}
        <ProductForm product={product} onChange={setProduct} />

        {/* 3. Ad Copy & Variants */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Type size={18} className="text-pink-400" /> AI Ad Copy
              </h3>
              <div className="flex gap-2">
                   <Button 
                        variant="secondary"
                        onClick={handleGenerateVariants}
                        isLoading={isGeneratingVariants}
                        disabled={!product.name}
                        className="text-xs py-1.5 px-3 h-auto"
                   >
                        <Layers size={12} /> A/B Variants
                   </Button>
                   <Button 
                        variant="primary"
                        onClick={handleGenerateCopy}
                        isLoading={isGenerating}
                        disabled={!product.name}
                        className="text-xs py-1.5 px-3 h-auto"
                   >
                        <Wand2 size={12} /> Generate
                   </Button>
              </div>
           </div>

           {/* Variants List */}
           {variants.length > 0 && (
               <div className="mb-4 grid gap-2">
                   <label className="text-xs text-slate-500">Select a Variant:</label>
                   {variants.map((v, i) => (
                       <button 
                         key={i}
                         onClick={() => setOfferCopy(v.copy)}
                         className="text-left p-3 rounded-lg bg-slate-950 border border-slate-700 hover:border-indigo-500 transition-all group"
                       >
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-indigo-400">{v.tone}</span>
                           </div>
                           <p className="text-sm text-white font-medium">{v.copy.headline}</p>
                           <p className="text-xs text-slate-400">{v.copy.cta}</p>
                       </button>
                   ))}
               </div>
           )}
           
           {offerCopy && (
               <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div>
                        <label className="text-xs text-slate-500">Headline</label>
                        <input 
                            value={offerCopy.headline} 
                            onChange={(e) => setOfferCopy({...offerCopy, headline: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500">Subheadline</label>
                        <input 
                            value={offerCopy.subheadline || ''} 
                            onChange={(e) => setOfferCopy({...offerCopy, subheadline: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500">CTA</label>
                        <input 
                            value={offerCopy.cta} 
                            onChange={(e) => setOfferCopy({...offerCopy, cta: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                        />
                    </div>
               </div>
           )}
           {!offerCopy && !variants.length && (
               <div className="text-center text-slate-500 text-sm py-4 italic">
                   Enter product details and click auto-generate to create copy.
               </div>
           )}
        </div>

        {/* 4. Social Caption */}
        {offerCopy && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        <Hash size={18} className="text-cyan-400" /> Social Caption
                    </h3>
                    <Button 
                        variant="secondary"
                        onClick={handleGenerateSocial}
                        isLoading={isGeneratingSocial}
                        className="text-xs py-1.5 px-3 h-auto"
                    >
                        <RefreshCw size={12} /> Generate
                    </Button>
                 </div>

                 {socialContent ? (
                     <div className="space-y-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                         <p className="text-sm text-slate-300 whitespace-pre-line">{socialContent.caption}</p>
                         <div className="flex flex-wrap gap-1 mt-2">
                             {socialContent.hashtags.map((tag, i) => (
                                 <span key={i} className="text-xs text-blue-400">{tag}</span>
                             ))}
                         </div>
                         <button 
                            className="mt-2 text-xs flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                            onClick={() => navigator.clipboard.writeText(`${socialContent.caption}\n\n${socialContent.hashtags.join(' ')}`)}
                         >
                             <Copy size={12} /> Copy to Clipboard
                         </button>
                     </div>
                 ) : (
                     <p className="text-xs text-slate-500 italic">Generate a caption optimized for Instagram/TikTok.</p>
                 )}
            </div>
        )}

      </div>

      {/* RIGHT: Preview */}
      <div className="flex-1 bg-black/40 rounded-2xl p-6 flex flex-col border border-white/5 min-h-[500px]">
         <OfferPreview
            template={selectedTemplate}
            size={selectedSize}
            product={product}
            offerCopy={offerCopy}
            imageUrl={sourceImageUrl}
            brandKit={brandKit}
            customTemplateBg={customTemplateBg}
            readyTemplate={readyTemplate}
            onAnimate={onAnimate}
         />
      </div>

    </div>
  );
};