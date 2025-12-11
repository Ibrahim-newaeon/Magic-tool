import React, { useRef, useState } from 'react';
import { OfferTemplate, ProductInfo, GeneratedOfferCopy, CreativeSize, BrandKit } from '../types/offerTemplate';
import { Download, Layout, ShieldAlert, Settings2, Clapperboard } from 'lucide-react';
import { Button } from './Button';
import { toPng } from 'html-to-image';

interface OfferPreviewProps {
  template: OfferTemplate;
  size: CreativeSize;
  product: ProductInfo;
  offerCopy: GeneratedOfferCopy | null;
  imageUrl: string | null;
  brandKit?: BrandKit | null;
  customTemplateBg?: string | null;
  onAnimate?: (imageUrl: string) => void;
}

export const OfferPreview: React.FC<OfferPreviewProps> = ({
  template,
  size,
  product,
  offerCopy,
  imageUrl,
  brandKit,
  customTemplateBg,
  onAnimate
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [exportQuality, setExportQuality] = useState<'standard' | 'high'>('standard');

  // Dimensions for the preview container (high res reference)
  // We will scale this down via CSS transform for display
  const getDimensions = () => {
    switch (size) {
      case "SQUARE_1080": return { w: 1080, h: 1080 };
      case "STORY_9_16": return { w: 1080, h: 1920 };
      case "REEL_9_16": return { w: 1080, h: 1920 };
      default: return { w: 1080, h: 1080 };
    }
  };

  const { w, h } = getDimensions();

  const generateImageBlob = async (pixelRatio: number) => {
    if (!previewRef.current) return null;
    const safeZonesVisible = showSafeZones;
    if (safeZonesVisible) setShowSafeZones(false);
    
    try {
        // Small delay to allow react to hide safe zones if needed
        await new Promise(r => setTimeout(r, 100));
        
        const dataUrl = await toPng(previewRef.current, { 
            cacheBust: true, 
            width: w, 
            height: h,
            pixelRatio: pixelRatio,
            canvasWidth: w * pixelRatio,
            canvasHeight: h * pixelRatio
        });
        return dataUrl;
    } catch(e) {
        console.error("Image generation failed", e);
        return null;
    } finally {
        if (safeZonesVisible) setShowSafeZones(true);
    }
  };

  const handleDownload = async () => {
    setIsExporting(true);
    const pixelRatio = exportQuality === 'high' ? 2 : 1;
    const dataUrl = await generateImageBlob(pixelRatio);
    
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `offer-${template.id}-${size}-${exportQuality}.png`;
      link.href = dataUrl;
      link.click();
    } else {
      alert("Failed to export PNG. Please try again.");
    }
    
    setIsExporting(false);
  };

  const handleAnimateClick = async () => {
      if (!onAnimate) return;
      setIsExporting(true);
      // Use standard quality for animation source to ensure performance
      const dataUrl = await generateImageBlob(1); 
      if (dataUrl) {
          onAnimate(dataUrl);
      }
      setIsExporting(false);
  };

  const resolvedText: Record<string, string> = {};
  if (offerCopy) {
      resolvedText['headline'] = offerCopy.headline;
      resolvedText['subheadline'] = offerCopy.subheadline || '';
      resolvedText['cta'] = offerCopy.cta;
  }
  // Fallbacks
  if (!resolvedText['headline']) resolvedText['headline'] = "YOUR HEADLINE";
  if (!resolvedText['cta']) resolvedText['cta'] = "SHOP NOW";

  // Helper to get border radius value
  const getRadius = (r?: string) => {
    switch(r) {
        case 'none': return '0px';
        case 'sm': return '8px';
        case 'md': return '16px';
        case 'lg': return '24px';
        case 'full': return '9999px';
        default: return '0px';
    }
  };

  // Logic to determine what to show
  const isCustomTemplate = template.id === 'custom-uploaded' && customTemplateBg;

  return (
    <div className="flex flex-col gap-4 items-center w-full h-full justify-center">
        {/* Toggle Controls */}
        <div className="flex gap-4 mb-2">
           <button 
             onClick={() => setShowSafeZones(!showSafeZones)}
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${showSafeZones ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
           >
             <ShieldAlert size={12} />
             Safe Zones
           </button>
           
           <div className="flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1.5 text-xs text-slate-300">
               <Settings2 size={12} />
               <select 
                  value={exportQuality} 
                  onChange={(e) => setExportQuality(e.target.value as 'standard' | 'high')}
                  className="bg-transparent border-none focus:ring-0 p-0 text-white font-medium cursor-pointer"
               >
                   <option value="standard">Standard Quality (1x)</option>
                   <option value="high">High Res (2x)</option>
               </select>
           </div>
        </div>

        {/* Container for the preview area */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-900/50 rounded-lg border border-slate-800 p-4">
             {/* Scaled Wrapper: This keeps the high-res div visible but scaled to fit */}
             <div 
               style={{ 
                   width: w, 
                   height: h, 
                   transform: 'scale(0.35)', // Static scale for UI, could be dynamic based on window size
                   transformOrigin: 'center center',
                   flexShrink: 0
               }}
               className="shadow-2xl"
             >
                {/* The Actual High-Res Content Node */}
                <div 
                    ref={previewRef}
                    className="relative bg-slate-800 overflow-hidden"
                    style={{ width: w, height: h }}
                >
                    {/* 1. BACKGROUND LAYER */}
                    {isCustomTemplate ? (
                        <img 
                            src={customTemplateBg} 
                            alt="Custom Background" 
                            className="absolute inset-0 w-full h-full object-cover" 
                            crossOrigin="anonymous" 
                        />
                    ) : (
                        // Standard mode: Image IS the background (if exists)
                        imageUrl ? (
                             <img 
                                src={imageUrl} 
                                alt="Product" 
                                className="absolute inset-0 w-full h-full object-cover" 
                                crossOrigin="anonymous" 
                             />
                        ) : (
                             <div className="absolute inset-0 flex items-center justify-center bg-slate-700 text-slate-500">
                                 <Layout size={100} opacity={0.5} />
                             </div>
                        )
                    )}

                    {/* 1.5 PRODUCT OVERLAY (Only if using Custom Template) */}
                    {isCustomTemplate && imageUrl && (
                         <div className="absolute top-[10%] left-[10%] right-[10%] bottom-[20%] flex items-center justify-center pointer-events-none">
                             <img 
                                 src={imageUrl} 
                                 alt="Product Overlay" 
                                 className="w-full h-full object-contain drop-shadow-2xl"
                                 crossOrigin="anonymous"
                             />
                         </div>
                    )}

                    {/* 2. Overlays */}
                    {!isCustomTemplate && template.backgroundStyle?.overlayColor && (
                        <div 
                            className="absolute inset-0 pointer-events-none" 
                            style={{ backgroundColor: template.backgroundStyle.overlayColor }} 
                        />
                    )}
                    {!isCustomTemplate && template.backgroundStyle?.gradient && (
                        <div 
                            className="absolute inset-0 pointer-events-none" 
                            style={{ background: template.backgroundStyle.gradient }} 
                        />
                    )}

                    {/* 3. Text Zones */}
                    {template.textZones.map((zone, idx) => {
                        let content = "";
                        if (zone.role === 'headline') content = resolvedText['headline'];
                        else if (zone.role === 'subheadline') content = resolvedText['subheadline'];
                        else if (zone.role === 'cta') content = resolvedText['cta'];
                        else if (zone.role === 'priceBefore' && product.priceBefore) content = `${product.priceBefore} ${product.currency}`;
                        else if (zone.role === 'priceAfter' && product.priceAfter) content = `${product.priceAfter} ${product.currency}`;
                        else if (zone.role === 'productCode') content = product.id;

                        if (!content) return null;

                        const fontSize = h * zone.fontSizeRatio;

                        // Apply Brand Kit Styles if available
                        const fontFamily = brandKit 
                             ? (zone.role === 'headline' || zone.role === 'cta' ? brandKit.primaryFont : brandKit.secondaryFont) 
                             : (zone.fontFamily || 'Inter, sans-serif');
                        
                        let bgColor = zone.background || 'transparent';
                        if (brandKit && zone.role === 'cta' && zone.background) bgColor = brandKit.primaryColor;
                        if (brandKit && zone.role === 'priceAfter' && zone.background) bgColor = brandKit.accentColor;

                        let textColor = zone.color || '#fff';
                        if (brandKit && zone.role === 'cta') textColor = brandKit.secondaryColor;

                        const borderRadius = brandKit ? getRadius(brandKit.defaultBorderRadius) : (zone.background ? '16px' : '0');

                        // Determine positioning based on alignment
                        let transformX = '0%';
                        let justifyContent = 'flex-start';

                        if (zone.align === 'center') {
                            transformX = '-50%';
                            justifyContent = 'center';
                        } else if (zone.align === 'right') {
                            transformX = '-100%';
                            justifyContent = 'flex-end';
                        }

                        return (
                            <div
                                key={idx}
                                style={{
                                    position: 'absolute',
                                    left: `${zone.x * 100}%`,
                                    top: `${zone.y * 100}%`,
                                    width: `${zone.maxWidth * 100}%`,
                                    transform: `translate(${transformX}, -50%)`, // -50% Y centers vertically
                                    display: 'flex',
                                    justifyContent: justifyContent,
                                    pointerEvents: 'none'
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily,
                                        fontSize: `${fontSize}px`,
                                        fontWeight: zone.fontWeight || 'normal',
                                        color: textColor,
                                        textAlign: (zone.align as any) || 'left',
                                        backgroundColor: bgColor,
                                        padding: zone.padding ? `${zone.padding}px` : '0',
                                        borderRadius: borderRadius,
                                        maxWidth: '100%', 
                                        boxShadow: brandKit && bgColor !== 'transparent' 
                                            ? (brandKit.defaultShadow === 'strong' ? '0 10px 15px -3px rgba(0,0,0,0.5)' : brandKit.defaultShadow === 'soft' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none') 
                                            : 'none',
                                        textDecoration: zone.role === 'priceBefore' ? 'line-through' : 'none'
                                    }}
                                >
                                    {content}
                                </div>
                            </div>
                        );
                    })}

                    {/* 4. Safe Zone Overlay */}
                    {showSafeZones && (
                         <div className="absolute inset-0 pointer-events-none z-50">
                             {(size === 'STORY_9_16' || size === 'REEL_9_16') && (
                                 <div className="absolute top-0 left-0 right-0 h-[200px] bg-red-500/20 border-b border-red-500/50 flex items-center justify-center">
                                     <span className="text-white/70 font-bold text-4xl uppercase">System UI</span>
                                 </div>
                             )}
                             {(size === 'STORY_9_16' || size === 'REEL_9_16') && (
                                 <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-red-500/20 border-t border-red-500/50 flex items-center justify-center">
                                     <span className="text-white/70 font-bold text-4xl uppercase">Swipe / Reply</span>
                                 </div>
                             )}
                             {(size === 'REEL_9_16') && (
                                 <div className="absolute bottom-[300px] right-0 w-[160px] h-[600px] bg-red-500/20 border-l border-red-500/50 flex items-center justify-center">
                                     <span className="text-white/70 font-bold text-4xl -rotate-90">Actions</span>
                                 </div>
                             )}
                         </div>
                    )}

                </div>
             </div>
        </div>

        <div className="flex gap-2 w-full justify-center">
            <Button onClick={handleDownload} disabled={isExporting || (!imageUrl && !isCustomTemplate)}>
                <Download size={18} /> {isExporting ? 'Processing...' : 'Export PNG'}
            </Button>
            {onAnimate && (
                <Button 
                    onClick={handleAnimateClick} 
                    disabled={isExporting || (!imageUrl && !isCustomTemplate)}
                    className="bg-pink-600 hover:bg-pink-500 text-white shadow-pink-500/20 border-none"
                >
                    <Clapperboard size={18} /> Animate
                </Button>
            )}
        </div>
    </div>
  );
};