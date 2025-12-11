export enum AnimationType {
  ZOOM_IN = 'zoom_in',
  ZOOM_OUT = 'zoom_out',
  PAN_LEFT_RIGHT = 'pan_left_right',
  PAN_RIGHT_LEFT = 'pan_right_left',
  PAN_TOP_BOTTOM = 'pan_top_bottom',
  PAN_BOTTOM_TOP = 'pan_bottom_top',
  ZOOM_ROTATE = 'zoom_rotate',
  BREATHE = 'breathe',
  FADE = 'fade',
  PARALLAX = 'parallax',
  TILT = 'tilt',
  POP = 'pop',
  TEXT_TYPEWRITER = 'text_typewriter',
  TEXT_FADE_UP = 'text_fade_up'
}

export interface GeneratedImage {
  originalUrl: string;
  editedUrl: string | null;
  prompt: string;
  timestamp: number;
}

export interface ProcessingState {
  isGenerating: boolean;
  error: string | null;
}

export interface TextOverlay {
  text: string;
  boundingBox?: [number, number, number, number]; // ymin, xmin, ymax, xmax (0-1000)
  style?: {
    fontFamily: string;
    color: string;
    fontSizeRatio: number; // 1.0 is default
    position: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  }
}

export interface HistoryItem {
  id: string;
  url: string; // base64
  mimeType: string;
  timestamp: number;
}