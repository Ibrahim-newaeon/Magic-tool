import React, { useState, useRef, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Wand2, CheckCircle2, Image, Type, Smartphone, X, Upload, Grid, Sparkles, ToggleLeft, ToggleRight, ImagePlus } from 'lucide-react';
import { Button } from './Button';
import { ProductInfo, CreativeSize, BrandKit, GeneratedOfferCopy } from '../types/offerTemplate';
import { OFFER_TEMPLATES } from '../templates/offerTemplates';
import { generateOfferCopy } from '../services/geminiService';

interface WizardProps {
  onComplete: (data: {
    product: ProductInfo;
    templateId: string;
    size: CreativeSize;
    offerCopy: GeneratedOfferCopy | null;
    brandKit: BrandKit;
    activeTab: 'offer' | 'story';
    readyTemplate?: string | null;
    customBackground?: string | null;
    addTextOverlay: boolean;
  }) => void;
  onClose: () => void;
  initialBrandKit: BrandKit;
}

// Template gallery - templates with 'image' property are ready-to-use with backgrounds
// Templates without 'image' are style presets that need user to upload background
const TEMPLATE_GALLERY = [
  // Ready-to-use templates (with backgrounds)
  { id: 'sale-1', name: 'Hanging Sale', image: '/templates/sale-1.png', category: 'Sale', description: 'Red background with hanging SALE letters' },
  { id: 'sale-2', name: 'Watercolor Discount', image: '/templates/sale-2.png', category: 'Sale', description: 'White background with watercolor accents' },

  // Style presets (gradient placeholders - user uploads their own background)
  { id: 'modern-minimal', name: 'Modern Minimal', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'Elegant', description: 'Clean centered text with elegant typography' },
  { id: 'bold-sale', name: 'Bold Sale', preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', category: 'Sale', description: 'High impact with bold price badge' },
  { id: 'fashion-editorial', name: 'Fashion', preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', category: 'Fashion', description: 'Minimal text for showcasing imagery' },
  { id: 'promo-square', name: 'Promo Square', preview: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', category: 'Promo', description: 'Standard square ad layout' },
  { id: 'story-offer', name: 'Story Offer', preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', category: 'Story', description: 'Vertical layout for stories' },
  { id: 'custom-uploaded', name: 'Neon Glow', preview: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)', category: 'Modern', description: 'Modern neon-style text effects' },
];

// Steps for Gallery flow with background upload (style presets)
const GALLERY_STEPS_WITH_BG = [
  { id: 'template', title: 'Choose Style', icon: Image },
  { id: 'background', title: 'Add Background', icon: ImagePlus },
  { id: 'text', title: 'Text Options', icon: Type },
  { id: 'format', title: 'Select Format', icon: Smartphone },
  { id: 'finish', title: 'Finish', icon: Sparkles },
];

// Steps for Gallery flow without background upload (ready templates with images)
const GALLERY_STEPS_NO_BG = [
  { id: 'template', title: 'Choose Template', icon: Image },
  { id: 'text', title: 'Text Options', icon: Type },
  { id: 'format', title: 'Select Format', icon: Smartphone },
  { id: 'finish', title: 'Finish', icon: Sparkles },
];

// Steps for Upload flow (complete design)
const UPLOAD_STEPS = [
  { id: 'template', title: 'Upload Design', icon: Upload },
  { id: 'text', title: 'Text Options', icon: Type },
  { id: 'format', title: 'Select Format', icon: Smartphone },
  { id: 'finish', title: 'Finish', icon: Sparkles },
];

export const Wizard: React.FC<WizardProps> = ({ onComplete, onClose, initialBrandKit }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Template Selection
  const [templateSource, setTemplateSource] = useState<'gallery' | 'upload'>('gallery');
  const [selectedGalleryTemplate, setSelectedGalleryTemplate] = useState('modern-minimal');
  const [uploadedTemplate, setUploadedTemplate] = useState<string | null>(null);
  const [galleryBackgroundImage, setGalleryBackgroundImage] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  // Check if selected gallery template has an image (ready-to-use) or needs background upload
  const selectedTemplateData = TEMPLATE_GALLERY.find(t => t.id === selectedGalleryTemplate);
  const templateHasImage = !!(selectedTemplateData as any)?.image;

  // Dynamic steps based on template source and whether template has image
  const STEPS = useMemo(() => {
    if (templateSource === 'upload') return UPLOAD_STEPS;
    // Gallery templates with images skip background upload step
    return templateHasImage ? GALLERY_STEPS_NO_BG : GALLERY_STEPS_WITH_BG;
  }, [templateSource, templateHasImage]);

  // Text Options
  const [addTextOverlay, setAddTextOverlay] = useState(true);
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [cta, setCta] = useState('Shop Now');
  const [productName, setProductName] = useState('');
  const [priceBefore, setPriceBefore] = useState('');
  const [priceAfter, setPriceAfter] = useState('');

  // Format
  const [selectedSize, setSelectedSize] = useState<CreativeSize>('SQUARE_1080');

  // Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<GeneratedOfferCopy | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setUploadedTemplate(ev.target.result as string);
          setTemplateSource('upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setGalleryBackgroundImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCopy = async () => {
    if (!productName) return;
    setIsGenerating(true);
    try {
      const tmpl = OFFER_TEMPLATES.find(t => t.id === selectedGalleryTemplate) || OFFER_TEMPLATES[0];
      const product: ProductInfo = {
        id: '',
        name: productName,
        priceBefore: parseFloat(priceBefore) || 0,
        priceAfter: parseFloat(priceAfter) || 0,
        currency: '$'
      };
      const copy = await generateOfferCopy(product, tmpl, selectedSize);
      setGeneratedCopy(copy);
      setHeadline(copy.headline);
      setSubheadline(copy.subheadline || '');
      setCta(copy.cta);
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      // Finish
      const finalCopy = addTextOverlay ? {
        headline: headline || 'Special Offer',
        subheadline: subheadline,
        cta: cta || 'Shop Now'
      } : null;

      onComplete({
        product: {
          id: '',
          name: productName,
          priceBefore: parseFloat(priceBefore) || 0,
          priceAfter: parseFloat(priceAfter) || 0,
          currency: '$'
        },
        templateId: templateSource === 'upload' ? 'custom-uploaded' : selectedGalleryTemplate,
        size: selectedSize,
        offerCopy: finalCopy,
        brandKit: initialBrandKit,
        activeTab: 'offer',
        readyTemplate: templateSource === 'upload' ? uploadedTemplate : null,
        // Use template image if available, otherwise use user's uploaded background
        customBackground: templateSource === 'gallery'
          ? (templateHasImage ? (selectedTemplateData as any)?.image : galleryBackgroundImage)
          : null,
        addTextOverlay
      });
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => setCurrentStep(prev => Math.max(0, prev - 1));

  const canProceed = () => {
    const currentStepId = STEPS[currentStep]?.id;

    if (currentStepId === 'template') {
      return templateSource === 'upload' ? !!uploadedTemplate : !!selectedGalleryTemplate;
    }
    if (currentStepId === 'background') {
      // Gallery templates require a background image
      return !!galleryBackgroundImage;
    }
    if (currentStepId === 'text') {
      return !addTextOverlay || (headline.trim() !== '' || productName.trim() !== '');
    }
    return true;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center">
              <Wand2 size={16} />
            </div>
            Quick Creator
          </div>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="flex gap-1">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isDone = idx < currentStep;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-black'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-white/40'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                  <span className="hidden lg:inline">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all">
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-4xl">

          {/* STEP: Template Selection */}
          {STEPS[currentStep]?.id === 'template' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Choose Your Template</h1>
                <p className="text-white/50">Upload a complete design or pick a style from our gallery</p>
              </div>

              {/* Source Toggle */}
              <div className="flex justify-center gap-2 mb-8">
                <button
                  onClick={() => {
                    setTemplateSource('gallery');
                    setCurrentStep(0); // Reset to beginning when switching
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    templateSource === 'gallery'
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Grid size={18} /> Style Templates
                </button>
                <button
                  onClick={() => {
                    setTemplateSource('upload');
                    setCurrentStep(0); // Reset to beginning when switching
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    templateSource === 'upload'
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Upload size={18} /> Upload Complete Design
                </button>
              </div>

              {/* Gallery - Templates */}
              {templateSource === 'gallery' && (
                <>
                  <p className="text-center text-white/40 text-sm mb-6">
                    {TEMPLATE_GALLERY.some((t: any) => t.image)
                      ? 'Select a ready-to-use template or a style preset.'
                      : 'These are text style presets. You\'ll add your own background image in the next step.'}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {TEMPLATE_GALLERY.map((tmpl: any) => (
                      <button
                        key={tmpl.id}
                        onClick={() => setSelectedGalleryTemplate(tmpl.id)}
                        className={`group relative aspect-[4/5] rounded-2xl overflow-hidden transition-all ${
                          selectedGalleryTemplate === tmpl.id
                            ? 'ring-4 ring-white scale-[1.02]'
                            : 'ring-1 ring-white/10 hover:ring-white/30'
                        }`}
                      >
                        {/* Show image if available, otherwise gradient */}
                        {tmpl.image ? (
                          <img
                            src={tmpl.image}
                            alt={tmpl.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="absolute inset-0"
                            style={{ background: tmpl.preview }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-white/50">{tmpl.category}</span>
                            {tmpl.image && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/30 text-emerald-300 rounded">Ready</span>
                            )}
                          </div>
                          <h3 className="text-white font-bold">{tmpl.name}</h3>
                          <p className="text-white/40 text-xs mt-1">{tmpl.description}</p>
                        </div>
                        {selectedGalleryTemplate === tmpl.id && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <CheckCircle2 size={16} className="text-black" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Upload - Complete Design */}
              {templateSource === 'upload' && (
                <div className="flex flex-col items-center">
                  <p className="text-center text-white/40 text-sm mb-6">
                    Upload a ready-made design. It will be used as-is (no text overlays by default).
                  </p>
                  <button
                    onClick={() => uploadInputRef.current?.click()}
                    className={`w-full max-w-md aspect-[4/5] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 ${
                      uploadedTemplate
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                    }`}
                  >
                    {uploadedTemplate ? (
                      <img src={uploadedTemplate} alt="Uploaded" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                          <Upload size={32} className="text-white/50" />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-medium">Click to upload your complete design</p>
                          <p className="text-white/40 text-sm">PNG, JPG, WebP (1080×1080 or 1080×1920 recommended)</p>
                        </div>
                      </>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={uploadInputRef}
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleUpload}
                  />
                  {uploadedTemplate && (
                    <button
                      onClick={() => setUploadedTemplate(null)}
                      className="mt-4 text-sm text-white/50 hover:text-white"
                    >
                      Remove and upload different
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP: Background Image (Gallery templates only) */}
          {STEPS[currentStep]?.id === 'background' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Add Your Background</h1>
                <p className="text-white/50">
                  Upload an image to use as the background for your "<span className="text-amber-400">{TEMPLATE_GALLERY.find(t => t.id === selectedGalleryTemplate)?.name}</span>" template
                </p>
              </div>

              <div className="flex flex-col items-center">
                <button
                  onClick={() => backgroundInputRef.current?.click()}
                  className={`w-full max-w-lg aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 ${
                    galleryBackgroundImage
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-white/20 hover:border-white/40 bg-white/5'
                  }`}
                >
                  {galleryBackgroundImage ? (
                    <img src={galleryBackgroundImage} alt="Background" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center">
                        <ImagePlus size={40} className="text-white/50" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-medium text-lg">Click to upload background image</p>
                        <p className="text-white/40 text-sm mt-1">Product photo, promotional image, or any visual</p>
                        <p className="text-white/30 text-xs mt-2">PNG, JPG, WebP (1080×1080 or 1080×1920 recommended)</p>
                      </div>
                    </>
                  )}
                </button>
                <input
                  type="file"
                  ref={backgroundInputRef}
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleBackgroundUpload}
                />
                {galleryBackgroundImage && (
                  <button
                    onClick={() => setGalleryBackgroundImage(null)}
                    className="mt-4 text-sm text-white/50 hover:text-white"
                  >
                    Remove and upload different
                  </button>
                )}

                {/* Preview hint */}
                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 max-w-lg">
                  <p className="text-white/60 text-sm text-center">
                    <span className="text-amber-400">💡 Tip:</span> The "{TEMPLATE_GALLERY.find(t => t.id === selectedGalleryTemplate)?.name}" style will add text overlays on top of your background image.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Text Options */}
          {STEPS[currentStep]?.id === 'text' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Text & Content</h1>
                <p className="text-white/50">Add text overlays or use your template as-is</p>
              </div>

              {/* Toggle */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => setAddTextOverlay(!addTextOverlay)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all ${
                    addTextOverlay
                      ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {addTextOverlay ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  <span>Add Text Overlays</span>
                </button>
              </div>

              {addTextOverlay ? (
                <div className="max-w-xl mx-auto space-y-6 bg-white/5 rounded-2xl p-6 border border-white/10">
                  {/* Product Name for AI Generation */}
                  <div>
                    <label className="block text-sm text-white/50 mb-2">Product Name (for AI generation)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g., Summer Collection Dress"
                        className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <Button
                        variant="primary"
                        onClick={handleGenerateCopy}
                        disabled={!productName || isGenerating}
                        isLoading={isGenerating}
                        className="bg-gradient-to-r from-amber-500 to-rose-500 border-none"
                      >
                        <Wand2 size={16} /> Generate
                      </Button>
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Manual Input */}
                  <div>
                    <label className="block text-sm text-white/50 mb-2">Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g., SUMMER SALE"
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/50 mb-2">Subheadline (optional)</label>
                    <input
                      type="text"
                      value={subheadline}
                      onChange={(e) => setSubheadline(e.target.value)}
                      placeholder="e.g., Up to 50% off everything"
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/50 mb-2">Call to Action</label>
                      <input
                        type="text"
                        value={cta}
                        onChange={(e) => setCta(e.target.value)}
                        placeholder="Shop Now"
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/50 mb-2">Price (optional)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={priceAfter}
                          onChange={(e) => setPriceAfter(e.target.value)}
                          placeholder="$49"
                          className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto text-center py-12">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
                    <Image size={40} className="text-white/50" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Template Only Mode</h3>
                  <p className="text-white/50">
                    Your template will be used exactly as uploaded.<br />
                    No text or overlays will be added.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP: Format */}
          {STEPS[currentStep]?.id === 'format' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Select Format</h1>
                <p className="text-white/50">Choose the output size for your design</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {[
                  { id: 'SQUARE_1080', label: 'Square', desc: 'Instagram Feed, Facebook', ratio: '1:1', aspect: 'aspect-square' },
                  { id: 'STORY_9_16', label: 'Story', desc: 'Instagram & TikTok Stories', ratio: '9:16', aspect: 'aspect-[9/16]' },
                  { id: 'REEL_9_16', label: 'Reel', desc: 'Reels & TikTok Videos', ratio: '9:16', aspect: 'aspect-[9/16]' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedSize(opt.id as CreativeSize)}
                    className={`group p-6 rounded-2xl border-2 transition-all ${
                      selectedSize === opt.id
                        ? 'border-white bg-white/10'
                        : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-full ${opt.aspect} max-h-40 bg-gradient-to-br from-white/20 to-white/5 rounded-xl mb-4 mx-auto flex items-center justify-center`}>
                      <span className="text-white/30 text-sm font-mono">{opt.ratio}</span>
                    </div>
                    <h3 className={`text-xl font-bold mb-1 ${selectedSize === opt.id ? 'text-white' : 'text-white/70'}`}>
                      {opt.label}
                    </h3>
                    <p className="text-sm text-white/40">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP: Finish */}
          {STEPS[currentStep]?.id === 'finish' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center mx-auto mb-6">
                  <Sparkles size={40} className="text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Ready to Create!</h1>
                <p className="text-white/50">Here's a summary of your choices</p>
              </div>

              <div className="max-w-md mx-auto bg-white/5 rounded-2xl p-6 border border-white/10 text-left space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/50">Template</span>
                  <span className="text-white font-medium">
                    {templateSource === 'upload' ? 'Complete Design (Upload)' : `${TEMPLATE_GALLERY.find(t => t.id === selectedGalleryTemplate)?.name} Style`}
                  </span>
                </div>
                {templateSource === 'gallery' && (
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/50">Background</span>
                    <span className={`font-medium ${galleryBackgroundImage ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {galleryBackgroundImage ? 'Custom Image Added' : 'Missing!'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/50">Text Overlay</span>
                  <span className={`font-medium ${addTextOverlay ? 'text-emerald-400' : 'text-white/50'}`}>
                    {addTextOverlay ? 'Yes' : 'No (Template Only)'}
                  </span>
                </div>
                {addTextOverlay && headline && (
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/50">Headline</span>
                    <span className="text-white font-medium truncate max-w-[200px]">{headline}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/50">Format</span>
                  <span className="text-white font-medium">
                    {selectedSize === 'SQUARE_1080' ? 'Square (1:1)' : selectedSize === 'STORY_9_16' ? 'Story (9:16)' : 'Reel (9:16)'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="h-20 border-t border-white/10 flex items-center justify-between px-6 bg-black/50">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="bg-white/10 border-white/10 text-white hover:bg-white/20"
        >
          <ArrowLeft size={16} /> Back
        </Button>
        <div className="text-white/30 text-sm">
          Step {currentStep + 1} of {STEPS.length}
        </div>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-gradient-to-r from-amber-500 to-rose-500 border-none text-white"
        >
          {currentStep === STEPS.length - 1 ? 'Create Design' : 'Continue'} <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};
