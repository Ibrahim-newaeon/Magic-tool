import { OfferTemplate } from "../types/offerTemplate";

export const OFFER_TEMPLATES: OfferTemplate[] = [
  {
    id: "custom-uploaded",
    name: "Custom Upload",
    description: "Your own background image with the product centered.",
    defaultSize: "SQUARE_1080",
    supportedSizes: ["SQUARE_1080", "STORY_9_16", "REEL_9_16"],
    backgroundStyle: {
      overlayColor: "transparent"
    },
    textZones: [
      {
        id: "headline",
        role: "headline",
        x: 0.5,
        y: 0.15,
        maxWidth: 0.9,
        align: "center",
        fontSizeRatio: 0.08,
        fontWeight: "bold",
        color: "#000000",
        fontFamily: "Montserrat"
      },
      {
        id: "priceAfter",
        role: "priceAfter",
        x: 0.5,
        y: 0.85,
        maxWidth: 0.4,
        align: "center",
        fontSizeRatio: 0.1,
        fontWeight: "bold",
        color: "#ffffff",
        background: "#dc2626", // Default red box
        padding: 20
      },
      {
        id: "priceBefore",
        role: "priceBefore",
        x: 0.5,
        y: 0.78,
        maxWidth: 0.3,
        align: "center",
        fontSizeRatio: 0.04,
        fontWeight: "normal",
        color: "#64748b"
      },
      {
        id: "cta",
        role: "cta",
        x: 0.5,
        y: 0.93,
        maxWidth: 0.5,
        align: "center",
        fontSizeRatio: 0.04,
        fontWeight: "bold",
        color: "#ffffff",
        background: "#000000",
        padding: 10
      }
    ]
  },
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
  },
  {
    id: "promo-square",
    name: "Generic Promo Square 1080",
    description: "Standard square ad with clear price and CTA.",
    defaultSize: "SQUARE_1080",
    supportedSizes: ["SQUARE_1080"],
    backgroundStyle: {
      overlayColor: "rgba(0,0,0,0.2)"
    },
    textZones: [
      {
        id: "headline",
        role: "headline",
        x: 0.5,
        y: 0.15,
        maxWidth: 0.9,
        align: "center",
        fontSizeRatio: 0.08,
        fontWeight: "bold",
        color: "#ffffff",
        fontFamily: "Montserrat"
      },
      {
        id: "priceBefore",
        role: "priceBefore",
        x: 0.2,
        y: 0.75,
        maxWidth: 0.3,
        align: "right",
        fontSizeRatio: 0.04,
        fontWeight: "normal",
        color: "#e2e8f0"
      },
      {
        id: "priceAfter",
        role: "priceAfter",
        x: 0.2,
        y: 0.85,
        maxWidth: 0.35,
        align: "right",
        fontSizeRatio: 0.09,
        fontWeight: "bold",
        color: "#fbbf24", // Amber
        background: "rgba(0,0,0,0.7)",
        padding: 15
      },
      {
        id: "productCode",
        role: "productCode",
        x: 0.2,
        y: 0.68,
        maxWidth: 0.3,
        align: "right",
        fontSizeRatio: 0.025,
        fontWeight: "normal",
        color: "#cbd5e1"
      },
      {
        id: "cta",
        role: "cta",
        x: 0.75,
        y: 0.85,
        maxWidth: 0.4,
        align: "center",
        fontSizeRatio: 0.05,
        fontWeight: "bold",
        color: "#000000",
        background: "#ffffff",
        padding: 20
      }
    ]
  },
  {
    id: "story-offer",
    name: "Generic Story Offer 9:16",
    description: "Vertical layout optimized for Stories and Reels.",
    defaultSize: "STORY_9_16",
    supportedSizes: ["STORY_9_16", "REEL_9_16"],
    backgroundStyle: {
       gradient: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)"
    },
    textZones: [
      {
        id: "productCode",
        role: "productCode",
        x: 0.5,
        y: 0.05,
        maxWidth: 0.8,
        align: "center",
        fontSizeRatio: 0.015,
        fontWeight: "normal",
        color: "#ffffff",
        fontFamily: "Roboto Mono"
      },
      {
        id: "headline",
        role: "headline",
        x: 0.5,
        y: 0.65,
        maxWidth: 0.85,
        align: "center",
        fontSizeRatio: 0.06,
        fontWeight: "bold",
        color: "#ffffff",
        fontFamily: "Playfair Display"
      },
      {
        id: "subheadline",
        role: "subheadline",
        x: 0.5,
        y: 0.72,
        maxWidth: 0.7,
        align: "center",
        fontSizeRatio: 0.03,
        fontWeight: "normal",
        color: "#cbd5e1"
      },
      {
        id: "priceBefore",
        role: "priceBefore",
        x: 0.5,
        y: 0.55,
        maxWidth: 0.4,
        align: "center",
        fontSizeRatio: 0.03,
        fontWeight: "normal",
        color: "#cbd5e1"
      },
      {
        id: "priceAfter",
        role: "priceAfter",
        x: 0.5,
        y: 0.5,
        maxWidth: 0.6,
        align: "center",
        fontSizeRatio: 0.08,
        fontWeight: "bold",
        color: "#ffffff",
        background: "#ef4444", // Red
        padding: 15
      },
      {
        id: "cta",
        role: "cta",
        x: 0.5,
        y: 0.85,
        maxWidth: 0.6,
        align: "center",
        fontSizeRatio: 0.04,
        fontWeight: "bold",
        color: "#000000",
        background: "#ffffff",
        padding: 20
      }
    ]
  }
];

export const getOfferTemplateById = (id: string): OfferTemplate | undefined =>
  OFFER_TEMPLATES.find((t) => t.id === id);