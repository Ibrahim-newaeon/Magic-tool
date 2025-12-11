export type CreativeSize = "SQUARE_1080" | "STORY_9_16" | "REEL_9_16";

export interface ProductInfo {
  id: string;           // product code / SKU
  name: string;
  priceBefore: number;
  priceAfter: number;
  currency: string;     // e.g., "USD", "EUR", "SAR"
}

export interface GeneratedOfferCopy {
  headline: string;
  subheadline?: string;
  cta: string;
}

export interface AdCopy extends GeneratedOfferCopy {
  // Backwards compatibility
}

export interface TextZone {
  id: string;
  role:
    | "headline"
    | "subheadline"
    | "priceBefore"
    | "priceAfter"
    | "productCode"
    | "cta"
    | "extra";
  x: number;        // 0–1 relative to width
  y: number;        // 0–1 relative to height
  maxWidth: number; // 0–1 relative to width
  align?: "left" | "center" | "right";
  fontSizeRatio: number; // Relative to canvas base size
  fontWeight?: "normal" | "bold";
  color?: string;
  fontFamily?: string;
  background?: string; // Optional background color for text box
  padding?: number;
}

export interface OfferTemplate {
  id: string;
  name: string;
  description: string;
  supportedSizes: CreativeSize[];
  defaultSize: CreativeSize;
  textZones: TextZone[];
  backgroundStyle?: {
    overlayColor?: string; // e.g. "rgba(0,0,0,0.5)"
    gradient?: string;
  };
}

// --- FEATURE 1: PRESETS ---
export interface OfferPreset {
  id: string;
  name: string;
  templateId: string;
  size: CreativeSize;
  description: string;
  // Could extend to override defaults like specific fonts/colors in the future
}

// --- FEATURE 2: BRAND KIT ---
export interface BrandKit {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  primaryFont: string;
  secondaryFont: string;
  defaultBorderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  defaultShadow: 'none' | 'soft' | 'strong';
}

// --- FEATURE 6: SOCIAL CONTENT ---
export interface SocialContent {
  caption: string;
  hashtags: string[];
}

// --- FEATURE 7: PROJECT ---
export interface Project {
  id: string;
  name: string;
  timestamp: number;
  product: ProductInfo;
  templateId: string;
  size: CreativeSize;
  offerCopy: GeneratedOfferCopy;
  brandKit?: BrandKit;
  socialContent?: SocialContent;
  // Future: animation settings, audio, etc.
}

// --- FEATURE 8: ANIMATION PRESETS ---
export interface AnimationPreset {
  id: string;
  name: string;
  camera: 'static' | 'zoom_in' | 'pan_slow' | 'dynamic';
  textEffect: 'none' | 'typewriter' | 'fade_up' | 'pop';
  duration: number;
}
