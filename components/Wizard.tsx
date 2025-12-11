import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Wand2, CheckCircle2, ShoppingBag, Palette, Type, Smartphone, X } from 'lucide-react';
import { Button } from './Button';
import { ProductInfo, OfferTemplate, CreativeSize, BrandKit, GeneratedOfferCopy } from '../types/offerTemplate';
import { OFFER_TEMPLATES } from '../templates/offerTemplates';
import { ProductForm } from './ProductForm';
import { generateOfferCopy } from '../services/geminiService';
import { BrandSettings } from './BrandSettings';

interface WizardProps {
  onComplete: (data: {
    product: ProductInfo;
    templateId: string;
    size: CreativeSize;
    offerCopy: GeneratedOfferCopy;
    brandKit: BrandKit;
    activeTab: 'offer' | 'story';
  }) => void;
  onClose: () => void;
  initialBrandKit: BrandKit;
}

const STEPS = [
    { id: 'format', title: 'Choose Format', icon: Smartphone },
    { id: 'product', title: 'Product Info', icon: ShoppingBag },
    { id: 'style', title: 'Style & Brand', icon: Palette },
    { id: 'magic', title: 'AI Magic', icon: Wand2 },
];

export const Wizard: React.FC<WizardProps> = ({ onComplete, onClose, initialBrandKit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSize, setSelectedSize] = useState<CreativeSize>('SQUARE_1080');
  const [product, setProduct] = useState<ProductInfo>({ id: '', name: '', priceBefore: 0, priceAfter: 0, currency: '$' });
  const [templateId, setTemplateId] = useState('modern-minimal');
  const [brandKit, setBrandKit] = useState<BrandKit>(initialBrandKit);
  const [offerCopy, setOfferCopy] = useState<GeneratedOfferCopy | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = async () => {
    if (currentStep === 3) {
      // Finish
      onComplete({
        product,
        templateId,
        size: selectedSize,
        offerCopy: offerCopy || { headline: 'Offer', cta: 'Shop Now' },
        brandKit,
        activeTab: selectedSize === 'STORY_9_16' || selectedSize === 'REEL_9_16' ? 'offer' : 'offer' // Default to offer creator, user can switch
      });
      return;
    }
    
    // Logic for Step 3 (Magic) -> Auto generate copy if moving to step 3?
    if (currentStep === 2 && !offerCopy) {
        setIsGenerating(true);
        try {
            const tmpl = OFFER_TEMPLATES.find(t => t.id === templateId) || OFFER_TEMPLATES[0];
            const copy = await generateOfferCopy(product, tmpl, selectedSize);
            setOfferCopy(copy);
        } catch(e) { console.error(e); }
        setIsGenerating(false);
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => setCurrentStep(prev => Math.max(0, prev - 1));

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-300">
       {/* Wizard Header */}
       <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg">
                <Wand2 /> Creator Wizard
             </div>
             <div className="h-6 w-px bg-slate-800 mx-2"></div>
             <div className="flex gap-2">
                 {STEPS.map((step, idx) => {
                     const Icon = step.icon;
                     const isActive = idx === currentStep;
                     const isDone = idx < currentStep;
                     return (
                         <div key={step.id} className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isActive ? 'bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/50' : isDone ? 'text-emerald-400' : 'text-slate-600'}`}>
                             {isDone ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                             <span className="hidden md:inline">{step.title}</span>
                         </div>
                     );
                 })}
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
             <X size={24} />
          </button>
       </div>

       {/* Main Content Area */}
       <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-slate-950 to-slate-900">
           <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl min-h-[400px] flex flex-col">
               
               <div className="flex-1">
                   {/* STEP 0: FORMAT */}
                   {currentStep === 0 && (
                       <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                           <h2 className="text-2xl font-bold text-white mb-2">What are you creating today?</h2>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               {[
                                   { id: 'SQUARE_1080', label: 'Square Post', desc: 'Instagram Feed, Facebook', aspect: 'aspect-square' },
                                   { id: 'STORY_9_16', label: 'Story', desc: 'Instagram, Snapchat', aspect: 'aspect-[9/16]' },
                                   { id: 'REEL_9_16', label: 'Reel Cover', desc: 'TikTok, Reels', aspect: 'aspect-[9/16]' },
                               ].map((opt) => (
                                   <button 
                                      key={opt.id}
                                      onClick={() => setSelectedSize(opt.id as CreativeSize)}
                                      className={`p-4 rounded-xl border-2 text-left transition-all group ${selectedSize === opt.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-600 hover:bg-slate-800'}`}
                                   >
                                       <div className={`w-full ${opt.aspect} bg-slate-800 rounded-lg mb-3 border border-slate-700 group-hover:border-slate-500`}></div>
                                       <h3 className={`font-bold ${selectedSize === opt.id ? 'text-indigo-400' : 'text-white'}`}>{opt.label}</h3>
                                       <p className="text-xs text-slate-500">{opt.desc}</p>
                                   </button>
                               ))}
                           </div>
                       </div>
                   )}

                   {/* STEP 1: PRODUCT */}
                   {currentStep === 1 && (
                       <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                           <h2 className="text-2xl font-bold text-white">Tell us about the product</h2>
                           <ProductForm product={product} onChange={setProduct} />
                       </div>
                   )}

                   {/* STEP 2: STYLE */}
                   {currentStep === 2 && (
                       <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                           <h2 className="text-2xl font-bold text-white">Define your style</h2>
                           
                           <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                   <label className="text-sm text-slate-400">Template Base</label>
                                   <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                       {OFFER_TEMPLATES.map(t => (
                                           <button
                                              key={t.id}
                                              onClick={() => setTemplateId(t.id)}
                                              className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${templateId === t.id ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                                           >
                                               {t.name}
                                           </button>
                                       ))}
                                   </div>
                               </div>
                               
                               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                   <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Palette size={14} /> Quick Brand Kit</h3>
                                   <div className="space-y-4">
                                       <div>
                                           <label className="text-xs text-slate-500 mb-1 block">Primary Color</label>
                                           <div className="flex gap-2 items-center">
                                               <input type="color" value={brandKit.primaryColor} onChange={e => setBrandKit({...brandKit, primaryColor: e.target.value})} className="bg-transparent border-none w-8 h-8 rounded cursor-pointer" />
                                               <span className="text-xs font-mono text-slate-300">{brandKit.primaryColor}</span>
                                           </div>
                                       </div>
                                       <div>
                                           <label className="text-xs text-slate-500 mb-1 block">Font</label>
                                           <select 
                                              value={brandKit.primaryFont}
                                              onChange={e => setBrandKit({...brandKit, primaryFont: e.target.value})}
                                              className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                                           >
                                               <option value="Inter, sans-serif">Inter</option>
                                               <option value="Playfair Display">Playfair Display</option>
                                               <option value="Montserrat">Montserrat</option>
                                           </select>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       </div>
                   )}

                   {/* STEP 3: MAGIC */}
                   {currentStep === 3 && (
                       <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
                           <h2 className="text-2xl font-bold text-white">Generating Magic...</h2>
                           
                           {isGenerating ? (
                               <div className="py-12">
                                   <Wand2 size={48} className="mx-auto text-indigo-500 animate-spin mb-4" />
                                   <p className="text-slate-400">Writing catchy headlines for {product.name}...</p>
                               </div>
                           ) : (
                               <div className="py-6 space-y-4">
                                   <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-left">
                                       <p className="text-xs text-indigo-400 font-bold uppercase mb-2">Generated Copy</p>
                                       <h3 className="text-2xl font-bold text-white mb-2">{offerCopy?.headline}</h3>
                                       <p className="text-slate-400 mb-4">{offerCopy?.subheadline}</p>
                                       <span className="inline-block px-4 py-2 bg-white text-black font-bold rounded-lg text-sm">{offerCopy?.cta}</span>
                                   </div>
                                   <p className="text-sm text-slate-500">Looks good? Click Finish to open the editor.</p>
                               </div>
                           )}
                       </div>
                   )}
               </div>

               {/* Footer Buttons */}
               <div className="flex justify-between pt-6 mt-6 border-t border-slate-800">
                   <Button variant="secondary" onClick={handleBack} disabled={currentStep === 0}>
                       <ArrowLeft size={16} /> Back
                   </Button>
                   <Button variant="primary" onClick={handleNext} disabled={currentStep === 1 && !product.name} isLoading={isGenerating}>
                       {currentStep === 3 ? 'Finish & Edit' : 'Next Step'} <ArrowRight size={16} />
                   </Button>
               </div>
           </div>
       </div>
    </div>
  );
};
