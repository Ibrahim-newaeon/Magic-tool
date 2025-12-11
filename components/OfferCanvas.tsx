import React, { useRef, useEffect, useState } from 'react';
import { OfferTemplate, ProductInfo, AdCopy, TextZone, CreativeSize } from '../types/offerTemplate';
import { Download } from 'lucide-react';
import { Button } from './Button';

interface OfferCanvasProps {
  template: OfferTemplate;
  product: ProductInfo;
  adCopy: AdCopy;
  imageUrl: string | null;
  size: CreativeSize;
}

export const OfferCanvas: React.FC<OfferCanvasProps> = ({
  template,
  product,
  adCopy,
  imageUrl,
  size
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Determine Canvas Dimensions
  const getDimensions = () => {
    switch (size) {
      case "SQUARE_1080": return { w: 1080, h: 1080 };
      case "STORY_9_16": return { w: 1080, h: 1920 };
      case "REEL_9_16": return { w: 1080, h: 1920 };
      default: return { w: 1080, h: 1080 };
    }
  };

  const { w, h } = getDimensions();

  // Helper: Wrap Text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    return lines;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load Image
    const img = new Image();
    if (imageUrl) {
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
    }

    img.onload = () => {
      draw(ctx, img);
      setIsReady(true);
    };

    // If no image, draw anyway
    if (!imageUrl) {
        draw(ctx, null);
    }

    function draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null) {
      // 1. Clear & Background
      ctx.fillStyle = "#1e293b"; // Slate-800 default
      ctx.fillRect(0, 0, w, h);

      // 2. Draw Image (Cover)
      if (img) {
         // Scale to cover
         const scale = Math.max(w / img.width, h / img.height);
         const iw = img.width * scale;
         const ih = img.height * scale;
         const ix = (w - iw) / 2;
         const iy = (h - ih) / 2;
         ctx.drawImage(img, ix, iy, iw, ih);
      }

      // 3. Template Background Overlays (Gradients/Tints)
      if (template.backgroundStyle) {
          if (template.backgroundStyle.overlayColor) {
              ctx.fillStyle = template.backgroundStyle.overlayColor;
              ctx.fillRect(0, 0, w, h);
          }
          if (template.backgroundStyle.gradient) {
              // Simple vertical gradient approximation if string provided
              const grad = ctx.createLinearGradient(0, 0, 0, h);
              grad.addColorStop(0, "rgba(0,0,0,0)");
              grad.addColorStop(1, "rgba(0,0,0,0.8)");
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, w, h);
          }
      }

      // 4. Render Text Zones
      template.textZones.forEach((zone: TextZone) => {
        let content = "";
        
        // Map data to zones
        switch (zone.role) {
            case "headline": content = adCopy.headline; break;
            case "subheadline": content = adCopy.subheadline; break;
            case "cta": content = adCopy.cta; break;
            case "priceBefore": content = product.priceBefore ? `${product.priceBefore} ${product.currency}` : ""; break;
            case "priceAfter": content = product.priceAfter ? `${product.priceAfter} ${product.currency}` : ""; break;
            case "productCode": content = product.id; break;
        }

        if (!content) return;

        // Styling
        const fontSize = Math.floor(h * zone.fontSizeRatio);
        ctx.font = `${zone.fontWeight || 'normal'} ${fontSize}px ${zone.fontFamily || 'Inter'}`;
        
        // Draw Button/Background if defined
        if (zone.background) {
            ctx.font = `${zone.fontWeight || 'normal'} ${fontSize}px ${zone.fontFamily || 'Inter'}`;
            // Calculate approximate width
            const pad = zone.padding || 0;
            const metrics = ctx.measureText(content);
            const bgW = metrics.width + (pad * 2);
            const bgH = fontSize * 1.4 + (pad); // Approximate height
            
            const bx = (zone.x * w) - (bgW / 2); // Assume centered box for simplicity if align center
            const by = (zone.y * h) - (bgH / 2);

            // Alignment adjustment for box
            let finalBx = bx;
            if (zone.align === 'left') finalBx = zone.x * w;
            if (zone.align === 'right') finalBx = (zone.x * w) - bgW;
            if (zone.align === 'center') finalBx = (zone.x * w) - (bgW / 2);

            ctx.fillStyle = zone.background;
            
            // Rounded rect manually
            const r = 10;
            ctx.beginPath();
            ctx.roundRect(finalBx, by, bgW, bgH, r);
            ctx.fill();
        }

        // Text Properties
        ctx.fillStyle = zone.color || "#ffffff";
        ctx.textAlign = (zone.align as CanvasTextAlign) || "left";
        ctx.textBaseline = "middle";

        const maxWidthPx = zone.maxWidth * w;
        
        // Check for strikethrough (priceBefore)
        if (zone.role === 'priceBefore') {
           // Basic strikethrough
           const metrics = ctx.measureText(content);
           const tx = zone.x * w;
           const ty = zone.y * h;
           
           ctx.fillText(content, tx, ty);
           
           const lineWidth = fontSize * 0.05;
           ctx.lineWidth = lineWidth;
           ctx.strokeStyle = zone.color || "#ffffff";
           ctx.beginPath();
           
           let lineStart = tx;
           if (zone.align === 'center') lineStart = tx - (metrics.width / 2);
           if (zone.align === 'right') lineStart = tx - metrics.width;
           
           ctx.moveTo(lineStart, ty);
           ctx.lineTo(lineStart + metrics.width, ty);
           ctx.stroke();

        } else {
            // Standard Text with Wrap
            const lines = wrapText(ctx, content, maxWidthPx);
            const lineHeight = fontSize * 1.2;
            const totalH = lines.length * lineHeight;
            const startY = (zone.y * h) - (totalH / 2) + (lineHeight / 2);
            
            lines.forEach((line, i) => {
                ctx.fillText(line, zone.x * w, startY + (i * lineHeight));
            });
        }
      });
    }
  }, [template, product, adCopy, imageUrl, size, w, h]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `offer-${product.id || 'creative'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="relative border border-slate-700 shadow-2xl bg-slate-900 rounded-lg overflow-hidden max-h-[600px] aspect-auto">
        <canvas 
          ref={canvasRef}
          width={w}
          height={h}
          className="h-full object-contain max-h-[600px] w-auto"
          style={{ maxWidth: '100%' }}
        />
      </div>
      <Button onClick={handleDownload} disabled={!isReady}>
        <Download size={18} /> Download PNG
      </Button>
    </div>
  );
};