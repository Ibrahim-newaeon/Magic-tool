import { AnimationType } from '../types';

export interface StoryAnimationPreset {
  id: string;
  label: string;
  description: string;
  animation: AnimationType;
  duration: number; // ms
  textAnimation?: AnimationType; // If we split text/bg anims later, current StoryViewer infers text anim from overlay existence
}

export const STORY_PRESETS: StoryAnimationPreset[] = [
  {
    id: 'cinematic',
    label: 'Cinematic',
    description: 'Slow zoom with elegant feel',
    animation: AnimationType.ZOOM_IN,
    duration: 10000
  },
  {
    id: 'hype',
    label: 'Hype / Pop',
    description: 'Fast cuts and energetic pulse',
    animation: AnimationType.POP,
    duration: 5000
  },
  {
    id: 'showcase',
    label: 'Showcase',
    description: 'Panoramic view of the product',
    animation: AnimationType.PAN_LEFT_RIGHT,
    duration: 7000
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Subtle breathing effect',
    animation: AnimationType.BREATHE,
    duration: 7000
  },
  {
    id: 'dynamic',
    label: 'Dynamic',
    description: 'Active movement and rotation',
    animation: AnimationType.ZOOM_ROTATE,
    duration: 5000
  }
];
