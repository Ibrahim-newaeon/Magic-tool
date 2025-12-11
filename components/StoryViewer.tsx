import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimationType, TextOverlay } from '../types';
import { Play, Pause, X, Download, Video, Loader2, AlertCircle, Clock, Volume2, VolumeX, Sparkles, Sliders } from 'lucide-react';
import { STORY_PRESETS, StoryAnimationPreset } from '../types/storyTypes';

interface StoryViewerProps {
  imageUrl: string | null;
  overlayText?: TextOverlay | null;
  audioUrl?: string | null;
  onClose?: () => void;
  isActive: boolean;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ imageUrl, overlayText, audioUrl, onClose, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [activePresetId, setActivePresetId] = useState<string>('cinematic');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Animation Params
  const [animation, setAnimation] = useState<AnimationType>(AnimationType.ZOOM_IN);
  const [duration, setDuration] = useState<number>(10000); // Default 10 seconds
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  const imageRef = useRef<HTMLImageElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const durationOptions = [
    { value: 5000, label: '5s' },
    { value: 7000, label: '7s' },
    { value: 10000, label: '10s' },
    { value: 15000, label: '15s' },
  ];

  useEffect(() => {
    // Check for MediaRecorder support
    if (typeof MediaRecorder === 'undefined') {
      setIsSupported(false);
    }
  }, []);

  // Update animation based on Preset
  useEffect(() => {
    if (!showAdvanced) {
      const preset = STORY_PRESETS.find(p => p.id === activePresetId);
      if (preset) {
        setAnimation(preset.animation);
        setDuration(preset.duration);
        startTimeRef.current = 0;
      }
    }
  }, [activePresetId, showAdvanced]);

  // Audio Playback Sync
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying && !isExporting) {
      audioRef.current.play().catch(e => console.log("Audio play failed (user interaction needed first)", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isExporting, audioUrl]);

  // Audio Mute toggle effect
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Initialize and Load Image
  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      startTimeRef.current = 0; 
      draw(performance.now());
    };
  }, [imageUrl]);

  // Toggle Play/Pause
  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (isExporting) return;
    if (e) e.stopPropagation();
    setIsPlaying(prev => !prev);
  }, [isExporting]);

  // Helper to wrap text
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

  // Animation Loop
  const draw = useCallback((timestamp: number) => {
    if (!canvasRef.current || !imageRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    
    // Normalizing time 0 to 1 based on selected duration
    const progress = (elapsed % duration) / duration;

    // Reset Audio if looping
    if (audioRef.current && isPlaying && !isExporting) {
        const loopTime = elapsed % duration;
        if (loopTime < 50 && elapsed > 100) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
        }
    }

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1080, 1920);

    const img = imageRef.current;
    
    // Calculate "Cover" dimensions
    const scaleFactor = Math.max(1080 / img.width, 1920 / img.height);
    const w = img.width * scaleFactor;
    const h = img.height * scaleFactor;
    const x = (1080 - w) / 2;
    const y = (1920 - h) / 2;

    ctx.save();
    
    // Center point for transforms
    ctx.translate(540, 960);

    // BACKGROUND ANIMATIONS
    const isTextAnim = animation === AnimationType.TEXT_TYPEWRITER || animation === AnimationType.TEXT_FADE_UP;
    const activeBgAnim = isTextAnim ? AnimationType.ZOOM_IN : animation;

    switch (activeBgAnim) {
      case AnimationType.ZOOM_IN: {
        const scale = 1 + (progress * 0.15); 
        ctx.scale(scale, scale);
        break;
      }
      case AnimationType.ZOOM_OUT: {
        const scale = 1.15 - (progress * 0.15); 
        ctx.scale(scale, scale);
        break;
      }
      case AnimationType.PAN_LEFT_RIGHT: {
        ctx.scale(1.2, 1.2);
        const shiftX = 80 - (progress * 160); 
        ctx.translate(shiftX, 0);
        break;
      }
      case AnimationType.PAN_RIGHT_LEFT: {
        ctx.scale(1.2, 1.2);
        const shiftX = -80 + (progress * 160); 
        ctx.translate(shiftX, 0);
        break;
      }
      case AnimationType.PAN_TOP_BOTTOM: {
        ctx.scale(1.2, 1.2);
        const shiftY = 120 - (progress * 240);
        ctx.translate(0, shiftY);
        break;
      }
      case AnimationType.ZOOM_ROTATE: {
        const scale = 1 + (progress * 0.15);
        const rotation = (progress * 3) * (Math.PI / 180); 
        ctx.scale(scale, scale);
        ctx.rotate(rotation);
        break;
      }
      case AnimationType.BREATHE: {
        const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.05; 
        ctx.scale(scale, scale);
        break;
      }
      case AnimationType.FADE: {
        const scale = 1 + (progress * 0.08);
        ctx.scale(scale, scale);
        let opacity = 1;
        if (progress < 0.15) opacity = progress / 0.15;
        else if (progress > 0.85) opacity = (1 - progress) / 0.15;
        ctx.globalAlpha = opacity;
        break;
      }
      case AnimationType.PARALLAX: {
        const scale = 1.15;
        ctx.scale(scale, scale);
        const t = progress * Math.PI * 2;
        const moveX = Math.sin(t) * 30;
        const moveY = Math.cos(t * 1.5) * 20; 
        ctx.translate(moveX, moveY);
        break;
      }
      case AnimationType.TILT: {
        const scale = 1.15; 
        ctx.scale(scale, scale);
        const angleDeg = Math.sin(progress * Math.PI * 2) * 3;
        ctx.rotate(angleDeg * (Math.PI / 180));
        break;
      }
      case AnimationType.POP: {
        let scale = 1.0;
        if (progress < 0.1) {
           const p = progress / 0.1;
           scale = 1.0 + (p * 0.05);
        } else {
           scale = 1.05;
        }
        ctx.scale(scale, scale);
        break;
      }
    }

    // Reset origin for background image
    ctx.translate(-540, -960);
    ctx.drawImage(img, x, y, w, h);
    
    // Cinematic vignette
    const gradient = ctx.createRadialGradient(540, 960, 500, 540, 960, 1200);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,1080,1920);

    ctx.restore();

    // TEXT OVERLAY RENDERING
    if (overlayText && overlayText.text) {
      ctx.save();
      
      let startX = 540;
      let startY = 960; // Default center
      let maxWidth = 900;
      let fontSize = 64;

      // Handle Text Positioning if bounding box is present
      if (overlayText.boundingBox && overlayText.boundingBox.length === 4) {
          const [ymin, xmin, ymax, xmax] = overlayText.boundingBox;
          
          // Normalized 0-1000 coords to image coords
          const relX = xmin / 1000;
          const relY = ymin / 1000;
          const relW = (xmax - xmin) / 1000;
          const relH = (ymax - ymin) / 1000;

          // Map to Canvas Coords
          const boxX = x + (relX * w);
          const boxY = y + (relY * h);
          const boxW = relW * w;
          const boxH = relH * h;

          // Set drawing position to center of the box
          startX = boxX + (boxW / 2);
          startY = boxY + (boxH / 2);
          maxWidth = boxW;

           if (boxW < 600) fontSize = 48;
           if (boxW < 400) fontSize = 32;
      } else {
        // Manual Text Position
        if (overlayText.style && overlayText.style.position) {
            const pos = overlayText.style.position;
            const margin = 100;
            
            // X alignment
            if (pos.includes('left')) { startX = margin; ctx.textAlign = 'left'; }
            else if (pos.includes('right')) { startX = 1080 - margin; ctx.textAlign = 'right'; }
            else { startX = 540; ctx.textAlign = 'center'; }
            
            // Y alignment
            if (pos.includes('top')) startY = margin * 2;
            else if (pos.includes('bottom')) startY = 1920 - (margin * 2);
            else startY = 960;

        } else {
            startY = 1400; 
            ctx.textAlign = 'center';
        }
      }

      ctx.textBaseline = 'middle';
      
      // Font Styling
      const fontName = overlayText.style?.fontFamily || '"Inter", sans-serif';
      const sizeRatio = overlayText.style?.fontSizeRatio || 1.0;
      const finalFontSize = fontSize * sizeRatio;
      
      ctx.font = `bold ${finalFontSize}px ${fontName}`;
      ctx.fillStyle = overlayText.style?.color || '#ffffff';
      
      const lineHeight = finalFontSize * 1.4;
      const lines = wrapText(ctx, overlayText.text, maxWidth);
      
      // Adjust startY to center vertically
      const totalHeight = lines.length * lineHeight;
      let currentY = startY - (totalHeight / 2) + (lineHeight / 2);

      // Determine Text Animation Type
      let textAnimType = AnimationType.TEXT_FADE_UP;
      
      // If preset is "Hype", use Typewriter
      if (activePresetId === 'hype') textAnimType = AnimationType.TEXT_TYPEWRITER;
      
      // Manual override for explicit animation types
      if (animation === AnimationType.TEXT_TYPEWRITER) textAnimType = AnimationType.TEXT_TYPEWRITER;
      if (animation === AnimationType.TEXT_FADE_UP) textAnimType = AnimationType.TEXT_FADE_UP;

      if (textAnimType === AnimationType.TEXT_FADE_UP) {
        // Fade in + Slide Up
        let textOpacity = 1;
        let textOffset = 0;
        
        if (progress < 0.2) {
          textOpacity = progress / 0.2;
          textOffset = 100 * (1 - (progress / 0.2)); // Slide up 100px
        }
        
        ctx.globalAlpha = textOpacity;
        currentY += textOffset;
      } 
      else if (textAnimType === AnimationType.TEXT_TYPEWRITER) {
         const totalChars = overlayText.text.length;
         const charsToShow = Math.floor((progress / 0.4) * totalChars); 
         
         let charCount = 0;
         lines.forEach((line, i) => {
            const y = currentY + (i * lineHeight);
            
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 4;

            if (charCount < charsToShow) {
               let textToDraw = line;
               if (charCount + line.length > charsToShow) {
                  textToDraw = line.substring(0, charsToShow - charCount);
               }
               ctx.fillText(textToDraw, startX, y);
            }
            charCount += line.length + 1; 
         });
         
         ctx.restore();
         if (isPlaying || isExporting) {
             requestRef.current = requestAnimationFrame(draw);
         }
         return; 
      }
      else {
        ctx.globalAlpha = 1;
      }

      // Draw Lines (for non-typewriter modes)
      lines.forEach((line, i) => {
        const y = currentY + (i * lineHeight);
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.fillText(line, startX, y);
      });
      
      ctx.restore();
    }

    if (isPlaying || isExporting) {
      requestRef.current = requestAnimationFrame(draw);
    }
  }, [animation, isPlaying, isExporting, overlayText, duration, activePresetId]);

  useEffect(() => {
    if (isPlaying || isExporting) {
      requestRef.current = requestAnimationFrame(draw);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isExporting, draw]);


  const handleDownloadImage = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `story-magic-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportVideo = async () => {
    if (!canvasRef.current) return;
    if (!isSupported) {
        alert("Video export is not supported in this browser.");
        return;
    }
    
    setIsExporting(true);
    setIsPlaying(true);
    startTimeRef.current = performance.now();
    if(audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }

    const canvas = canvasRef.current;
    
    const mimeTypes = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=h264',
        'video/webm;codecs=vp9',
        'video/webm'
    ];
    const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
    
    if (!mimeType) {
        setIsExporting(false);
        alert("Your browser does not support video export.");
        return;
    }

    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const canvasStream = (canvas as any).captureStream(30); 
    let combinedStream = canvasStream;
    let audioContext: AudioContext | null = null;
    let destNode: MediaStreamAudioDestinationNode | null = null;

    if (audioUrl && audioRef.current) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            destNode = audioContext.createMediaStreamDestination();
            
            const response = await fetch(audioUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            const bufferSource = audioContext.createBufferSource();
            bufferSource.buffer = audioBuffer;
            bufferSource.connect(destNode);
            bufferSource.start(0); 
            
            const audioTrack = destNode.stream.getAudioTracks()[0];
            combinedStream = new MediaStream([...canvasStream.getVideoTracks(), audioTrack]);
        } catch (e) {
            console.warn("Audio mixing failed", e);
        }
    }

    try {
        const mediaRecorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 8000000 });
        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `story-video-${Date.now()}.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setIsExporting(false);
          if (audioContext && audioContext.state !== 'closed') audioContext.close();
        };

        mediaRecorder.start();
        setTimeout(() => { if (mediaRecorder.state !== 'inactive') mediaRecorder.stop(); }, duration);
    } catch (e) {
        console.error("MediaRecorder error:", e);
        setIsExporting(false);
        alert("Video export failed.");
    }
  };

  const animationOptions = [
    { id: AnimationType.ZOOM_IN, label: 'Zoom In' },
    { id: AnimationType.PAN_LEFT_RIGHT, label: 'Pan L→R' },
    { id: AnimationType.ZOOM_ROTATE, label: 'Spin' },
    { id: AnimationType.BREATHE, label: 'Pulse' },
    { id: AnimationType.FADE, label: 'Fade' },
    { id: AnimationType.POP, label: 'Pop' },
  ];

  if (!imageUrl) return null;

  return (
    <div 
      className={`relative w-full h-full bg-black overflow-hidden flex flex-col ${isActive ? 'cursor-default' : ''}`}
      ref={containerRef}
    >
      {audioUrl && (
          <audio ref={audioRef} src={audioUrl} loop crossOrigin="anonymous" className="hidden" />
      )}

      {/* Background Blur */}
      <div 
        className="absolute inset-0 opacity-50 blur-xl scale-110 z-0"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
      />

      {/* Main Content */}
      <div className="z-10 flex-1 flex flex-col items-center justify-center p-4 gap-4 w-full h-full max-w-7xl mx-auto">
        
        {/* VIDEO CONTAINER */}
        <div className="relative flex-1 w-full min-h-0 flex items-center justify-center" onClick={togglePlay}>
          <div className="relative aspect-[9/16] h-full max-h-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-gray-900 group cursor-pointer">
             <canvas ref={canvasRef} width={1080} height={1920} className="w-full h-full object-contain bg-black" />
             {!isPlaying && !isExporting && (
               <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 animate-in fade-in zoom-in duration-200">
                     <Play size={36} fill="currentColor" className="text-white ml-2" />
                  </div>
               </div>
             )}
             <div className="absolute top-0 left-0 right-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] flex justify-between items-start" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 overflow-hidden max-w-[200px] mt-1">
                  <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                     <div className="h-full bg-white/90" style={{ width: '100%', animation: isPlaying ? `width ${duration}ms linear infinite` : 'none' }}></div>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onClose?.(); }} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors">
                      <X size={20} />
                </button>
             </div>
             {isExporting && (
               <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-center p-6">
                  <Loader2 size={48} className="text-indigo-500 animate-spin mb-4" />
                  <h3 className="text-white font-semibold">Creating Story...</h3>
               </div>
             )}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="shrink-0 w-full max-w-lg flex flex-col gap-3 bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
               <button onClick={togglePlay} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-all">
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
               </button>
               
               <div className="h-8 w-px bg-white/10 mx-1"></div>

               {/* Preset Tabs */}
               {!showAdvanced && (
                 <div className="flex gap-1 overflow-x-auto no-scrollbar mask-gradient flex-1">
                    {STORY_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => setActivePresetId(preset.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${activePresetId === preset.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-transparent text-slate-400'}`}
                        >
                           {preset.label}
                        </button>
                    ))}
                 </div>
               )}

               {/* Toggle Advanced */}
               <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`p-2 rounded-lg transition-colors ${showAdvanced ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                  title="Advanced Settings"
               >
                   <Sliders size={18} />
               </button>
            </div>

            {/* Advanced Controls */}
            {showAdvanced && (
                <div className="space-y-3 pt-2 border-t border-slate-700/50">
                    <div className="flex flex-col gap-2">
                         <label className="text-xs text-slate-400 font-bold uppercase">Duration</label>
                         <div className="flex gap-2">
                            {durationOptions.map(opt => (
                                <button key={opt.value} onClick={() => setDuration(opt.value)} className={`flex-1 py-1.5 text-xs font-bold rounded ${duration === opt.value ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                    {opt.label}
                                </button>
                            ))}
                         </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-slate-400 font-bold uppercase">Base Animation</label>
                        <div className="grid grid-cols-3 gap-2">
                            {animationOptions.map(anim => (
                                <button key={anim.id} onClick={() => setAnimation(anim.id as AnimationType)} className={`py-1.5 text-[10px] font-bold rounded ${animation === anim.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                    {anim.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Export */}
            <div className="flex gap-2 mt-1">
                 <button onClick={handleDownloadImage} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white">
                     <Download size={20} />
                 </button>
                 <button 
                    onClick={handleExportVideo}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg"
                 >
                    <Video size={20} />
                    <span>Export Video</span>
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};
