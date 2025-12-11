import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { TextOverlay } from "../types";
import { ProductInfo, AdCopy, OfferTemplate, CreativeSize, GeneratedOfferCopy, SocialContent } from "../types/offerTemplate";

// Initialize the API client
// Ensure process.env.API_KEY is available in your environment
const apiKey = process.env.API_KEY;
let ai: GoogleGenAI;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("API_KEY is missing. Gemini features will not work.");
}

/**
 * Edits an image based on a text prompt using Gemini 2.5 Flash Image.
 * 
 * @param imageBase64 The base64 string of the source image (without the data:image/... prefix).
 * @param mimeType The mime type of the source image (e.g., 'image/png').
 * @param prompt The text instruction for editing.
 * @returns The base64 data URL of the edited image.
 */
export const editImageWithGemini = async (
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  if (!ai) {
    throw new Error("API Key is missing. Cannot call Gemini API.");
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API.");
    }

    const candidate = response.candidates[0];

    // Check for non-standard finish reasons
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
      let message = `Gemini request stopped. Reason: ${candidate.finishReason}`;
      if (candidate.safetyRatings) {
        const blockedRatings = candidate.safetyRatings.filter(
          r => r.probability === 'HIGH' || r.probability === 'MEDIUM'
        );
        if (blockedRatings.length > 0) {
          const reasons = blockedRatings.map(r => `${r.category} (${r.probability})`).join(', ');
          message += `. Safety Flags: ${reasons}`;
        }
      }
      throw new Error(message);
    }

    const content = candidate.content;
    if (!content || !content.parts || content.parts.length === 0) {
      throw new Error("Gemini returned a response, but it contained no content parts.");
    }

    // Iterate through parts to find the image
    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const returnedMime = part.inlineData.mimeType || 'image/png';
        return `data:${returnedMime};base64,${part.inlineData.data}`;
      }
    }

    // Fallback if no image found
    const textPart = content.parts.find(p => p.text);
    if (textPart && textPart.text) {
      throw new Error(`Gemini responded with text instead of an image: "${textPart.text}"`);
    }

    throw new Error("No valid image data found in the response.");

  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred while editing the image.");
  }
};

/**
 * Detects and extracts text from an image using Gemini 2.5 Flash.
 */
export const detectTextInImage = async (
  imageBase64: string,
  mimeType: string
): Promise<TextOverlay> => {
  if (!ai) {
    throw new Error("API Key is missing.");
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: "Extract the main text content visibly present in this image. Return a JSON object with 'text' containing the string, and 'box_2d' containing the bounding box [ymin, xmin, ymax, xmax] of the main text area normalized to 1000. If multiple text blocks exist, group the most prominent one. If no text is found, return empty string.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
            },
            box_2d: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: "Bounding box [ymin, xmin, ymax, xmax] using 0-1000 scale",
            },
          },
          required: ["text"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) return { text: "" };

    const result = JSON.parse(jsonText);
    return {
      text: result.text || "",
      boundingBox: result.box_2d,
    };

  } catch (error) {
    console.error("Gemini Text Detection Error:", error);
    return { text: "" };
  }
};

/**
 * Generates ad copy for a product using Gemini 2.5 Flash.
 */
export const generateAdCopy = async (
  product: ProductInfo,
  templateStyle: string
): Promise<AdCopy> => {
   const templateMock = { name: templateStyle } as OfferTemplate;
   const result = await generateOfferCopy(product, templateMock, "SQUARE_1080");
   return result;
};

export async function generateOfferCopy(
  product: ProductInfo,
  template: OfferTemplate,
  size: CreativeSize,
  tone: 'standard' | 'urgent' | 'luxury' | 'minimalist' = 'standard'
): Promise<GeneratedOfferCopy> {
  if (!ai) {
    throw new Error("API Key is missing.");
  }

  let toneInstruction = "Generate short, punchy ad copy.";
  if (tone === 'urgent') toneInstruction = "Generate urgent, scarcity-driven copy (e.g. 'Last Chance', 'Hurry').";
  if (tone === 'luxury') toneInstruction = "Generate elegant, sophisticated, and exclusive copy.";
  if (tone === 'minimalist') toneInstruction = "Generate very brief, clean, and direct copy (1-3 words max for headline).";

  const prompt = `You are an expert ad copywriter. ${toneInstruction}

Product: ${product.name}
Price: ${product.priceAfter} ${product.currency} (Was ${product.priceBefore})
Layout: ${template.name}

Constraints:
- Headline: max 8 words.
- Subheadline: optional, max 12 words.
- CTA: max 3 words.
- Return ONLY valid JSON with keys: headline, subheadline, cta.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            subheadline: { type: Type.STRING },
            cta: { type: Type.STRING }
          },
          required: ["headline", "cta"]
        }
      }
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("No text returned");
    return JSON.parse(jsonText) as GeneratedOfferCopy;
  } catch (error) {
    console.error("Gemini Copy Error:", error);
    return { headline: "SPECIAL OFFER", subheadline: "Limited Time", cta: "SHOP NOW" };
  }
}

/**
 * Generates social media caption and hashtags.
 */
export async function generateSocialContent(
  product: ProductInfo,
  offerCopy: GeneratedOfferCopy
): Promise<SocialContent> {
  if (!ai) {
    throw new Error("API Key is missing.");
  }

  const prompt = `Generate a social media caption and hashtags for this product offer.

Product: ${product.name}
Headline: ${offerCopy.headline}
CTA: ${offerCopy.cta}
Price: ${product.priceAfter} ${product.currency}

Output a JSON object with:
- caption: A catchy, engaging social media caption (max 2-3 sentences) including emojis.
- hashtags: An array of 5-10 relevant hashtags.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: { type: Type.STRING },
            hashtags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["caption", "hashtags"]
        }
      }
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("No text returned from Gemini");

    return JSON.parse(jsonText) as SocialContent;

  } catch (error) {
    console.error("Gemini Social Content Error:", error);
    return {
      caption: `Check out the ${product.name}! Limited time offer. Grab yours now! ✨`,
      hashtags: ["#sale", "#offer", "#deal", "#shopping"]
    };
  }
}

/**
 * Generates multiple variants of offer copy for A/B testing.
 */
export async function generateOfferVariants(
  product: ProductInfo,
  template: OfferTemplate
): Promise<{ tone: string, copy: GeneratedOfferCopy }[]> {
  if (!ai) return [];
  
  const tones = ['urgent', 'luxury', 'minimalist'] as const;
  const variants = [];

  // Parallel generation for speed
  const promises = tones.map(async (tone) => {
    try {
      const copy = await generateOfferCopy(product, template, "SQUARE_1080", tone);
      return { tone, copy };
    } catch (e) {
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter(r => r !== null) as { tone: string, copy: GeneratedOfferCopy }[];
}