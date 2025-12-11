import { OfferTemplate } from "../types/offerTemplate";

export const OFFER_TEMPLATES: OfferTemplate[] = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Clean layout with whitespace and elegant typography.",
    supportedSizes: ["SQUARE_1080", "STORY_9_16", "REEL_9_16"],
    defaultSize: "SQUARE_1080",
    backgroundStyle: {
      overlayColor: "rgba(255, 255, 255, 0.1)"
    },
    textZones: [
      {
        id: "headline",
        role: "headline",
        x: 0.5,
        y: 0.15,
        maxWidth: 0.8,
        align: "center",
        fontSizeRatio: 0.08,
        fontWeight: "bold",
        color: "#ffffff",
        fontFamily: "Playfair Display"
      },
      {
        id: "subheadline",
        role: "subheadline",
        x: 0.5,
        y: 0.23,
        maxWidth: 0.7,
        align: "center",
        fontSizeRatio: 0.04,
        fontWeight: "normal",
        color: "#e2e8f0"
      },
      {
        id: "priceAfter",
        role: "priceAfter",
        x: 0.5,
        y: 0.75,
        maxWidth: 0.4,
        align: "center",
        fontSizeRatio: 0.1,
        fontWeight: "bold",
        color: "#fbbf24", // Amber-400
        background: "rgba(0,0,0,0.6)",
        padding: 20
      },
      {
        id: "priceBefore",
        role: "priceBefore",
        x: 0.5,
        y: 0.82,
        maxWidth: 0.3,
        align: "center",
        fontSizeRatio: 0.04,
        fontWeight: "normal",
        color: "#94a3b8" // Slate-400
      },
      {
        id: "cta",
        role: "cta",
        x: 0.5,
        y: 0.9,
        maxWidth: 0.5,
        align: "center",
        fontSizeRatio: 0.045,
        fontWeight: "bold",
        color: "#000000",
        background: "#ffffff",
        padding: 15
      }
    ]
  },
  {
    id: "bold-sale",
    name: "Bold Sale",
    description: "High impact design with strong contrasts.",
    supportedSizes: ["SQUARE_1080", "STORY_9_16"],
    defaultSize: "STORY_9_16",
    backgroundStyle: {
      overlayColor: "rgba(0,0,0,0.3)",
      gradient: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)"
    },
    textZones: [
      {
        id: "headline",
        role: "headline",
        x: 0.1,
        y: 0.65,
        maxWidth: 0.8,
        align: "left",
        fontSizeRatio: 0.09,
        fontWeight: "bold",
        color: "#ffffff",
        fontFamily: "Montserrat"
      },
      {
        id: "priceAfter",
        role: "priceAfter",
        x: 0.1,
        y: 0.1,
        maxWidth: 0.4,
        align: "center",
        fontSizeRatio: 0.08,
        fontWeight: "bold",
        color: "#ffffff",
        background: "#dc2626", // Red-600
        padding: 25
      },
      {
        id: "subheadline",
        role: "subheadline",
        x: 0.1,
        y: 0.75,
        maxWidth: 0.8,
        align: "left",
        fontSizeRatio: 0.04,
        fontWeight: "normal",
        color: "#cbd5e1"
      },
      {
        id: "cta",
        role: "cta",
        x: 0.1,
        y: 0.85,
        maxWidth: 0.5,
        align: "center",
        fontSizeRatio: 0.05,
        fontWeight: "bold",
        color: "#000000",
        background: "#fbbf24",
        padding: 15
      }
    ]
  },
  {
    id: "fashion-editorial",
    name: "Fashion Editorial",
    description: "Minimal text placement for showcasing imagery.",
    supportedSizes: ["SQUARE_1080", "STORY_9_16"],
    defaultSize: "STORY_9_16",
    backgroundStyle: {
       overlayColor: "rgba(0,0,0,0.05)"
    },
    textZones: [
      {
        id: "productCode",
        role: "productCode",
        x: 0.9,
        y: 0.05,
        maxWidth: 0.3,
        align: "right",
        fontSizeRatio: 0.02,
        fontWeight: "normal",
        color: "#ffffff",
        fontFamily: "Roboto Mono"
      },
      {
        id: "headline",
        role: "headline",
        x: 0.5,
        y: 0.45,
        maxWidth: 0.9,
        align: "center",
        fontSizeRatio: 0.12,
        fontWeight: "bold",
        color: "#ffffff",
        fontFamily: "Playfair Display"
      },
      {
        id: "cta",
        role: "cta",
        x: 0.5,
        y: 0.92,
        maxWidth: 0.6,
        align: "center",
        fontSizeRatio: 0.03,
        fontWeight: "bold",
        color: "#ffffff",
        background: "transparent",
        padding: 10
      }
    ]
  }
];