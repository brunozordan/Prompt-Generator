import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Gemini GenAI client lazy-style
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// SECURE Server-side API endpoint for prompt generation with automatic model fallback
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, temperature, modelName, apiKey } = req.body;

    if (!prompt) {
      return res.status(400).json({ status: 'error', message: 'Prompt is required.' });
    }

    const selectedModel = modelName || 'gemini-3.5-flash';
    
    let client;
    if (apiKey && apiKey.trim() !== '') {
      client = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } else {
      client = getGeminiClient();
    }

    // Dynamic model fallback chain to handle 503 / demand spikes on particular models
    const modelsToTry = [
      selectedModel,
      ...(selectedModel === 'gemini-3.5-flash' ? ['gemini-flash-latest', 'gemini-3.1-flash-lite'] : [])
    ];

    let lastError: any = null;
    let responseText = '';
    let finalModelUsed = '';

    for (const currentModel of modelsToTry) {
      try {
        console.log(`[API Generate] Invoking Gemini with model: ${currentModel}`);
        const response = await client.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction || undefined,
            temperature: typeof temperature === 'number' ? temperature : undefined,
          },
        });

        responseText = response.text || '';
        finalModelUsed = currentModel;
        lastError = null;
        break; // Success! Break the retry loop
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err.message || err);
        console.error(`[API Generate] Error using model ${currentModel}:`, errMsg);

        // Check if the error is due to overload, high demand, rate limiting or temporary unavailability
        const isTemporaryOrOverloaded = 
          errMsg.includes('503') ||
          errMsg.toLowerCase().includes('demand') ||
          errMsg.toLowerCase().includes('overloaded') ||
          errMsg.toLowerCase().includes('unavailable') ||
          errMsg.toLowerCase().includes('resource_exhausted') ||
          errMsg.toLowerCase().includes('quota');

        if (!isTemporaryOrOverloaded) {
          // If it's a structural or auth error (e.g., bad API key, invalid prompt structure), fail early
          break;
        }

        console.warn(`[API Generate] ${currentModel} is busy or high-demand. Trying fallback model if available...`);
      }
    }

    if (lastError) {
      throw lastError;
    }

    res.json({
      status: 'success',
      text: responseText,
      model: finalModelUsed,
    });
  } catch (error: any) {
    console.error('Gemini API Error after fallback chains:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred during content generation.',
    });
  }
});

// SECURE Server-side API endpoint for Image Reverse Engineering (Multimodal Deconstruction)
app.post('/api/deconstruct', async (req, res) => {
  try {
    const { imageBase64, apiKey } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ status: 'error', message: 'imageBase64 is required.' });
    }

    // Extract raw base64 data and MIME type from data-URI if present
    let rawBase64 = imageBase64;
    let mimeType = 'image/jpeg';
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      rawBase64 = parts[1];
      const mimeMatches = parts[0].match(/data:(.*?)$/);
      if (mimeMatches && mimeMatches[1]) {
        mimeType = mimeMatches[1];
      }
    }

    let client;
    if (apiKey && apiKey.trim() !== '') {
      client = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } else {
      client = getGeminiClient();
    }

    const deconstructSystemInstruction = `You are an expert Computer Vision agent, Creative Lens Archivist, and senior AI Prompt Reverse-Engineer. Your job is to analyze the provided image, identify its primary subject matter, determine its artistic/recording medium, and decode its exact technical properties.

You must output a highly detailed, professional analysis of the image matching BOTH a mapped set of UI tokens, AND a beautiful rich teardown of creative factors.

Return your analysis STRICTLY as a single, valid JSON object matching the exact schema below. Do not put any formatting, markdown wrappers, prefaces, or postfaces.

JSON SCHEMA EXPECTED:
{
  "ui_mapping": {
    "subject": "A vivid 1-2 sentence descriptive prose of the foreground focus, subjects, physical actions, and environment settings. Be highly concrete.",
    "technique": "Photography" | "Illustration" | "3D" | "Mixed media",
    "detected_tokens": {
      "Camera angle": "Must be exactly one of: \"Eye level\", \"Low angle\", \"High angle\", \"Worm\'s eye\", \"Bird\'s eye / overhead\", \"Dutch angle\", \"Over-the-shoulder\", \"POV\", \"Three-quarter\", \"Profile\"",
      "Shot size": "Must be exactly one of: \"Extreme close-up\", \"Close-up\", \"Medium close-up\", \"Medium shot\", \"Cowboy shot\", \"Full body\", \"Wide shot\", \"Extreme wide\", \"Macro\"",
      "Lighting": "Must be exactly one of: \"Rembrandt\", \"Butterfly\", \"Loop\", \"Split\", \"Broad\", \"Short\", \"Flat / high-key\", \"Soft / diffused\", \"Hard light\", \"Studio softbox\", \"Rim / edge\", \"Backlight\", \"Key light\", \"Fill light\", \"Ring light\", \"Natural window\", \"Top light\", \"Cross lighting\", \"Bounced\", \"Beauty dish\", \"Fresnel / spot\", \"Snoot\", \"Gobo / patterned\", \"Umbrella\", \"Color gels\", \"Duo-tone\", \"Light painting\", \"Golden hour\", \"Blue hour\", \"Overcast\", \"Harsh midday\", \"Neon / night\", \"Volumetric / god rays\", \"Chiaroscuro\", \"High-key\", \"Low-key\", \"Candlelight\", \"Firelight\", \"Lens flares\", \"String / fairy lights\", \"Bioluminescence\", \"Fluorescent\", \"Tungsten / warm\", \"Concert / stage\", \"Soft glow\"",
      "Shadow": ["Select 1-2 matching shadow descriptors from: \"Soft shadows\", \"Hard-edged shadows\", \"Dappled shadows\", \"Gobo shadows\", \"Cinematic split shadows\", \"Chiaroscuro\", \"Long casting shadows\", \"Penumbra shadows\", \"Ambient occlusion\", \"Contour shadows\", \"Opaque dense shadows\", \"Filtered shadows\", \"Dramatic high-contrast\", \"Silhouette shadows\", \"Backlit\", \"Colorful shadows\", \"Gradient shadows\", \"Abstract patterns\", \"Geometric shadows\", \"Hatched shadows\", \"Shadow play\", \"Layered shadows\", \"Projected shadows\", \"Negative space shadows\", \"Reflective shadows\", \"Mirrored shadows\", \"Double exposure\", \"Infrared shadows\", \"Motion blur shadows\", \"Radiant shadows\", \"Intersecting shadows\", \"Dispersed shadows\", \"Textured shadows\", \"Volumetric shadows\", \"Directional shadows\", \"Negative light shadows\""],
      "Color grade": "Must be exactly one of: \"Teal & orange\", \"Bleach bypass\", \"Cross-process\", \"Muted / earthy\", \"Technicolor\", \"Warm nostalgic\", \"Cool / cold\", \"Green dystopian\", \"Monochrome\", \"Pastel / soft\", \"High saturation\", \"B&W high-contrast\", \"Sepia\"",
      "Contrast & tone": "Must be exactly one of: \"High contrast\", \"Balanced\", \"Low contrast / soft\", \"Faded / matte (lifted blacks)\", \"Flat / lifted shadows\", \"Crushed blacks\", \"Hazy / misty\"",
      "Focus & blur": "Must be exactly one of: \"Sharp throughout\", \"Shallow depth of field\", \"Soft focus\", \"Gaussian blur\", \"Bokeh background\", \"Tilt-shift (miniature)\", \"Lens blur\", \"Defocused background\", \"Motion blur\", \"Camera shake\", \"Long exposure\", \"Light trails / streaking\", \"Slow shutter\", \"Radial / zoom blur\", \"Double exposure\""
    }
  },
  "detailed_teardown": {
    "metadata": {
      "dimensions_px": { "width": 1000, "height": 1250 },
      "aspect_ratio": "e.g. 4:5, 1:1, 16:9",
      "style": "Highly specific style keywords (e.g. \"stylized digital art, vaporwave illustration, flat vector vector, photorealistic cinematic film\")",
      "mood": "e.g. \"contemplative, creative, tense, retro-futural, melancholic\""
    },
    "color_palette": {
      "dominant_colors_hex": ["#D9A2B1", "#A3C6D6", ...],
      "accent_colors_hex": ["#FF4848", ...],
      "gradients": "Description of any color shifts/transitions in background"
    },
    "lighting": {
      "type": "Highly specific description of lighting type",
      "shadows": "Precise description of shadow behaviors",
      "contrast": "Detailed contrast notes",
      "ambient_light": "Color reflections from signs/mood light"
    },
    "composition": {
      "technique_used": "e.g. extreme low-angle perspective, leading lines, rule of thirds, forced perspective",
      "depth_layers": "e.g. foreground elements, midground subject, background sky",
      "focal_point": "Detailed description of focal focus"
    },
    "camera_details": {
      "focal_length_mm": "Estimated focal length or rendering viewport lens",
      "aperture_effect": "Aperture style/depth of field behavior",
      "angle": "Precise viewport angle",
      "distance_to_subject": "e.g. close-up, wide-angle torso shift"
    },
    "subjects": [
      {
        "type": "person/object/animal",
        "description": "Exceedingly precise description of the subject including physical actions, attributes, clothes details, pose, age, facial features (beard, glasses, hair color, expression)",
        "position_in_frame": "Spatial bounds"
      }
    ],
    "background_details": {
      "environment_type": "Surrounding setting details",
      "text_elements_present": "Specific text visible (e.g. 'THINK CREATE' written on signs)",
      "distraction_level": "e.g. minimal, complex layered skyscrapers"
    },
    "post_processing_effects": {
      "applied": ["digital canvas texture overlay", "glow bloom effect", "color grading", "film grain"],
      "overall_color_grade": "e.g. synthwave/vaporwave grading dominated by pastel pinks, purples, and blues"
    },
    "micro_details": [
      "Detail 1",
      "Detail 2",
      "Detail 3"
    ],
    "suggested_ai_prompts": {
      "midjourney_prompt": "Beautiful premium prompt for Midjourney v6",
      "dalle_prompt": "Highly detailed descriptive prompt for DALL-E 3",
      "stable_diffusion_prompt": "High-fidelity tag/prose prompt for SDXL/Stable Diffusion 3"
    }
  }
}

CRITICAL TECHNIQUE RULES:
1. Examine the image content carefully to decide technique.
   - If the image looks drawn, inked, vaporwave, pastel graphic, manga, watercolor, illustration paint, sketch, or digital cartoon painting, set technique strictly to "Illustration" or "Mixed media". Highly stylized pastel drawings with custom gradients are DEFINITELY "Illustration", NOT Photography! 
   - If the image contains photorealistic details, realistic lens bokeh highlights, natural motion blur, authentic steam/water condensation/rain drops, real human face details or organic textures, set technique strictly to "Photography".
   - If the image is a synthetic 3D viewport, matte clay render, smooth CAD scene modeling, or procedural non-subsurface material, set technique strictly to "3D".
2. You must make sure that "detected_tokens" maps to exact items available in the UI schema specified in JSON SCHEMA EXPECTED. For instance, do not output imaginary tokens.`;

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro'];
    let lastError: any = null;
    let responseText = '';
    let finalModelUsed = '';

    for (const model of modelsToTry) {
      try {
        console.log(`[API Deconstruct] Invoking Gemini with image, model: ${model}`);
        const response = await client.models.generateContent({
          model: model,
          contents: {
            parts: [
              {
                inlineData: {
                  data: rawBase64,
                  mimeType: mimeType
                }
              },
              {
                text: "Analyze and deconstruct this reference image with maximum visual accuracy. Return the output STRICTLY matching the expected schema with 'ui_mapping' and 'detailed_teardown' fields, with no prefaces or markdown blocks."
              }
            ]
          },
          config: {
            systemInstruction: deconstructSystemInstruction,
            temperature: 0.1, // low temperature for precise visual accuracy
            responseMimeType: "application/json"
          },
        });

        responseText = response.text || '';
        finalModelUsed = model;
        lastError = null;
        break; // Success! Break loop
      } catch (err: any) {
        lastError = err;
        console.error(`[API Deconstruct] Error using model ${model}:`, err.message || err);
      }
    }

    if (lastError) {
      throw lastError;
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      // Striking fallback if markdown ticks remain
      const stripped = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(stripped);
    }

    res.json({
      status: 'success',
      data: parsedResult,
      model: finalModelUsed
    });
  } catch (error: any) {
    console.error('Gemini Deconstruct API Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred during image deconstruction.',
    });
  }
});

// Configure development or production asset pipeline
async function initializeServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode
    const vite = await import('vite');
    const viteServer = await vite.createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use(viteServer.middlewares);
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`[Development Server] Full-stack platform online at http://0.0.0.0:${port}`);
    });
  } else {
    // Production Mode
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });

    app.listen(port, '0.0.0.0', () => {
      console.log(`[Production Server] Full-stack running on port ${port}`);
    });
  }
}

initializeServer().catch((err) => {
  console.error('Failed to initialize server:', err);
});
