# New Aeon Magic Apps v2.2 - Complete Documentation

<div align="center">

**AI-Powered Creative Suite for Social Media Content**

*Built with React 19.2 + TypeScript + Google Gemini 2.5 Flash*

[Live App](https://ai.studio/apps/drive/1Z5dx5NfIIKTL81hk-VPbQ5lSjOrfJ7Pw) | [GitHub Repository](https://github.com/Ibrahim-newaeon/Magic-tool)

</div>

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Architecture](#architecture)
5. [Components Reference](#components-reference)
6. [API Reference](#api-reference)
7. [Configuration](#configuration)
8. [Usage Guide](#usage-guide)
9. [Data Storage](#data-storage)
10. [Export Capabilities](#export-capabilities)

---

## Overview

**New Aeon Magic Apps** is an all-in-one AI creative suite designed for social media content creation. It combines AI-powered image editing, professional offer design, cinematic story animation, and audio integration into a single web application.

### Key Capabilities

| Module | Description | AI-Powered |
|--------|-------------|------------|
| AI Image Studio | Edit images using natural language prompts | Gemini 2.5 Flash |
| Story Animator | Create cinematic video animations from static images | Canvas-based |
| Offer Creator | Design professional retail offers and promotions | Gemini 2.5 Flash |
| Audio Engine | Add royalty-free music to your creations | Library + Upload |

### Tech Stack

- **Frontend**: React 19.2, TypeScript, Tailwind CSS
- **Build Tool**: Vite 6.2
- **AI Engine**: Google Gemini 2.5 Flash API
- **Icons**: Lucide React
- **Export**: html-to-image, MediaRecorder API

---

## Features

### 1. AI Image Studio

Transform images using natural language prompts powered by Google Gemini 2.5 Flash.

**Capabilities:**
- **Magic Prompt Editing**: Describe changes in plain English
  - "Add fireworks to the background"
  - "Apply vintage filter"
  - "Remove background"
  - "Make it cyberpunk style"
- **Smart Text Extraction**: Automatically detect and extract text from images with bounding box coordinates
- **Background Cleaning**: Remove text while intelligently filling the background
- **Image Sources**: Drag & drop upload, URL import, history selection

**Supported Formats:** JPEG, PNG

---

### 2. Story Animator

Create cinematic animations from static images with 14 professional camera movements.

**Animation Types:**

| Animation | Effect | Best For |
|-----------|--------|----------|
| `ZOOM_IN` | Gradual zoom towards center | Dramatic reveals |
| `ZOOM_OUT` | Pull back from center | Context reveals |
| `PAN_LEFT_RIGHT` | Horizontal sweep left to right | Panoramic views |
| `PAN_RIGHT_LEFT` | Horizontal sweep right to left | Alternative pans |
| `PAN_TOP_BOTTOM` | Vertical sweep top to bottom | Tall subjects |
| `PAN_BOTTOM_TOP` | Vertical sweep bottom to top | Building reveals |
| `ZOOM_ROTATE` | Combined zoom with rotation | Dynamic energy |
| `BREATHE` | Subtle scaling pulse | Minimal style |
| `FADE` | Opacity transition | Smooth intros |
| `PARALLAX` | Multi-layer depth effect | 3D feel |
| `TILT` | Rotational tilt | Artistic angle |
| `POP` | Quick scale burst | Hype/energy |

**Animation Presets:**

| Preset | Animation | Duration | Style |
|--------|-----------|----------|-------|
| Cinematic | ZOOM_IN | 10s | Slow, elegant |
| Hype/Pop | POP | 5s | Fast, energetic |
| Showcase | PAN_LEFT_RIGHT | 7s | Panoramic |
| Minimal | BREATHE | 7s | Subtle |
| Dynamic | ZOOM_ROTATE | 5s | Active |

**Text Overlays:**
- 9 position options (top/middle/bottom + left/center/right)
- Text effects: Typewriter, Fade Up
- 5 font families: Inter, Playfair Display, Montserrat, Roboto Mono, Permanent Marker
- Customizable colors and sizes

**Video Export:**
- Format: MP4/WebM (9:16 vertical)
- Resolution: Standard (1x) or High Quality (2x)
- Audio sync included
- Duration: 5-15 seconds configurable

---

### 3. Offer Creator

Design professional retail offers with AI-generated copywriting.

**Template Library:**

| Template | Style | Best For |
|----------|-------|----------|
| Modern Minimal | Clean, serif typography | Luxury brands |
| Bold Sale | High contrast, sans-serif | Flash sales |
| Fashion Editorial | Minimal text, artistic | Fashion/lifestyle |
| Custom Upload | User background | Full customization |

**Output Sizes:**

| Size | Dimensions | Platform |
|------|------------|----------|
| Square (1:1) | 1080 x 1080 px | Instagram Feed |
| Story (9:16) | 1080 x 1920 px | Instagram/FB Stories |
| Reel (9:16) | 1080 x 1920 px | TikTok/Reels (safe zones) |

**AI Copywriting:**
- **Headlines**: Max 8 words, attention-grabbing
- **Subheadlines**: Max 12 words, supporting message
- **CTAs**: Max 3 words, action-oriented
- **Tone Variants**: Standard, Urgent, Luxury, Minimalist

**Product Information:**
- Product name and SKU
- Original and sale prices
- Currency support: USD ($), EUR (€), GBP (£), JPY (¥)

---

### 4. Audio Engine

Add professional audio to your story animations.

**Royalty-Free Library (6 tracks):**

| Track | Category | Duration |
|-------|----------|----------|
| Sentinel | Cinematic | 2:45 |
| Driven To Success | Uplifting | 2:20 |
| Star Ling | Ambient | 3:05 |
| Enthusiast | Energetic | 2:15 |
| Elips | Lo-Fi | 2:40 |
| Homeroad | Ambient | 3:10 |

**Categories:** Cinematic, Uplifting, Ambient, Energetic, Lo-Fi

**Features:**
- Search and filter by category
- Preview playback before selection
- Custom MP3 upload support
- Automatic audio-video sync

---

### 5. Brand Kit System

Maintain consistent branding across all designs.

**Customizable Elements:**

```typescript
{
  primaryColor: "#hex",      // Main brand color
  secondaryColor: "#hex",    // Supporting color
  accentColor: "#hex",       // Highlight color
  primaryFont: "fontname",   // Headlines
  secondaryFont: "fontname", // Body text
  defaultBorderRadius: "none" | "sm" | "md" | "lg" | "full",
  defaultShadow: "none" | "soft" | "strong"
}
```

**Available Fonts:**
- Inter (Modern sans-serif)
- Playfair Display (Elegant serif)
- Montserrat (Bold sans-serif)
- Roboto Mono (Technical)
- Permanent Marker (Handwritten)

---

### 6. Project Management

Save and restore your work sessions.

**Capabilities:**
- Save complete project state
- Load previous projects
- Delete unwanted projects
- Timestamped project list

**Saved Data:**
- Product information
- Selected template and size
- Generated copy
- Brand kit settings
- Social media content

---

### 7. Social Content Generator

AI-generated captions and hashtags for social media.

**Output:**
- **Captions**: 2-3 sentences with emojis
- **Hashtags**: 5-10 relevant tags

---

## Installation

### Prerequisites

- Node.js (v18+ recommended)
- Google Gemini API Key

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Ibrahim-newaeon/Magic-tool.git
cd Magic-tool

# Install dependencies
npm install

# Configure API key
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Architecture

### Project Structure

```
Magic-tool/
├── App.tsx                    # Main application (state management)
├── index.tsx                  # React entry point
├── index.html                 # HTML template
├── types.ts                   # Core type definitions
│
├── components/
│   ├── ImageUpload.tsx        # Image source selector
│   ├── StoryViewer.tsx        # Animation engine
│   ├── OfferCreator.tsx       # Offer workflow
│   ├── OfferPreview.tsx       # Offer rendering
│   ├── OfferCanvas.tsx        # Canvas renderer
│   ├── MusicSelector.tsx      # Audio library
│   ├── Wizard.tsx             # Onboarding flow
│   ├── BrandSettings.tsx      # Brand kit UI
│   ├── ProjectLibrary.tsx     # Project management
│   ├── ProductForm.tsx        # Product inputs
│   └── Button.tsx             # Reusable button
│
├── services/
│   └── geminiService.ts       # Gemini API integration
│
├── types/
│   ├── offerTemplate.ts       # Offer type definitions
│   └── storyTypes.ts          # Animation types
│
├── templates/
│   └── offerTemplates.ts      # Template definitions
│
├── data/
│   └── templates.ts           # Fallback templates
│
└── config files...
```

### Data Flow

```
User Action → React State (App.tsx)
     ↓
Component Update → AI Service Call (if needed)
     ↓
Canvas/DOM Render → Export (PNG/MP4)
     ↓
localStorage (persistence)
```

### State Management

All state is managed in `App.tsx` using React hooks:

- **Image State**: sourceImage, generatedImage, imageHistory
- **Text State**: customText, fontFamily, textColor, textPosition
- **Audio State**: audioUrl, audioFileName, isPlaying
- **Offer State**: selectedTemplate, productInfo, offerCopy, brandKit
- **UI State**: activeTab, showWizard, isGenerating, error

---

## Components Reference

### Core Components

| Component | File | Purpose | Size |
|-----------|------|---------|------|
| App | App.tsx | Main orchestrator | 38KB |
| StoryViewer | components/StoryViewer.tsx | Animation & export | 24KB |
| OfferCreator | components/OfferCreator.tsx | Offer workflow | 19KB |
| OfferPreview | components/OfferPreview.tsx | Offer rendering | 15KB |
| Wizard | components/Wizard.tsx | Onboarding | 13KB |
| ImageUpload | components/ImageUpload.tsx | Image sources | 10KB |
| MusicSelector | components/MusicSelector.tsx | Audio library | 9KB |
| BrandSettings | components/BrandSettings.tsx | Brand kit | 8KB |
| ProjectLibrary | components/ProjectLibrary.tsx | Project save/load | 7KB |
| OfferCanvas | components/OfferCanvas.tsx | Canvas render | 7KB |
| ProductForm | components/ProductForm.tsx | Product inputs | 3KB |
| Button | components/Button.tsx | Reusable button | 2KB |

---

## API Reference

### Gemini Service Functions

Location: `services/geminiService.ts`

#### `editImageWithGemini(base64, mimeType, prompt)`

Edit an image using natural language.

```typescript
const result = await editImageWithGemini(
  imageBase64,           // Base64 encoded image
  'image/jpeg',          // MIME type
  'Add rainbow to sky'   // Edit instruction
);
// Returns: "data:image/png;base64,..."
```

#### `detectTextInImage(base64, mimeType)`

Extract text and bounding boxes from an image.

```typescript
const textData = await detectTextInImage(imageBase64, 'image/png');
// Returns: { text: "SALE 50%", boundingBox: {x, y, width, height} }
```

#### `generateOfferCopy(product, template, size, tone)`

Generate AI copywriting for offers.

```typescript
const copy = await generateOfferCopy(
  { name: 'Summer Dress', price: 99.99, salePrice: 49.99 },
  'modern_minimal',
  'SQUARE_1080',
  'urgent'
);
// Returns: { headline, subheadline, cta }
```

#### `generateSocialContent(product, offerCopy)`

Generate social media captions and hashtags.

```typescript
const social = await generateSocialContent(productInfo, offerCopy);
// Returns: { caption: "...", hashtags: ["#sale", "#fashion", ...] }
```

#### `generateOfferVariants(product, template)`

Generate multiple tone variants for A/B testing.

```typescript
const variants = await generateOfferVariants(product, template);
// Returns: [{ tone: 'urgent', copy: {...} }, { tone: 'luxury', copy: {...} }]
```

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

### Vite Configuration

```typescript
// vite.config.ts
{
  server: {
    port: 3000,
    host: '0.0.0.0'  // Allow external access
  },
  define: {
    'process.env.GEMINI_API_KEY': env.GEMINI_API_KEY
  }
}
```

### TypeScript Configuration

- Target: ES2022
- Module: ESNext
- JSX: react-jsx
- Strict mode enabled

---

## Usage Guide

### Workflow 1: Edit an Image with AI

1. Open the **Studio Editor** tab
2. Upload an image (drag & drop, URL, or history)
3. Enter a prompt describing your desired edit
4. Click **Generate** and wait for Gemini to process
5. View the result and optionally extract text
6. Use in Story Animator or download

### Workflow 2: Create a Story Animation

1. Have an image ready (from Studio or upload)
2. Switch to **Story Mode** tab
3. Select an animation preset or customize:
   - Choose animation type
   - Set duration (5-15s)
   - Add text overlay (optional)
   - Select music track
4. Preview the animation
5. Export as MP4/WebM video

### Workflow 3: Design an Offer

1. Open **Offer Creator** tab (or use Wizard)
2. Enter product information:
   - Name, SKU, prices, currency
3. Select a template and size
4. Configure brand kit colors/fonts
5. Generate AI copy (or write custom)
6. Preview and adjust
7. Export as high-res PNG

### Workflow 4: Use the Wizard

1. Click **Start Wizard** button
2. Step 1: Choose output format (Square/Story/Reel)
3. Step 2: Enter product details
4. Step 3: Select template and brand settings
5. Step 4: Review AI-generated content
6. Click **Complete** to finish setup

---

## Data Storage

### localStorage Keys

| Key | Content | Limit |
|-----|---------|-------|
| `image_history` | Array of recent images (base64) | 6 items |
| `brand_kit` | Brand settings object | 1 object |
| `aeon_projects` | Saved projects array | Unlimited |

### Storage Format

```typescript
// Image History Item
{
  id: string,
  url: string,        // base64 data URL
  mimeType: string,
  timestamp: number
}

// Project
{
  id: string,
  timestamp: number,
  productInfo: ProductInfo,
  templateId: string,
  size: CreativeSize,
  offerCopy: GeneratedOfferCopy,
  brandKit: BrandKit,
  socialContent: SocialContent
}
```

---

## Export Capabilities

### Image Export (PNG)

- **Source**: OfferPreview component
- **Method**: html-to-image library
- **Quality**: 1x (standard) or 2x (high DPI)
- **Sizes**: 1080x1080 or 1080x1920 pixels

### Video Export (MP4/WebM)

- **Source**: StoryViewer component
- **Method**: MediaRecorder API + Canvas stream
- **Quality**: 1x or 2x pixel ratio
- **Format**: 9:16 vertical video
- **Audio**: Synced from selected track
- **Duration**: 5-15 seconds

### Data Export (JSON)

- Projects saved to localStorage
- Can be copied manually for backup

---

## Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI framework |
| react-dom | ^19.2.0 | DOM rendering |
| @google/genai | ^1.30.0 | Gemini API SDK |
| lucide-react | ^0.555.0 | Icon library |
| html-to-image | 1.11.11 | DOM to image |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^6.2.0 | Build tool |
| typescript | ~5.8.2 | Type checking |
| @vitejs/plugin-react | ^5.0.0 | React plugin |
| @types/node | ^22.14.0 | Node types |

### CDN Resources

- Tailwind CSS (styling)
- Google Fonts (Inter, Montserrat, Playfair Display, Roboto Mono, Permanent Marker)

---

## License

This project is private and proprietary.

---

## Support

For issues and feature requests, please contact the development team or open an issue on GitHub.

---

*Documentation generated for New Aeon Magic Apps v2.2*
