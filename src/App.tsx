import React, { useState, useMemo, useCallback, useEffect } from "react";
import { 
  Sparkles, 
  Camera, 
  Palette, 
  Box, 
  Layers, 
  Info, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Eye,
  Sliders,
  Terminal,
  Clock,
  Save,
  SlidersHorizontal,
  FolderOpen,
  Bookmark,
  Heart,
  Undo2,
  ListFilter,
  FileCode,
  Compass,
  ArrowRight,
  Sparkle,
  Film,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ==========================================
// DATA DICTIONARIES (100% Retained & Enhanced)
// ==========================================

interface TaxField {
  key: string;
  multi: boolean;
  pop: string[];
  items: Record<string, string[]>;
}

interface TaxType {
  specific: TaxField[];
}

const GENRE_DEFAULTS: Record<string, Record<string, string>> = {
  "Film noir": { lighting: "Low-key", color: "B&W high-contrast", mood: "Tense, urban night", shadow: "Cinematic split shadows" },
  "Cyberpunk": { lighting: "Neon / night", color: "Teal & orange", mood: "Dystopian, electric" },
  "Steampunk": { color: "Warm nostalgic", mood: "Victorian, mechanical" },
  "Synthwave": { lighting: "Neon / night", color: "Neon / vivid", mood: "Retro 80s" },
  "Vaporwave": { color: "Pastel / soft", mood: "Surreal, nostalgic" },
  "Cottagecore": { lighting: "Golden hour", color: "Warm nostalgic", mood: "Idyllic, cozy" },
  "Dark academia": { lighting: "Candlelight", color: "Muted / earthy", mood: "Scholarly, moody" },
  "Solarpunk": { lighting: "Golden hour", color: "High saturation", mood: "Optimistic, lush" },
  "High fantasy": { lighting: "Volumetric / god rays", mood: "Epic, magical" },
  "Dark fantasy": { lighting: "Low-key", color: "Muted / earthy", mood: "Grim, ominous" },
  "Gothic horror": { lighting: "Candlelight", color: "Cool / cold", mood: "Foreboding, ornate", shadow: "Chiaroscuro" },
  "Post-apocalyptic": { color: "Muted / earthy", mood: "Desolate, dusty" },
  "1950s": { color: "Warm nostalgic", mood: "Optimistic post-war" },
  "1970s": { color: "Warm nostalgic", mood: "Earthy, warm analog" },
  "1980s": { color: "Neon / vivid", mood: "Bold, high-energy" },
  "1990s": { color: "Desaturated", mood: "Grunge, understated" },
};

const TAX: Record<string, TaxType> = {
  Photography: {
    specific: [
      { key: "Lens", multi: false, pop: ["35mm","50mm","85mm","135mm"], items: {
        "Lens": ["14mm ultra-wide","18mm ultra-wide","24mm wide","28mm","35mm","50mm","85mm","100mm macro","135mm","200mm telephoto"] } },
      { key: "Aperture", multi: false, pop: ["f/1.8","f/2.8"], items: {
        "Aperture": ["f/1.2","f/1.4","f/1.8","f/2.8","f/8"] } },
      { key: "Film stock", multi: false, pop: ["Kodak Portra 400","CineStill 800T","Kodak Tri-X 400","Digital clean"], items: {
        "Color negative": ["Kodak Portra 400","Kodak Portra 160","Kodak Portra 800","Kodak Gold 200","Kodak Gold 100","Kodak Ektar 100","Kodak UltraMax 400","Agfa Vista 400","Lomography Color 800"],
        "Slide / cinematic": ["CineStill 800T","CineStill 400D","Kodak Vision3 500T","Kodak Ektachrome","Fujifilm Provia 100F","Fujifilm Velvia 50","Cross-process slide"],
        "Black & white": ["Kodak Tri-X 400","Ilford HP5 Plus","Ilford Delta 3200","Ilford Delta 100","Kodak T-Max 400","Ilford FP4 125","Ilford SFX 200 (infrared)","Ilford XP2 Super"],
        "Instant / lo-fi": ["Polaroid","Fujifilm Instax","Lomography Redscale","VHS","Super 8","8mm","Expired film","Light leaks","Washed colors","Digital clean"] } },
      { key: "Camera format", multi: false, pop: ["Hasselblad 500C","Arri Alexa LF","Leica M6"], items: {
        "Format & Medium": ["Leica M6 (35mm street realism)","Hasselblad 500C (square 6x6 medium format)","Arri Alexa LF (ultra-grade digital cinema)","Large format 8x10 view camera","Polaroid SX-70 (vintage physical pack)","Vintage 16mm Bolex (tactile indie scan)"] } },
      { key: "Unpolished realism", multi: true, pop: ["Natural skin texture","iPhone photo","Candid by friend"], items: {
        "Skin / face": ["Freckles","Laugh lines","Wrinkles","Natural skin texture","Stray hairs","Minor blemishes","Rosy cheeks","Asymmetrical face","Non-idealized beauty"],
        "Device": ["iPhone photo","Selfie","Point-and-shoot","Cheap 2000s digicam","Direct harsh flash","Candid by friend","Straight from phone"],
        "Aesthetic": ["Awkwardly cropped","Looking away","Cluttered background","Everyday moment","Blown highlights"] } },
    ],
  },
  Illustration: {
    specific: [
      { key: "Medium", multi: false, pop: ["Flat vector","Watercolor","Gouache","Digital painting"], items: {
        "Traditional": ["Watercolor","Gouache","Oil painting","Acrylic","Colored pencil","Pencil sketch","Charcoal","Pen and ink","Ink + wash","Pastel","Sumi-e brush"],
        "Digital": ["Flat vector","Flat 2D cartoon","Digital painting","Cel-shaded","Line art (minimal)","Line art (detailed)","Lineless","Isometric","Pixel art","Doodle"],
        "Print / craft": ["Risograph","Screen print","Linocut","Cut-paper collage","Halftone","Stained glass","Stencil"] } },
      { key: "Style", multi: true, pop: ["Anime key visual","Children's book","American comic","Arcane / painterly hybrid"], items: {
        "Anime — demographic": ["Anime key visual","Shonen (action, bold)","Shojo (soft, romantic)","Seinen (mature, realistic)","Josei (grounded, muted)","Mecha anime","Slice-of-life anime","Kawaii chibi"],
        "Anime — studio signature": ["Studio Ghibli-style","Makoto Shinkai-style (photoreal bg, lens flare)","Ufotable-style (2D+CGI, particle bloom)","Studio Trigger-style (jagged, neon, impact frames)","MAPPA-style (gritty, fluid)","90s retro anime (grain, VHS)","80s anime (realistic, dark)"],
        "Painterly / hybrid 3D-2D": ["Arcane / painterly hybrid","Painterly 2.5D (3D + hand-painted)","Impasto brushwork","Moving-oil-painting look","Concept-art painterly"],
        "Comic / cartoon": ["American comic","Retro comic / pop","Graphic novel","Manga (B&W screentone)","Rubber-hose cartoon","Saturday-morning cartoon","Flat cutout","Caricature"],
        "Other": ["Children's book","Pixar-style 3D toon","Tim Burton-esque","Plush / crochet","Storybook watercolor"] } },
      { key: "Art movement", multi: false, pop: ["Art Nouveau","Art Deco","Pop Art","Ukiyo-e"], items: {
        "Movement": ["Art Nouveau","Art Deco","Bauhaus","Ukiyo-e","Pop Art","Impressionist","Post-Impressionist","Cubist","Surrealist","Fauvism","Swiss design","Constructivism","Memphis","Psychedelic 60s"] } },
      { key: "Line work", multi: false, pop: ["Clean / crisp","Thick outline","Lineless"], items: {
        "Line work": ["Clean / crisp","Thick outline","Thin / delicate","Variable weight","Lineless","Sketchy / rough","Gestural","Crosshatching","Stippling"] } },
      { key: "Color treatment", multi: false, pop: ["Flat color","Cel shading","Pastel","Limited palette"], items: {
        "Color": ["Flat color","Cel shading","Soft gradients","Limited palette","Monochrome","Pastel","Bold primaries","Muted / earthy","Duotone","Neon / vivid","Warm","Cool"] } },
      { key: "Pigment & Ink", multi: false, pop: ["India Ink","French Gouache","Soft Pastel"], items: {
        "Pigment / Ink": ["India Ink","French Gouache","Soft Pastel","Japanese Sumi ink","Heavy body acrylic","Golden open oil pigments","Liquid watercolor"] } },
      { key: "Texture", multi: false, pop: ["Paper grain","Smooth / clean","Halftone grain"], items: {
        "Texture": ["Paper grain","Canvas texture","Halftone grain","Grain / noise","Smooth / clean","Riso grain","Visible brushstrokes","Distressed / grunge"] } },
    ],
  },
  "3D": {
    specific: [
      { key: "Render style", multi: false, pop: ["Stylized 3D","Clay render","Photorealistic","Low-poly"], items: {
        "Render style": ["Photorealistic","Stylized 3D","Clay render","Cel-shaded 3D","Pixar-style toon","NPR painterly","Low-poly","Voxel","Abstract 3D"] } },
      { key: "Geometry", multi: false, pop: ["High-poly / smooth","Low-poly","Rounded / soft"], items: {
        "Geometry": ["High-poly / smooth","Low-poly","Hard-surface","Organic / sculpted","Rounded / soft","Inflatable / balloon","Blocky / cube"] } },
      { key: "Materials", multi: true, pop: ["Glossy plastic","Matte / clay","Subsurface scattering"], items: {
        "Materials": ["PBR realistic","Subsurface scattering","Glossy plastic","Matte / clay","Brushed metal","Polished chrome","Frosted glass","Clear glass","Iridescent","Ceramic","Marble / stone","Rubber / silicone","Fabric / felt","Wood","Wax","Liquid / fluid"] } },
      { key: "Light Simulation", multi: false, pop: ["Global Illumination","Ray-traced caustics","Subsurface scattering"], items: {
        "Atmospherics & Bounce": ["Global Illumination (ambient bounce)","Ray-traced caustics (glass refraction)","Subsurface light scattering","Volumetric fog projection","HDRI environmental dome"] } },
      { key: "Render engine", multi: false, pop: ["Octane","Blender Cycles","Unreal Engine 5"], items: {
        "Engine look": ["Octane","Redshift","V-Ray","Unreal Engine 5","Cinema 4D","Blender Cycles","Corona","Arnold"] } },
      { key: "Presentation", multi: false, pop: ["Isometric","Floating object","Blind-box figure"], items: {
        "Presentation": ["Isometric","Standard perspective","Diorama","Floating object","Exploded view","Product turntable","Blind-box figure"] } },
    ],
  },
  "Mixed media": {
    specific: [
      { key: "Combination", multi: false, pop: ["Photo + illustration","Photo + paint","Paint + collage"], items: {
        "Combination": ["Photo + paint","Photo + illustration","Photo + collage","Illustration + texture","Paint + collage","Scan + digital","3D + 2D","Photo transfer","Analog + digital collage","Found-object assemblage"] } },
      { key: "Layering", multi: false, pop: ["Torn-edge layering","Transparent washes","Double exposure"], items: {
        "Layering": ["Foreground/mid/background","Transparent washes","Clipping-mask blend","Torn-edge layering","Opacity variation","Heavy impasto + flat","Double exposure"] } },
      { key: "Texture", multi: true, pop: ["Torn paper","Newsprint","Paint drips"], items: {
        "Texture": ["Torn paper","Newsprint / magazine","Fabric / textile","Tape / masking","Stitching / thread","Paint drips","Stencil / spray","Ink stains","Handwriting","Washi paper","Grunge / distressed","Tactile relief"] } },
      { key: "Physical Artifacts", multi: false, pop: ["Cyanotype print edges","Emulsion lift-off","Decollage paper rips"], items: {
        "Artifacts": ["Cyanotype print edges","Emulsion lift-off","Acetone photo transfer","Decollage paper rips","Double-exposure emulsion slip"] } },
      { key: "Tradition", multi: false, pop: ["Editorial collage","Punk / zine","Surrealist collage"], items: {
        "Tradition": ["Dada / Schwitters","Surrealist collage","Pop-art collage","Punk / zine","Vintage scrapbook","Contemporary digital","Editorial collage","Vintage scientific","Glitch / databending"] } },
    ],
  },
};

const UNIVERSAL: TaxField[] = [
  { key: "Camera angle", multi: false, pop: ["Eye level","Low angle","High angle","Three-quarter"], items: {
    "Angle": ["Eye level","Low angle","High angle","Worm's eye","Bird's eye / overhead","Dutch angle","Over-the-shoulder","POV","Three-quarter","Profile"] } },
  { key: "Shot size", multi: false, pop: ["Close-up","Medium shot","Full body","Wide shot"], items: {
    "Shot": ["Extreme close-up","Close-up","Medium close-up","Medium shot","Cowboy shot","Full body","Wide shot","Extreme wide","Macro"] } },
  { key: "Lighting", multi: false, pop: ["Soft / diffused","Rembrandt","Golden hour","Low-key"], items: {
    "Portrait pattern": ["Rembrandt","Butterfly","Loop","Split","Broad","Short","Flat / high-key"],
    "Quality / direction": ["Soft / diffused","Hard light","Studio softbox","Rim / edge","Backlight","Key light","Fill light","Ring light","Natural window","Top light","Cross lighting","Bounced"],
    "Studio modifiers": ["Beauty dish","Fresnel / spot","Snoot","Gobo / patterned","Umbrella","Color gels","Duo-tone","Light painting"],
    "Time / environment": ["Golden hour","Blue hour","Overcast","Harsh midday","Neon / night","Volumetric / god rays","Chiaroscuro","High-key","Low-key"],
    "Practical sources": ["Candlelight","Firelight","Lens flares","String / fairy lights","Bioluminescence","Fluorescent","Tungsten / warm","Concert / stage","Soft glow"] } },
  { key: "Shadow", multi: true, pop: ["Soft shadows","Hard-edged shadows","Dramatic high-contrast"], items: {
    "Quality": ["Soft shadows","Hard-edged shadows","Dappled shadows","Gobo shadows","Cinematic split shadows","Chiaroscuro","Long casting shadows","Penumbra shadows","Ambient occlusion","Contour shadows","Opaque dense shadows","Filtered shadows","Dramatic high-contrast"],
    "Expressive": ["Silhouette shadows","Backlit","Colorful shadows","Gradient shadows","Abstract patterns","Geometric shadows","Hatched shadows","Shadow play","Layered shadows","Projected shadows","Negative space shadows","Reflective shadows","Mirrored shadows","Double exposure","Infrared shadows","Motion blur shadows","Radiant shadows","Intersecting shadows","Dispersed shadows","Textured shadows","Volumetric shadows","Directional shadows","Negative light shadows"] } },
  { key: "Color grade", multi: false, pop: ["Teal & orange","Warm nostalgic","Muted / earthy","B&W high-contrast"], items: {
    "Grade": ["Teal & orange","Bleach bypass","Cross-process","Muted / earthy","Technicolor","Warm nostalgic","Cool / cold","Green dystopian","Monochrome","Pastel / soft","High saturation","B&W high-contrast","Sepia"] } },
  { key: "Contrast & tone", multi: false, pop: ["High contrast","Low contrast / soft","Faded / matte"], items: {
    "Contrast": ["High contrast","Balanced","Low contrast / soft","Faded / matte (lifted blacks)","Flat / lifted shadows","Crushed blacks","Hazy / misty"] } },
  { key: "Focus & blur", multi: false, pop: ["Shallow depth of field","Sharp throughout","Long exposure"], items: {
    "Focus / lens": ["Sharp throughout","Shallow depth of field","Soft focus","Gaussian blur","Bokeh background","Tilt-shift (miniature)","Lens blur","Defocused background"],
    "Motion / exposure": ["Motion blur","Camera shake","Long exposure","Light trails / streaking","Slow shutter","Radial / zoom blur","Double exposure"] } },
  { key: "Composition", multi: false, pop: ["Rule of thirds","Centered","Negative space"], items: {
    "Composition": ["Rule of thirds","Centered / symmetrical","Leading lines","Negative space","Layered / collage","Frame within frame","Fill the frame","Golden ratio"] } },
  { key: "Mood", multi: true, pop: ["Cinematic","Editorial","Moody","Minimalist"], items: {
    "Mood": ["Cinematic","Editorial","Moody","Dramatic","Elegant","Gritty","Ethereal","Serene","Melancholic","Nostalgic","Surreal","Luxurious","Playful","Tense"] } },
];

const GENRES: Record<string, string[]> = {
  "Popular": ["Film noir","Cyberpunk","Cottagecore","Dark academia","Synthwave","Vaporwave","High fantasy","Steampunk"],
  "The -punks": ["Cyberpunk","Steampunk","Dieselpunk","Solarpunk","Atompunk","Biopunk","Clockpunk","Nanopunk","Decopunk","Cassette futurism"],
  "Fantasy & speculative": ["High fantasy","Dark fantasy","Gothic fantasy","Fairycore","Cosmic horror","Mythic / folklore","Sword & sorcery","Post-apocalyptic"],
  "Sci-fi": ["Hard sci-fi","Space opera","Retro sci-fi","Used future","Utopian future","Cosmic / space"],
  "Cinematic / noir / period": ["Film noir","Neo-noir","Gothic horror","Western","Spaghetti western","Baroque","Victorian Gothic","Art deco world"],
  "Internet / -cores": ["Vaporwave","Synthwave","Cottagecore","Dark academia","Light academia","Y2K","Weirdcore","Dreamcore","Liminal space","Goblincore","Frutiger Aero","Brutalist","Minimalist"],
  "Era / period": ["1920s","1950s","1960s","1970s","1980s","1990s","2000s"],
};

const TECHNIQUES = ["Photography", "Illustration", "3D", "Mixed media"];

const TIPS: Record<string, string> = {
  // Lenses
  "14mm ultra-wide": "Extreme architectural field of view; exaggerates perspective, flares corners, and captures immense environmental context.",
  "18mm ultra-wide": "Expansive wider view; maintains clean geometry with subtle corner stretching, perfect for sweeping scenery and street context.",
  "24mm wide": "Classic photojournalist wide; captures rich surroundings without extreme distortion, preserving deep foreground-to-background spatial scales.",
  "28mm": "Staple travel focal length; mimics the human eye's natural peripheral scope perfectly, delivering a very relatable, conversational perspective.",
  "35mm": "Street portrait gold standard; wide yet personal, keeps environmental texture, ideal for storytelling, and preserves full situational geometry.",
  "50mm": "The 'Nifty-Fifty' standard lens; matches the central focus of human vision with absolute geometric honesty and zero spatial distortion.",
  "85mm": "Elite portrait prime lens; compresses spatial depth, rendering subject facial features with symmetric accuracy and incredibly buttery background falloff.",
  "100mm macro": "Extreme macro close-up focus; ultra-high spatial resolution of microscopic textures like skin pores, water droplets, or canvas weaves with paper-thin focus fields.",
  "135mm": "Extreme focal compression; isolates subjects spectacularly, transforming busy backdrops into silky painterly washes.",
  "200mm telephoto": "Super-telephoto flat perspective; compresses vast distances, layering distant elements into tight, graphic geometric planes.",

  // Apertures
  "f/1.2": "Ultra-shallow dreamscape; razor-thin focus slice with extreme paint-like background melting and maximum light intake.",
  "f/1.4": "Prestigious portrait standard; phenomenal light gathering, superb bokeh quality, and highly soft background decoupling.",
  "f/1.8": "Creamy bokeh zone; beautiful low-light response with shallow, aesthetic slice of focus.",
  "f/2.8": "Balanced focus baseline; yields sharp subject rendering while keeping backdrop pleasingly blurred.",
  "f/8": "Deep field classic; crisp sharp detail retention from edge-to-edge, ideal for landscapes, group photos, and architectural geometry.",

  // Film Stocks
  "Kodak Portra 400": "High-fidelity professional negative; exceptional exposure latitude, warm pastel skin tones, low contrast, fine grain with gentle golden highlight retention.",
  "Kodak Portra 160": "Ultra-fine grain negative; optimized for soft, extremely smooth skin textures and neutral daylight colors under natural light studio settings.",
  "Kodak Portra 800": "High-speed negative; delivers warm golden undertones, rich color saturation, and powerful performance in low-light environments with moderate grain structure.",
  "Kodak Gold 200": "Consumer classic; high organic warmth with dense amber-yellow highlights, distinct retro grain, and lively saturated primary colors.",
  "Kodak Gold 100": "Slightly finer vintage classic; yields deep color saturation, classic amber hues, and high-contrast nostalgic holiday tones.",
  "Kodak Ektar 100": "Ultra-saturated, extremely fine-grained slide-like negative; rich clinical contrasts and ultra-vivid reds, blues, and foliage greens.",
  "Kodak UltraMax 400": "Highly versatile street color; bold punchy blue and yellow saturations, moderate graphic grain, and robust dynamic exposure latitude.",
  "Agfa Vista 400": "Discontinued cult color negative; trademark vivid red saturation, cold greenish-blue shadow casts, and a distinct organic film tone.",
  "Lomography Color 800": "High sensitivity saturation pump; vivid contrasting primaries, retro high carbon grain, and dramatic warm bias.",
  "CineStill 800T": "Tungsten-balanced cinematic motion-picture film. Prized for electric neon-orange halation halos that bloom around light highlights, cool blue casts, and rich low-light sensitivity.",
  "CineStill 400D": "Daylight-balanced cinema stock; delivers soft pastel warm hues with gentle red halation around medium highlights and clean organic shadows.",
  "Kodak Vision3 500T": "Hollywood's premier night-motion stock; exceptional exposure latitude, cold tungsten balance, and rich cinematic blue-green shadow values.",
  "Kodak Ektachrome": "Luminous color reversal slide film; extremely fine grain, ultra-pure clean whites, deep high-contrast shadows, and rich true-to-life color fidelity.",
  "Fujifilm Provia 100F": "Ultra-sharp professional slide film; neutral gray balances, natural realistic colors, high contrast, and clinically pristine highlight retention.",
  "Fujifilm Velvia 50": "Legendary landscape slide film; hyper-saturated emerald greens, deep magenta sunsets, extremely high contrast, and ultra-resolved fine detail.",
  "Cross-process slide": "Developing slide film in chemical negatives; creates erratic color mutations, high stark contrast, neon green highlights, and deep heavy-saturated shadows.",
  "Kodak Tri-X 400": "Legendary documentary black & white film; robust punchy contrast, rich silver-halide organic grain, and profound emotional dynamic range.",
  "Ilford HP5 Plus": "Classic British black & white film; moderate gray contrast, highly versatile latitude, soft shadow details, and a gritty, raw timeless documentary grain.",
  "Ilford Delta 3200": "Extreme high-speed black & white; giant, beautiful artistic gravel-like grain with high-contrast midtones for atmospheric low-light street work.",
  "Ilford Delta 100": "Modern tabular grain black & white; clinically sharp, ultra-fine microscopic grain, perfect geometric contrast, and smooth tones.",
  "Kodak T-Max 400": "Tabular grain classic black & white; incredible spatial resolution, deep micro-contrasts, highly pristine highlight tones, and near-invisible grain.",
  "Ilford FP4 125": "Medium speed black & white classic; bright whites, deep solid blacks, wide shadow latitude, and crisp silver textures.",
  "Ilford SFX 200 (infrared)": "Near-infrared sensitive stock; foliage glows into ethereal white wood-effects, skys turn dark and cinematic, under custom red filtration.",
  "Ilford XP2 Super": "Chromogenic black & white film developed in color chemistry; extremely silky and smooth highlights with subtle gray transitions.",
  "Polaroid": "Vintage square instant chemistry; immediate physical dye diffusion, square format borders, faded cyan shadows, and soft ambient pastel highlights.",
  "Fujifilm Instax": "Modern dynamic instant stock; punchy saturated colors, sharp high contrasts, reliable whites, and cold shadow tones.",
  "Lomography Redscale": "Reversed physical winding technique exposing through the base; coats the entire scene in intense fire-red, heavy amber, and gold wash tones.",
  "VHS": "Magnetic video tape resolution; classic tracking lines, color aberration, light blurring, low-frequency sound vibes, and 4:3 interlaced analog charm.",
  "Super 8": "Vintage 8mm film format; distinct jittery gate borders, dense grain clusters, soft focal planes, and beautiful historical dynamic nostalgic glow.",
  "8mm": "Precursor to Super 8; highly nostalgic, jittery, raw physical gate damage, extremely low-res tactile texture, and warm color wash.",
  "Expired film": "Degraded chemical slide; colors shift into green/purple, contrast is flat or erratic, with heavy organic fogging and unpredictable results.",
  "Light leaks": "Physical exposure of film chamber; paints organic orange, red, and yellow soft light streaks across the side of the photo frame.",
  "Washed colors": "Sun-bleached negative look; desaturated tonal profiles, low contrast, and chalky pastel hues.",

  // Camera format
  "Leica M6 (35mm street realism)": "The epitome of high-end street photojournalism. Delivers warm, gritty frame composition with highly realistic contrast and soft filmic focus.",
  "Hasselblad 500C (square 6x6 medium format)": "Vintage medium-format square icon (6x6). Famous for deep spatial depth, luxurious organic tonal gradations, and iconic waist-level-finder perspectives.",
  "Arri Alexa LF (ultra-grade digital cinema)": "Hollywood's premier large-format digital cinema sensor. Offers unparalleled dynamic range, natural roll-off highlights, and clean, velvety organic shadows.",
  "Large format 8x10 view camera": "The ultimate peak of optical resolution and spatial fidelity. Delivers sheer texture resolution, supreme details, and massive natural dimensional depth.",
  "Polaroid SX-70 (vintage physical pack)": "Authentic instant physical reaction. Soft, faded cyan-yellow shadow washes, warm gold skin tones, and retro aesthetic dreaminess.",
  "Vintage 16mm Bolex (tactile indie scan)": "Tactile nostalgic gate jitter. Rich physical color saturation, raw cinematic grain, and an authentic indie-film texture.",

  // Lighting & Patterns
  "Rembrandt": "Key lighting placed at a 45° angle, painting a distinctive signature triangle of light on the shadowed cheek.",
  "Butterfly": "Direct front-high studio light; traces high cheekbones with a characteristic butterfly shadow beneath the nose.",
  "Split": "Side lighting that splits the subject bisectedly; cast half in gleaming highlights and half in pure dark shadow.",
  "Loop": "Universal portrait light. Nose shadow forms a tiny loop toward the corner of the lip. Highly flattering.",
  "Rim / edge": "Dramatic back-angled light that creates a crisp ring of highlight outline around the target silhouette.",
  "Chiaroscuro": "High-contrast painterly aesthetic from the Renaissance; heavy shading playing against focused beams of light.",
  "Low-key": "Atmospheric, dark composition utilizing a single primary source of light to sculpt forms dynamically.",
  "High-key": "Optimistic, radiant, and flat; suppresses dark shadows entirely to create airy, low-tonal layouts.",
  "Golden hour": "Warm amber rays cast from a low sunset angle; paints subjects in highly flattering mechanical gradients with long, dramatic shadow casting.",
  "Blue hour": "Cool ambient twilight glows; serene, quiet cobalt-blue sky light playing beautifully with hot electric city light sources.",

  // Color Grade
  "Teal & orange": "Hollywood standard palette; contrasts warm skin tones against cold blue/teal shadow gradients.",
  "Bleach bypass": "Gritty action cinematic grade; bypasses the silver bleaching phase for high saturation contrast and low chroma.",
  "Faded / matte (lifted blacks)": "Bypasses true pitch-blacks, compressing lowest shadows into subtle charcoal greys for a transient film look.",

  // Contrast & Focus / Blur
  "Shallow depth of field": "A micro focus slice that blurs foreground and background elements into beautiful formless shapes.",
  "Long exposure": "Turns time into movement; moving objects, headlights, and waves melt into ethereal, fluid glowing streaks.",
  "Camera shake": "A purposeful handheld shutter blur that injects frantic energy, raw realism, or snapshot candidness.",
  "Tilt-shift (miniature)": "A specialized lens tilt that creates a narrow band of focus, turning real-world horizons into tiny toy models.",
  "Gobo / patterned": "Light projected through decorative blinds, lattices, or foliage to paint complex volumetric shadow maps.",

  // 3D Materials
  "Subsurface scattering": "Light penetrating translucent skin, wax, silicon, or marble, scattering internally for a realistic fleshy warm micro-glow.",
  "Glossy plastic": "Highly light-reflective industrial skin look; sharp specular highlight spots and pristine clean modern reflections.",
  "Matte / clay": "Unfinished tactical mockup; desaturated, chalky surface modeling that emphasizes sheer 3D form geometry and lighting gradients.",
  "Octane": "Elite GPU photorealistic renderer style; delivers crisp caustics, physically accurate lens blooms, and clinical light calculations.",

  // Pigment & Ink
  "India Ink": "High-density black carbon pigment; delivers deep, unapologetic light-absorbing lines with velvety matte textures.",
  "French Gouache": "High-opacity matte paint; rich velvety texture with intense saturated pigments, clean color block layers.",
  "Soft Pastel": "Tactile pulverized pigment; soft chalky textures, buttery blending gradients, and highly expressive light fields.",
  "Japanese Sumi ink": "Tradition inkwash paint; elegant flowing gray-scale gradients and natural, dramatic calligraphic brush contrast.",
  "Heavy body acrylic": "Thick oil-like textured colors; retains physical brush peaks, dramatic paint relief ridges, and high-impact textures.",
  "Golden open oil pigments": "Luxury slow-drying oil paint; complex, rich glazed layers, superb light-reflective depth, and soft transition fields.",
  "Liquid watercolor": "Vibrant transparent dye; beautiful organic water stains, high-diffusion flows, and delicate color pooling gradients.",

  // Light Simulation
  "Global Illumination (ambient bounce)": "Simulates multiple light bounces; ambient light reflected from surfaces naturally colorizes surrounding scene shadows.",
  "Ray-traced caustics (glass refraction)": "Calculates complex glass and water refractions; projects swimming networks of focused glowing light ribbons onto surfaces.",
  "Subsurface light scattering": "Simulates light penetrating translucent skin, wax, silicon, or marble, scattering internally for a realistic fleshy warm micro-glow.",
  "Volumetric fog projection": "Light intersecting suspended particulate matter, casting beautiful tangible shafts, god rays, and beams.",
  "HDRI environmental dome": "Realistic 360-degree image-based illumination; wraps 3D meshes in flawless, complex photorealistic reflections and lighting ratios.",

  // Physical Artifacts
  "Cyanotype print edges": "19th-century monochromatic printing; delivers deep rich Prussian blue wash borders with high-contrast rough paper texture.",
  "Emulsion lift-off": "Physical photographic transfer; wrinkles and tears the translucent imagery boundaries into beautiful distorted fluid patterns.",
  "Acetone photo transfer": "Analog layout transfer; yields distressed high-contrast ink textures, rustic paper fiber bleeds, and weathered patterns.",
  "Decollage paper rips": "Sartorial layered destruction; rough physical tearing that reveals colorful historical paper layers underneath.",
  "Double-exposure emulsion slip": "Overlaying two exposures on one sheet; creates spectral overlapping layers and distinct physical chemistry margins.",

  // Illustration / Traditional Mediums
  "Watercolor": "Fluid translucent wash look; characterized by natural water blooms, soft edge pools, and organic paper grain bleed-through.",
  "Gouache": "Opaque waterborne pigmentation; provides highly velvety matte solids and smooth, flat graphic layers.",
  "Oil painting": "Classic physical realism; features heavy layered textures, visible impasto bristle ridges, and lustrous pigment depths.",
  "Risograph": "Distinct retro duplicating technique utilizing vivid spot inks, tactile textured paper, and slight spot misregistrations.",
  "Ukiyo-e": "Woodblock printing style from Edo-era Japan; characterized by flat color plains, bold line-work contours, and dynamic negative space.",
  "Isometric": "A rigid 30-degree orthographic layout with absolute scale preservation; completely avoids camera perspective distortion.",

  // Gen / Punks / Internet Cores
  "Cyberpunk": "Rain-slick city streets bouncing neon-pink and neon-teal beams under heavy futuristic storm atmospheres.",
  "Film noir": "Vintage 1940s mystery; stark venetian blinds casting shadows, dripping street-lamps, mist, and deep high-contrast shadows.",
  "Cottagecore": "Cozy, wholesome field aesthetics; golden sunbeams, natural organic textiles, handcrafts, and rustic floral palettes.",
  "Dark academia": "Moody intellectualism; dark walnut libraries, vintage leather volumes, cozy tweed, ink stains, and warm candlelight.",
  "Vaporwave": "Dreamlike digital nostalgia; pastel pink grids, glitch artifacts, Greco-Roman sculptural pieces, and soft sunset hues.",
  "Brutalist": "Raw monumentalism; heavy unadorned concrete grids, massive geometrical constructs, and clean monolithic forms."
};

const ELEMENT_TREATMENTS = [
  "Photoreal",
  "Illustration (manga)",
  "Illustration (flat vector)",
  "Illustration (watercolor)",
  "Illustration (comic)",
  "3D render",
  "Clay render",
  "Painterly",
  "Collage / cutout"
];

// ==========================================
// PORTFOLIO OF CHEF COOKBOOKS (Visual Presets)
// ==========================================

interface CookbookPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  technique: string;
  subject: string;
  genre: string | null;
  sel: Record<string, any>;
}

const COOKBOOKS: CookbookPreset[] = [
  {
    id: "analog-portrait",
    name: "Classic Warm Analog",
    description: "Dreamy retro look with pastel skin-tones, flattering Rembrandt studio keylight, and rich organic film grain.",
    emoji: "📸",
    technique: "Photography",
    subject: "A close-up portrait of an aging violin repairer resting their chin on their hands in a wood-carving garage, focused gaze",
    genre: "1970s",
    sel: {
      "Lens": "85mm",
      "Aperture": "f/1.8",
      "Film stock": "Kodak Portra 400",
      "Camera angle": "Eye level",
      "Shot size": "Close-up",
      "Lighting": "Rembrandt",
      "Shadow": "Soft shadows",
      "Color grade": "Warm nostalgic",
      "Contrast & tone": "Low contrast / soft",
      "Focus & blur": "Shallow depth of field",
      "Composition": "Rule of thirds",
      "Mood": "Moody"
    }
  },
  {
    id: "neon-cyberpunk",
    name: "Cyberpunk Rain Noir",
    description: "Stark low-key composition utilizing halogen colors, rain-slick reflections, and heavy cinematic shadow mapping.",
    emoji: "⚡",
    technique: "Photography",
    subject: "An noodle vendor working under a plastic canopy, cooking steam rising, giant neon skyscrapers hovering above in heavy rain",
    genre: "Cyberpunk",
    sel: {
      "Lens": "35mm",
      "Aperture": "f/2.8",
      "Film stock": "CineStill 800T",
      "Camera angle": "Low angle",
      "Shot size": "Medium shot",
      "Lighting": "Neon / night",
      "Shadow": "Cinematic split shadows",
      "Color grade": "Teal & orange",
      "Contrast & tone": "High contrast",
      "Focus & blur": "Shallow depth of field",
      "Composition": "Leading lines",
      "Mood": "Tense, urban night"
    }
  },
  {
    id: "ghibli- meadow",
    name: "Ghibli Meadow Paint",
    description: "Warm, hand-painted solarpunk vibe celebrating lush rolling hills, soft clouds, and nostalgic watercolor texturing.",
    emoji: "🌱",
    technique: "Illustration",
    subject: "A floating wooden treehouse with solar domes, miniature windmills, white laundry drying in a golden breeze",
    genre: "Solarpunk",
    sel: {
      "Medium": "Watercolor",
      "Style": "Studio Ghibli-style",
      "Art movement": "Art Nouveau",
      "Line work": "Clean / crisp",
      "Color treatment": "Soft gradients",
      "Texture": "Paper grain",
      "Camera angle": "High angle",
      "Shot size": "Wide shot",
      "Lighting": "Golden hour",
      "Shadow": "Dappled shadows",
      "Color grade": "High saturation",
      "Contrast & tone": "Balanced",
      "Focus & blur": "Sharp throughout",
      "Composition": "Golden ratio",
      "Mood": "Ethereal"
    }
  },
  {
    id: "isometric-clay",
    name: "Isometric Clay Toy",
    description: "Smooth, tactile voxel style with rounded geometries, toy matte material render, and selective miniature tilt-shift focus.",
    emoji: "🧱",
    technique: "3D",
    subject: "A futuristic solar energy post showing a single tiny cabin, small glass greenhouses, and yellow dandelions growing on rocky cliff",
    genre: "Minimalist",
    sel: {
      "Render style": "Clay render",
      "Geometry": "Rounded / soft",
      "Materials": ["Matte / clay", "Glossy plastic"],
      "Render engine": "Blender Cycles",
      "Presentation": "Isometric",
      "Camera angle": "Three-quarter",
      "Shot size": "Wide shot",
      "Lighting": "Soft / diffused",
      "Shadow": "Soft shadows",
      "Color grade": "Pastel / soft",
      "Contrast & tone": "Balanced",
      "Focus & blur": "Tilt-shift (miniature)",
      "Composition": "Centered / symmetrical",
      "Mood": "Playful"
    }
  }
];

// ==========================================
// REAL-TIME LOCAL ENGLISH PROSE GENERATOR
// ==========================================

const compileProsePrompt = (tech: string, sub: string, gen: string | null, selects: Record<string, any>): string => {
  const parts: string[] = [];
  const subjectText = sub.trim() || "(Describe your subject above)";
  
  if (tech === "Photography") {
    parts.push(`An atmospheric photograph depicting ${subjectText}`);
  } else if (tech === "Illustration") {
    parts.push(`A beautiful illustration depicting ${subjectText}`);
  } else if (tech === "3D") {
    parts.push(`A masterfully modeled 3D render of ${subjectText}`);
  } else {
    parts.push(`A beautiful custom multimedia piece depicting ${subjectText}`);
  }

  if (gen) {
    parts.push(`set in a highly authentic and atmospheric ${gen} setting`);
  }

  // Pick up key parameters
  const lens = selects["Lens"];
  const aperture = selects["Aperture"];
  const film = selects["Film stock"];
  const medium = selects["Medium"];
  const styleOpt = selects["Style"];
  const movement = selects["Art movement"];
  const lines = selects["Line work"];
  const colorTreat = selects["Color treatment"];
  const texture = selects["Texture"];
  const renderStyle = selects["Render style"];
  const geo = selects["Geometry"];
  const mats = selects["Materials"];
  const engine = selects["Render engine"];
  const presentation = selects["Presentation"];

  if (tech === "Photography") {
    const photophys: string[] = [];
    if (lens) photophys.push(`shot on a premium ${lens} optical system`);
    if (aperture) photophys.push(`at a wide aperture of ${aperture} for gorgeous bokeh highlights`);
    if (film) photophys.push(`captured on genuine ${film} film stock to preserve organic color texture`);
    if (photophys.length) parts.push(photophys.join(", "));
  } else if (tech === "Illustration") {
    const illusphys: string[] = [];
    if (medium) illusphys.push(`sketched using ${medium} methods`);
    if (movement) illusphys.push(`tracing the classic spirit of ${movement}`);
    if (lines) illusphys.push(`featuring ${lines} contours`);
    if (colorTreat) illusphys.push(`shaded with a ${colorTreat} profile`);
    if (texture) illusphys.push(`underpinned by rich ${texture} overlays`);
    if (styleOpt && styleOpt.length) {
      const parsedS = Array.isArray(styleOpt) ? styleOpt.join(" and ") : styleOpt;
      illusphys.push(`evoking beautiful ${parsedS} styling characteristics`);
    }
    if (illusphys.length) parts.push(illusphys.join(", "));
  } else if (tech === "3D") {
    const renderphys: string[] = [];
    if (renderStyle) renderphys.push(`styled as a custom ${renderStyle} project`);
    if (geo) renderphys.push(`rendered with soft ${geo} meshes`);
    if (mats && mats.length) {
      const parsedM = Array.isArray(mats) ? mats.join(" and ") : mats;
      renderphys.push(`sculpted with tactile ${parsedM} surfaces`);
    }
    if (engine) renderphys.push(`baking lights with ${engine} engine architecture`);
    if (presentation) renderphys.push(`designed as a beautiful ${presentation}`);
    if (renderphys.length) parts.push(renderphys.join(", "));
  }

  // Universal settings
  const angle = selects["Camera angle"];
  const size = selects["Shot size"];
  const lighting = selects["Lighting"];
  const shadow = selects["Shadow"];
  const grade = selects["Color grade"];
  const contrast = selects["Contrast & tone"];
  const focus = selects["Focus & blur"];
  const composition = selects["Composition"];
  const mood = selects["Mood"];

  if (angle) parts.push(`viewed from a strategic ${angle}`);
  if (size) parts.push(`framed perfectly in a ${size} layout`);
  if (lighting) parts.push(`bathed in dramatic ${lighting} illumination`);
  
  if (shadow && shadow.length) {
    const parsedShadow = Array.isArray(shadow) ? shadow.join(" and ") : shadow;
    parts.push(`casting detailed ${parsedShadow} across elements`);
  }

  if (grade) parts.push(`chromatically graded with an elegant ${grade} treatment`);
  if (contrast) parts.push(`retaining ${contrast} dynamics`);
  if (focus) parts.push(`utilizing ${focus} optics`);
  if (composition) parts.push(`aligned according to the principles of ${composition} layout`);
  
  if (mood && mood.length) {
    const parsedMood = Array.isArray(mood) ? mood.join(" and ") : mood;
    parts.push(`evoking a profoundly ${parsedMood} and memorable sensation`);
  }

  return parts.join(", ").replace(/ ,/g, ",").replace(/,,/g, ",").trim() + ".";
};

// ==========================================
// SUB-CHIP COMPONENT
// ==========================================

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  onHover?: (state: boolean) => void;
  colorTheme: string;
  fieldKey?: string;
  key?: string | number;
}

function Chip({ label, active, onClick, onHover, colorTheme, fieldKey }: ChipProps) {
  const hasTip = !!TIPS[label];

  const ApproachableMap: Record<string, string> = {
    // photography - Lenses
    "35mm": "Street / Natural View",
    "50mm": "True-to-Eye Perspective",
    "85mm": "Creamy Portrait Focus",
    "135mm": "Isolated Subject Telephoto",
    "14mm ultra-wide": "Dramatic Wide Angle",
    "18mm ultra-wide": "Super-Wide Horizon",
    "24mm wide": "Environmental Landscape",
    "28mm": "Candid Street Panorama",
    "100mm macro": "Extreme Macro Close-Up",
    "200mm telephoto": "Compressed Distance Sports",

    // photography - Apertures
    "f/1.2": "Ultra-Soft Dreamy Focus",
    "f/1.4": "Razor-Thin Cinematic Depth",
    "f/1.8": "Blur Background (Bokeh)",
    "f/2.8": "Soft Depth of Field",
    "f/8": "Deep Infinite Definition",

    // photography - Film stock
    "Kodak Portra 400": "Warm Cinematic Tones",
    "Kodak Portra 160": "Smooth Studio Skin Tones",
    "Kodak Portra 800": "Warm Low-Light Saturates",
    "Kodak Gold 200": "Sunburst Golden Warmth",
    "Kodak Gold 100": "Vibrant Summer Nostalgia",
    "Kodak Ektar 100": "Vivid Saturation Landscape",
    "Kodak UltraMax 400": "Casual Retro Richness",
    "Agfa Vista 400": "Cool Vibrant Red Saturation",
    "Lomography Color 800": "High-Contrast Saturation",
    "CineStill 800T": "Electric Neon Night Glow",
    "CineStill 400D": "Daylight Cinematic Halation",
    "Kodak Vision3 500T": "Tungsten Cinema Drama",
    "Kodak Ektachrome": "Rich Vivid Slide Texture",
    "Fujifilm Provia 100F": "True-to-Life Neutral Slide",
    "Fujifilm Velvia 50": "High-Contrast Landscape Slide",
    "Cross-process slide": "Surreal Quirky Shift Tones",
    "Kodak Tri-X 400": "Classic B&W Grain",
    "Ilford HP5 Plus": "Classic Documentary Monochrome",
    "Ilford Delta 3200": "Extreme Artistic Grain",
    "Ilford Delta 100": "Fine-Grain Ultra-Sharp Mono",
    "Kodak T-Max 400": "Modern Smooth Monochrome",
    "Ilford FP4 125": "Gentle Balanced Silver Tonality",
    "Ilford SFX 200 (infrared)": "Surreal Luminous Foliage",
    "Ilford XP2 Super": "Convenient High-Contrast B&W",
    "Polaroid": "Retro Instamatic Frame",
    "Fujifilm Instax": "Modern Pocket Pop Instant",
    "Lomography Redscale": "Deep Fire Amber Monotone",
    "VHS": "Retro VHS Analog Tracking",
    "Super 8": "Nostalgic Home Movie Shimmer",
    "8mm": "Vintage 1920s Cellular Gate",
    "Expired film": "Faded Edge Color Decays",
    "Light leaks": "Golden Flare Flaw Accents",
    "Washed colors": "Dreamy Hazy Sunbleached Wash",
    "Digital clean": "Ultra-High Crisp Res",

    // photography - Camera format & medium
    "Leica M6 (35mm street realism)": "Nostalgic 35mm Rangefinder",
    "Hasselblad 500C (square 6x6 medium format)": "Bespoke Medium Format",
    "Arri Alexa LF (ultra-grade digital cinema)": "Elite Large Format Cinema",
    "Large format 8x10 view camera": "Monolithic 8x10 Bellows",
    "Polaroid SX-70 (vintage physical pack)": "Classic Land Camera",
    "Vintage 16mm Bolex (tactile indie scan)": "Handheld 16mm Gate Scan",

    "Natural skin texture": "Unfiltered Raw Detail",
    "iPhone photo": "Candid Snapshot",
    "Candid by friend": "Casual Lifestyle Capture",

    // illustration - Medium & Print
    "Flat vector": "Clean Geometric Shapes",
    "Watercolor": "Transparent Pigments",
    "Gouache": "Aesthetic Opaque Velvet",
    "Digital painting": "Sleek Digital Brushwork",
    "Risograph": "Retro Vibrant Risograph",
    "Screen print": "Layered Screenprint Texture",
    "Linocut": "Carved Linocut Blockprint",
    "Cut-paper collage": "Dimensional Paper Layering",
    "Halftone": "Retro Halftone Dot Pattern",
    "Stained glass": "Leaded Stained Glass Mosaic",
    "Stencil": "Urban Street Art Stencil",

    // illustration - Style
    "Anime key visual": "High-End Animation Cell",
    "Children's book": "Nostalgic Storybook Whimsy",
    "American comic": "Bold Pulp Outlines",
    "Arcane / painterly hybrid": "Luminous Textured Hybrid",
    "Art Nouveau": "Flowing Whiplash Elegance",
    "Art Deco": "Sleek Geometric Luxury",
    "Pop Art": "Vibrant Popular Satire",
    "Ukiyo-e": "Woodblock Masterpiece",
    "Clean / crisp": "Perfect Precise Ink",
    "Thick outline": "Bold Comic Contour",
    "Flat color": "Unshaded Hue Plains",
    "Cel shading": "Hard Dynamic Shadow",
    "Paper grain": "Organic Fiber Background",
    "Smooth / clean": "Impeccable Digital Flat",

    // 3d
    "Stylized 3D": "Whimsical Hand-Sculpt",
    "Clay render": "Tactile Raw Sculpture",
    "Photorealistic": "Hyper-Real Rays & Physics",
    "Low-poly": "Geometric Retro Facets",
    "High-poly / smooth": "Sleek Fluid Curves",
    "Glossy plastic": "Shiny Toy Glaze",
    "Matte / clay": "Powdered Velvet Finish",
    "Subsurface scattering": "Realistic Organic Glow",
    "Octane": "Elite Specular Reflections",
    "Blender Cycles": "Cycles Raytraced Physical Render",
    "V-Ray": "Ultra-Grade Commercial Architecture",
    "Cinema 4D": "Abstract Motion Graphic Mesh",
    "Diorama": "Miniature Ecosystem Model",
    "Blind-box figure": "Collectible Vinyl Toy Style",
    "PBR realistic": "Physically Based Realism",
    "Brushed metal": "Satin-Finish Industrial Alloys",
    "Polished chrome": "Specular Mirror Chromatic Flare",
    "Frosted glass": "Soft Diffused Matte Refractions",
    "Iridescent": "Oil-Slick Holographic Film",
    "Unreal Engine 5": "Real-time Unreal Immersion",
    "Isometric": "Orthographic Diorama View",
    "Floating object": "Isolated Miniature Focus",

    // mixed media
    "Photo + illustration": "Art Meets Reality",
    "Paint + collage": "Textured Splatter Scrapbook",
    "Torn-edge layering": "Ripped Paper Shards",
    "Transparent washes": "Ethereal Overlay Stains",
    "Torn paper": "Tactile Ragged Borders",
    "Editorial collage": "Premium Magazine Plate",

    // universal
    "Eye level": "Natural Straight-On View",
    "Low angle": "Looming Heroic Depth",
    "High angle": "Dramatic Downward Plane",
    "Close-up": "Intimate Macro Focus",
    "Medium shot": "Harmonious Character Frame",
    "Full body": "Complete Silhouette Line",
    "Wide shot": "Grand Panoramic Scale",
    "Soft / diffused": "Gentle Flattering Lumens",
    "Rembrandt": "Moody Chiaroscuro Triangle",
    "Golden hour": "Warm Amber Sunburst",
    "Low-key": "Atmospheric Dim Shadow",
    "Soft shadows": "Smooth Shading Falloff",
    "Hard-edged shadows": "Stark Graphic Contrasts",
    "Teal & orange": "Vibrant Cinema Palette",
    "Warm nostalgic": "Retro Sunburnt Tone",
    "Muted / earthy": "Desaturated Sophistication",
    "B&W high-contrast": "Stark Dark Film Grain",
    "High contrast": "Dense Blacks & Bright Highlights",
    "Low contrast / soft": "Washy Nostalgic Matte",
    "Faded / matte": "Hazy Vintage Faded Grey",
    "Shallow depth of field": "Exquisite Focal Splitting",
    "Sharp throughout": "Infinite Panoramic Sharpness",
    "Long exposure": "Ethereal Speed Streams",
    "Rule of thirds": "Perfect Proportional Balance",
    "Centered": "Monolithic Symmetric Order",
    "Negative space": "Breathing Minimalist Space",
    "Cinematic": "Atmospheric Silver Screen",
    "Editorial": "Vogue Styling Showcase",
    "Moody": "Haunting Dark Resonance",
    "Minimalist": "Sleek Restrained Purge"
  };

  const hasTranslation = !!ApproachableMap[label];

  let themeClasses = "";
  if (active) {
    if (colorTheme === "Photography") {
      themeClasses = "bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)] scale-[1.015]";
    } else if (colorTheme === "Illustration") {
      themeClasses = "bg-rose-500/15 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)] scale-[1.015]";
    } else if (colorTheme === "3D") {
      themeClasses = "bg-emerald-500/15 border-emerald-500 text-emerald-350 shadow-[0_0_12px_rgba(16,185,129,0.3)] scale-[1.015]";
    } else {
      themeClasses = "bg-indigo-500/15 border-indigo-500 text-indigo-350 shadow-[0_0_12px_rgba(99,102,241,0.3)] scale-[1.015]";
    }
  } else {
    themeClasses = "bg-zinc-950/40 hover:bg-zinc-900/65 text-zinc-400 hover:text-white border-white/[0.04] hover:border-white/[0.09]";
  }

  if (hasTranslation) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        onMouseEnter={() => onHover && onHover(true)}
        onMouseLeave={() => onHover && onHover(false)}
        className={`relative inline-flex flex-col items-start p-3 gap-1 rounded-xl border tracking-wide transition-all duration-150 cursor-pointer text-left w-fit shrink-0 whitespace-nowrap min-h-[58px] justify-between group ${themeClasses}`}
      >
        <div className="flex items-start justify-between w-full gap-2.5">
          <span className="font-bold text-[10.5px] leading-tight text-white/95 group-hover:text-amber-300 transition-colors font-mono tracking-tight" title={label}>
            {label}
          </span>
          {hasTip && (
            <span className={`text-[9px] select-none font-mono font-bold px-1 rounded ${active ? "text-amber-300" : "text-zinc-600 group-hover:text-zinc-400"}`}>
              ⓘ
            </span>
          )}
        </div>
        <div className="flex items-center justify-between w-full gap-2.5 mt-0.5">
          <span className="text-[9px] text-zinc-500 group-hover:text-zinc-350 font-sans font-semibold tracking-wide">
            {ApproachableMap[label]}
          </span>
          {active && (
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
              colorTheme === "Photography" ? "bg-amber-400" :
              colorTheme === "Illustration" ? "bg-rose-455" :
              colorTheme === "3D" ? "bg-emerald-400" : "bg-indigo-400"
            } animate-pulse`} />
          )}
        </div>
      </button>
    );
  } else {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        onMouseEnter={() => onHover && onHover(true)}
        onMouseLeave={() => onHover && onHover(false)}
        className={`relative inline-flex items-center justify-center p-3 gap-2 rounded-xl border tracking-wide transition-all duration-150 cursor-pointer text-center w-fit shrink-0 whitespace-nowrap min-h-[46px] group ${themeClasses}`}
      >
        <span className="font-extrabold text-[11.5px] text-zinc-100 group-hover:text-amber-300 transition-colors">
          {label}
        </span>
        {hasTip && (
          <span className={`text-[9px] select-none font-mono font-bold px-1 rounded ${active ? "text-amber-300" : "text-zinc-600 group-hover:text-zinc-400"}`}>
            ⓘ
          </span>
        )}
        {active && (
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
            colorTheme === "Photography" ? "bg-teal-400" :
            colorTheme === "Illustration" ? "bg-rose-455" :
            colorTheme === "3D" ? "bg-emerald-400" : "bg-indigo-400"
          } animate-pulse`} />
        )}
      </button>
    );
  }
}

const getFieldIcon = (key: string, theme: string) => {
  const k = key.toLowerCase();
  const fillCol = 
    theme === "Photography" ? "text-teal-400" :
    theme === "Illustration" ? "text-rose-455" :
    theme === "3D" ? "text-emerald-400" : "text-indigo-400";

  const commonCol = "text-zinc-400";
  
  if (k.includes("lens")) return <Camera size={13} className={`${fillCol} shrink-0`} />;
  if (k.includes("aperture")) return <Eye size={13} className={`${fillCol} shrink-0`} />;
  if (k.includes("film stock")) return <Film size={13} className={`${fillCol} shrink-0`} />;
  
  // Others
  if (k.includes("realism")) return <Sparkles size={12} className={`${fillCol} shrink-0`} />;
  if (k.includes("medium")) return <Palette size={12} className={`${fillCol} shrink-0`} />;
  if (k.includes("style")) return <Sparkle size={12} className={`${fillCol} shrink-0`} />;
  if (k.includes("movement")) return <Compass size={12} className={`${fillCol} shrink-0`} />;
  if (k.includes("line")) return <Sliders size={12} className={`${fillCol} shrink-0`} />;
  if (k.includes("color")) return <Palette size={12} className={`${fillCol} shrink-0`} />;
  if (k.includes("texture")) return <Layers size={11} className={`${fillCol} shrink-0`} />;
  if (k.includes("render")) return <Box size={12} className={`${fillCol} shrink-0`} />;
  if (k.includes("geometry")) return <Box size={12} className={`${fillCol} shrink-0`} />;
  if (k.includes("material")) return <Layers size={11} className={`${fillCol} shrink-0`} />;
  if (k.includes("presentation")) return <Compass size={12} className={`${fillCol} shrink-0`} />;
  if (k.includes("combination")) return <Layers size={11} className={`${fillCol} shrink-0`} />;
  if (k.includes("layering")) return <Layers size={11} className={`${fillCol} shrink-0`} />;
  if (k.includes("tradition")) return <Compass size={12} className={`${fillCol} shrink-0`} />;
  
  // Universals / fallback
  if (k.includes("angle") || k.includes("shot")) return <Camera size={12} className={`${commonCol} shrink-0`} />;
  if (k.includes("lighting")) return <Sparkles size={12} className="text-amber-400 shrink-0" />;
  if (k.includes("shadow")) return <Eye size={12} className={`${commonCol} shrink-0`} />;
  if (k.includes("contrast")) return <SlidersHorizontal size={12} className={`${commonCol} shrink-0`} />;
  if (k.includes("focus")) return <Eye size={12} className={`${commonCol} shrink-0`} />;
  if (k.includes("noise")) return <Sliders size={12} className={`${commonCol} shrink-0`} />;
  if (k.includes("aspect")) return <Box size={12} className={`${commonCol} shrink-0`} />;
  if (k.includes("negative")) return <AlertTriangle size={12} className="text-red-400/80 shrink-0" />;
  
  return <SlidersHorizontal size={11} className={`${commonCol} shrink-0`} />;
};

// ==========================================
// EXPANDABLE TAX FIELD COMPONENT
// ==========================================

interface FieldProps {
  field: TaxField;
  selected: any;
  onToggle: (field: TaxField, v: string) => void;
  onHoverToken: (label: string, tip: string | null) => void;
  colorTheme: string;
}

function Field({ field, selected, onToggle, onHoverToken, colorTheme }: FieldProps) {
  const [open, setOpen] = useState(false);
  
  const isSel = (v: string) => {
    if (field.multi) {
      return (selected as string[] || []).includes(v);
    }
    return selected === v;
  };
  
  const allItems = Object.values(field.items).flat();
  const hasMore = allItems.length > field.pop.length;

  return (
    <div className="mb-4 bg-zinc-900/30 border border-white/[0.04] hover:border-white/[0.07] rounded-xl p-4 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase font-mono flex items-center gap-2">
          {getFieldIcon(field.key, colorTheme)}
          {field.key} 
          {field.multi && (
            <span className="text-[9px] text-zinc-500 font-normal normal-case italic font-sans ml-1">
              (multi-select)
            </span>
          )}
        </span>
        {hasMore && (
          <button 
            type="button"
            onClick={() => setOpen(!open)} 
            className="text-[10px] font-mono tracking-widest uppercase font-bold text-zinc-400 hover:text-white transition-colors pointer-events-auto cursor-pointer flex items-center gap-1"
          >
            {open ? "− Less Tags" : `+ Browse (${allItems.length - field.pop.length})`}
          </button>
        )}
      </div>

      {!open ? (
        <div className="flex flex-wrap gap-3 items-center justify-start w-full py-3">
          {field.pop.map(v => (
            <Chip 
              key={v} 
              label={v} 
              active={isSel(v)} 
              onClick={() => onToggle(field, v)} 
              colorTheme={colorTheme}
              fieldKey={field.key}
              onHover={(hov) => {
                onHoverToken(v, hov ? TIPS[v] || `A creative descriptor parameter for ${field.key}.` : null);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          {Object.entries(field.items).map(([fam, vals]) => (
            <div key={fam} className="bg-black/20 rounded-xl p-3 border border-white/[0.03]">
              {Object.keys(field.items).length > 1 && (
                <div className="text-[8.5px] font-mono tracking-widest text-zinc-500 font-black uppercase mb-2">
                  {fam}
                </div>
              )}
              <div className="flex flex-wrap gap-3 items-center justify-start w-full py-3">
                {vals.map(v => (
                  <Chip 
                    key={v} 
                    label={v} 
                    active={isSel(v)} 
                    onClick={() => onToggle(field, v)} 
                    colorTheme={colorTheme}
                    fieldKey={field.key}
                    onHover={(hov) => {
                      onHoverToken(v, hov ? TIPS[v] || `A structured taxonomy option for ${field.key}.` : null);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// SYNTAX COLORIZER FOR THE ENHANCED JSON PROMPT
// ==========================================

function renderSyntaxColoredJson(val: string | null) {
  if (!val) return null;
  try {
    const formatted = typeof val === "string" ? val : JSON.stringify(val, null, 2);
    // Escape HTML symbols securely
    const escaped = formatted
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Regex matching for JSON nodes
    const highlighted = escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?|([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)|(true|false|null)/g,
      (match) => {
        let cls = "text-amber-200"; // Default values
        if (/:$/.test(match)) {
          cls = "text-amber-400 font-semibold"; // JSON keys
        } else if (/true|false/.test(match)) {
          cls = "text-teal-400 font-bold";     // Boolean tags
        } else if (/null/.test(match)) {
          cls = "text-red-400 font-bold animate-pulse"; // Null properties
        } else if (/^[+-]?\d/.test(match)) {
          cls = "text-sky-400";                 // Focal numbers
        } else {
          cls = "text-zinc-100 max-w-full inline-block break-words select-text"; // String nodes
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
    return (
      <div 
        className="font-mono text-[11px] leading-relaxed select-text [word-break:break-word] break-words whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: highlighted }} 
      />
    );
  } catch (e) {
    return <div className="font-mono text-[11px] text-zinc-300">{val}</div>;
  }
}

// ==========================================
// DRAFT SAVED ELEMENT STRUCTURE
// ==========================================

interface SavedPrompt {
  id: string;
  title: string;
  timestamp: number;
  technique: string;
  subject: string;
  genre: string | null;
  sel: Record<string, any>;
  elements?: any[];
}

const deconstructSystemInstructionClient = `You are an expert Computer Vision agent, Creative Lens Archivist, and senior AI Prompt Reverse-Engineer. Your job is to analyze the provided image, identify its primary subject matter, determine its artistic/recording medium, and decode its exact technical properties.

You must output a highly detailed, professional analysis of the image matching BOTH a mapped set of UI tokens, AND a beautiful rich teardown of creative factors.

Return your analysis STRICTLY as a single, valid JSON object matching the exact schema below. Do not put any formatting, markdown wrappers, prefaces, or postfaces.

JSON SCHEMA EXPECTED:
{
  "ui_mapping": {
    "subject": "A vivid 1-2 sentence descriptive prose of the foreground focus, subjects, physical actions, and environment settings. Be highly concrete.",
    "technique": "Photography" | "Illustration" | "3D" | "Mixed media",
    "detected_tokens": {
      "Camera angle": "Must be exactly one of: \\"Eye level\\", \\"Low angle\\", \\"High angle\\", \\"Worm\'s eye\\", \\"Bird\'s eye / overhead\\", \\"Dutch angle\\", \\"Over-the-shoulder\\", \\"POV\\", \\"Three-quarter\\", \\"Profile\\"",
      "Shot size": "Must be exactly one of: \\"Extreme close-up\\", \\"Close-up\\", \\"Medium close-up\\", \\"Medium shot\\", \\"Cowboy shot\\", \\"Full body\\", \\"Wide shot\\", \\"Extreme wide\\", \\"Macro\\"",
      "Lighting": "Must be exactly one of: \\"Rembrandt\\", \\"Butterfly\\", \\"Loop\\", \\"Split\\", \\"Broad\\", \\"Short\\", \\"Flat / high-key\\", \\"Soft / diffused\\", \\"Hard light\\", \\"Studio softbox\\", \\"Rim / edge\\", \\"Backlight\\", \\"Key light\\", \\"Fill light\\", \\"Ring light\\", \\"Natural window\\", \\"Top light\\", \\"Cross lighting\\", \\"Bounced\\", \\"Beauty dish\\", \\"Fresnel / spot\\", \\"Snoot\\", \\"Gobo / patterned\\", \\"Umbrella\\", \\"Color gels\\", \\"Duo-tone\\", \\"Light painting\\", \\"Golden hour\\", \\"Blue hour\\", \\"Overcast\\", \\"Harsh midday\\", \\"Neon / night\\", \\"Volumetric / god rays\\", \\"Chiaroscuro\\", \\"High-key\\", \\"Low-key\\", \\"Candlelight\\", \\"Firelight\\", \\"Lens flares\\", \\"String / fairy lights\\", \\"Bioluminescence\\", \\"Fluorescent\\", \\"Tungsten / warm\\", \\"Concert / stage\\", \\"Soft glow\\"",
      "Shadow": ["Select 1-2 matching shadow descriptors from: \\"Soft shadows\\", \\"Hard-edged shadows\\", \\"Dappled shadows\\", \\"Gobo shadows\\", \\"Cinematic split shadows\\", \\"Chiaroscuro\\", \\"Long casting shadows\\", \\"Penumbra shadows\\", \\"Ambient occlusion\\", \\"Contour shadows\\", \\"Opaque dense shadows\\", \\"Filtered shadows\\", \\"Dramatic high-contrast\\", \\"Silhouette shadows\\", \\"Backlit\\", \\"Colorful shadows\\", \\"Gradient shadows\\", \\"Abstract patterns\\", \\"Geometric shadows\\", \\"Hatched shadows\\", \\"Shadow play\\", \\"Layered shadows\\", \\"Projected shadows\\", \\"Negative space shadows\\", \\"Reflective shadows\\", \\"Mirrored shadows\\", \\"Double exposure\\", \\"Infrared shadows\\", \\"Motion blur shadows\\", \\"Radiant shadows\\", \\"Intersecting shadows\\", \\"Dispersed shadows\\", \\"Textured shadows\\", \\"Volumetric shadows\\", \\"Directional shadows\\", \\"Negative light shadows\\""],
      "Color grade": "Must be exactly one of: \\"Teal & orange\\", \\"Bleach bypass\\", \\"Cross-process\\", \\"Muted / earthy\\", \\"Technicolor\\", \\"Warm nostalgic\\", \\"Cool / cold\\", \\"Green dystopian\\", \\"Monochrome\\", \\"Pastel / soft\\", \\"High saturation\\", \\"B&W high-contrast\\", \\"Sepia\\"",
      "Contrast & tone": "Must be exactly one of: \\"High contrast\\", \\"Balanced\\", \\"Low contrast / soft\\", \\"Faded / matte (lifted blacks)\\", \\"Flat / lifted shadows\\", \\"Crushed blacks\\", \\"Hazy / misty\\"",
      "Focus & blur": "Must be exactly one of: \\"Sharp throughout\\", \\"Shallow depth of field\\", \\"Soft focus\\", \\"Gaussian blur\\", \\"Bokeh background\\", \\"Tilt-shift (miniature)\\", \\"Lens blur\\", \\"Defocused background\\", \\"Motion blur\\", \\"Camera shake\\", \\"Long exposure\\", \\"Light trails / streaking\\", \\"Slow shutter\\", \\"Radial / zoom blur\\", \\"Double exposure\\""
    }
  },
  "detailed_teardown": {
    "metadata": {
      "dimensions_px": { "width": 1000, "height": 1250 },
      "aspect_ratio": "e.g. 4:5, 1:1, 16:9",
      "style": "Highly specific style keywords (e.g. \\"stylized digital art, vaporwave illustration, flat vector vector, photorealistic cinematic film\\")",
      "mood": "e.g. \\"contemplative, creative, tense, retro-futural, melancholic\\""
    },
    "color_palette": {
      "dominant_colors_hex": ["#D9A2B1", "#A3C6D6"],
      "accent_colors_hex": ["#FF4848"],
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
      "text_elements_present": "Specific text visible (e.g. \'THINK CREATE\' written on signs)",
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

const callGeminiDirectly = async (apiKey: string, prompt: string, systemInstruction?: string, temperature = 0.7) => {
  const modelAndVersions = [
    { model: "gemini-2.5-flash", ver: "v1" },
    { model: "gemini-2.5-flash", ver: "v1beta" },
    { model: "gemini-1.5-flash", ver: "v1" },
    { model: "gemini-1.5-flash", ver: "v1beta" },
    { model: "gemini-1.5-flash-latest", ver: "v1" },
    { model: "gemini-1.5-flash-latest", ver: "v1beta" }
  ];
  let lastError: any = null;

  for (const item of modelAndVersions) {
    try {
      const url = `https://generativelanguage.googleapis.com/${item.ver}/models/${item.model}:generateContent?key=${apiKey}`;
      const payload: any = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: temperature,
          responseMimeType: "application/json"
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Google API status ${res.status}: ${errText}`);
      }

      const resData = await res.json();
      const contentText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (contentText) {
        return contentText;
      }
      throw new Error("Empty content parts in direct Google API response.");
    } catch (e) {
      lastError = e;
      console.warn(`Direct client call with model ${item.model} on ${item.ver} failed:`, e);
    }
  }
  throw lastError || new Error("Failed to contact Gemini API directly.");
};

const deconstructDirectly = async (apiKey: string, base64Data: string, systemInstructionClient: string) => {
  let rawBase64 = base64Data;
  let mimeType = 'image/jpeg';
  if (base64Data.includes(';base64,')) {
    const parts = base64Data.split(';base64,');
    rawBase64 = parts[1];
    const mimeMatches = parts[0].match(/data:(.*?)$/);
    if (mimeMatches && mimeMatches[1]) {
      mimeType = mimeMatches[1];
    }
  }

  const modelAndVersions = [
    { model: "gemini-2.5-flash", ver: "v1" },
    { model: "gemini-2.5-flash", ver: "v1beta" },
    { model: "gemini-1.5-flash", ver: "v1" },
    { model: "gemini-1.5-flash", ver: "v1beta" },
    { model: "gemini-1.5-flash-latest", ver: "v1" },
    { model: "gemini-1.5-flash-latest", ver: "v1beta" }
  ];
  let lastError: any = null;

  for (const item of modelAndVersions) {
    try {
      const url = `https://generativelanguage.googleapis.com/${item.ver}/models/${item.model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: rawBase64
                }
              },
              {
                text: "Analyze and deconstruct this reference image with maximum visual accuracy. Return the output STRICTLY matching the expected schema with 'ui_mapping' and 'detailed_teardown' fields, with no prefaces or markdown blocks."
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemInstructionClient }]
        },
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Google API status ${res.status}: ${errText}`);
      }

      const resData = await res.json();
      const contentText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (contentText) {
        return contentText;
      }
      throw new Error("Empty deconstruct output.");
    } catch (e) {
      lastError = e;
      console.warn(`Direct deconstruct call with model ${item.model} on ${item.ver} failed:`, e);
    }
  }
  throw lastError || new Error("Failed to contact Gemini API directly for image deconstruction.");
};

// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================

export default function App() {
  const [technique, setTechnique] = useState("Photography");
  const [subject, setSubject] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [sel, setSel] = useState<Record<string, any>>({});
  const [autofilled, setAutofilled] = useState<Record<string, boolean>>({});
  
  const [genreOpen, setGenreOpen] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [aiProse, setAiProse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [userApiKey, setUserApiKey] = useState(() => {
    try {
      return localStorage.getItem("user_gemini_api_key") || "";
    } catch {
      return "";
    }
  });
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [isSwellVisible, setIsSwellVisible] = useState(true);
  const elevatePrompt = isSwellVisible;
  const setElevatePrompt = setIsSwellVisible;
  const [elapsed, setElapsed] = useState(0);
  
  // Image Reverse Engineering (Multimodal)
  const [subjectTab, setSubjectTab] = useState<"prose" | "deconstruct">("prose");
  const [deconstructImage, setDeconstructImage] = useState<string | null>(null);
  const [deconstructLoading, setDeconstructLoading] = useState(false);
  const [deconstructError, setDeconstructError] = useState<string | null>(null);
  const [deconstructFeedback, setDeconstructFeedback] = useState<string | null>(null);
  
  // Glossary explanation card hover state
  const [hoveredTip, setHoveredTip] = useState<{ label: string; tip: string } | null>(null);

  // Active view tab for the output deck: "prose" | "json" | "tags" | "teardown"
  const [outputTab, setOutputTab] = useState<"prose" | "json" | "tags" | "teardown">("prose");
  const [detailedTeardown, setDetailedTeardown] = useState<any | null>(null);

  // Local saved drafts system
  const [savedVault, setSavedVault] = useState<SavedPrompt[]>([]);
  const [saveTitle, setSaveTitle] = useState("");
  const [showVault, setShowVault] = useState(false);

  // AI Storyboard description state
  const [storyboardText, setStoryboardText] = useState<string | null>(null);
  const [storyboardLoading, setStoryboardLoading] = useState(false);
  const [showStoryboard, setShowStoryboard] = useState(false);

  // Mixed Media Layers
  const [elements, setElements] = useState<Array<{ id: number; desc: string; treatment: string }>>([
    { id: 1, desc: "", treatment: "Photoreal" },
    { id: 2, desc: "", treatment: "Illustration (manga)" },
  ]);

  // Load saved prompt vault from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("prompt_codex_vault");
      if (stored) {
        setSavedVault(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load prompt vault from localStorage", e);
    }
  }, []);

  // Sync elapsed timer
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (loading) {
      t = setInterval(() => {
        setElapsed(prev => prev + 0.1);
      }, 100);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(t);
  }, [loading]);

  const addElement = () => {
    setElements(e => e.length >= 5 ? e : [...e, { id: Date.now(), desc: "", treatment: "Photoreal" }]);
  };
  const removeElement = (id: number) => {
    setElements(e => e.filter(x => x.id !== id));
  };
  const updateElement = (id: number, patch: Partial<{ id: number; desc: string; treatment: string }>) => {
    setElements(e => e.map(x => x.id === id ? { ...x, ...patch } : x));
  };

  const changeTechnique = (t: string) => {
    setTechnique(t);
    setSel({});
    setAutofilled({});
    setGenre(null);
    setOutput(null);
    setAiProse(null);
    setStoryboardText(null);
    setShowStoryboard(false);
  };

  const resetAll = () => {
    setSel({});
    setAutofilled({});
    setGenre(null);
    setSubject("");
    setOutput(null);
    setAiProse(null);
    setErr(null);
    setHoveredTip(null);
    setStoryboardText(null);
    setShowStoryboard(false);
    setElements([
      { id: 1, desc: "", treatment: "Photoreal" },
      { id: 2, desc: "", treatment: "Illustration (manga)" },
    ]);
  };

  // Pre-load specific cookbooks presets
  const loadCookbookPreset = (preset: CookbookPreset) => {
    setTechnique(preset.technique);
    setSubject(preset.subject);
    setGenre(preset.genre);
    setSel(preset.sel);
    setAutofilled({});
    setStoryboardText(null);
    setShowStoryboard(false);
    if (preset.technique === "Mixed media" && preset.sel.elements) {
      setElements(preset.sel.elements);
    }
  };

  // Roll the Chaos Engine (randomizer rig)
  const rollChaosEngine = () => {
    const RANDOM_SUBJECTS = [
      "A mysterious modern glass obsidian temple half-submerged in a deep teal lagoon",
      "An ancient brass astrolabe floating amidst glittering interstellar nebula clouds",
      "A hyper-detailed mechanical hummingbird sipping electric nectar from a glowing metal flower",
      "A solitary weathered astronaut resting on a rusty bench on the moon, looking back at a vibrant blue Earth",
      "A high-angle cinematic drone shot of a misty autumn forest canyon with a single crimson tree at the center",
      "A detailed close-up of a cybernetic tiger with glowing amber fissures across its obsidian steel plating",
      "A cozy futuristic research base inside a massive glowing underground crystal geode cavern",
      "A majestic bioluminescent stingray gliding above the pristine sunken neon ruins of a fantasy clocktower",
      "An old lighthouse keeper operating a massive glowing prism crystal during a colossal crimson thunderstorm",
      "A sleek modern hover-train speeding down an elevated mountain bridge above sea of clouds at sunrise"
    ];

    const randomSubject = RANDOM_SUBJECTS[Math.floor(Math.random() * RANDOM_SUBJECTS.length)];
    setSubject(randomSubject);

    const newSel: Record<string, any> = {};

    // Pick a random genre (60% chance)
    const genreKeys = Object.keys(GENRE_DEFAULTS);
    const randomGenre = Math.random() > 0.4 ? genreKeys[Math.floor(Math.random() * genreKeys.length)] : null;
    setGenre(randomGenre);

    // Collect default values for this genre to autofill
    const localAutofills: Record<string, string> = {};
    if (randomGenre) {
      const defaults = GENRE_DEFAULTS[randomGenre] || {};
      Object.entries(defaults).forEach(([k, val]) => {
        let targetKey = "";
        if (k === "lighting") targetKey = "Lighting";
        else if (k === "color") targetKey = "Color grade";
        else if (k === "mood") targetKey = "Mood";
        else if (k === "shadow") targetKey = "Shadow";

        if (targetKey) {
          localAutofills[targetKey] = val;
        }
      });
    }
    setAutofilled(localAutofills);

    const specFields = TAX[technique].specific;
    const refineKeysLocal = ["Lighting", "Color grade", "Camera angle"];
    const refineUniv = UNIVERSAL.filter(f => refineKeysLocal.includes(f.key));
    const fullUniv = UNIVERSAL.filter(f => !refineKeysLocal.includes(f.key));

    // Specific fields selection
    specFields.forEach(f => {
      if (localAutofills[f.key]) return;
      if (Math.random() > 0.35) {
        const options: string[] = [];
        if (f.pop && f.pop.length > 0) options.push(...f.pop);
        Object.values(f.items).forEach(arr => options.push(...arr));
        const uniqueOptions = Array.from(new Set(options));
        if (uniqueOptions.length > 0) {
          if (f.multi) {
            const picked = [uniqueOptions[Math.floor(Math.random() * uniqueOptions.length)]];
            if (Math.random() > 0.6 && uniqueOptions.length > 1) {
              const second = uniqueOptions[Math.floor(Math.random() * uniqueOptions.length)];
              if (second !== picked[0]) picked.push(second);
            }
            newSel[f.key] = picked;
          } else {
            newSel[f.key] = uniqueOptions[Math.floor(Math.random() * uniqueOptions.length)];
          }
        }
      }
    });

    // Refinement fields selection
    refineUniv.forEach(f => {
      if (localAutofills[f.key]) return;
      if (Math.random() > 0.3) {
        const options: string[] = [];
        if (f.pop && f.pop.length > 0) options.push(...f.pop);
        Object.values(f.items).forEach(arr => options.push(...arr));
        const uniqueOptions = Array.from(new Set(options));
        if (uniqueOptions.length > 0) {
          newSel[f.key] = uniqueOptions[Math.floor(Math.random() * uniqueOptions.length)];
        }
      }
    });

    // Full deep properties selection
    fullUniv.forEach(f => {
      if (localAutofills[f.key]) return;
      if (Math.random() > 0.45) {
        const options: string[] = [];
        if (f.pop && f.pop.length > 0) options.push(...f.pop);
        Object.values(f.items).forEach(arr => options.push(...arr));
        const uniqueOptions = Array.from(new Set(options));
        if (uniqueOptions.length > 0) {
          if (f.multi) {
            newSel[f.key] = [uniqueOptions[Math.floor(Math.random() * uniqueOptions.length)]];
          } else {
            newSel[f.key] = uniqueOptions[Math.floor(Math.random() * uniqueOptions.length)];
          }
        }
      }
    });

    // Mixed media selection details
    if (technique === "Mixed media") {
      const sampleMaterials = ["Watercolor brushstrokes", "Ripped newspaper clipping", "Charcoal sketched figures", "Handmade paper textures", "Found object elements"];
      const randomElements = [
        { id: 1, desc: "A majestic centerpiece subject", treatment: "Photoreal" },
        { id: 2, desc: sampleMaterials[Math.floor(Math.random() * sampleMaterials.length)], treatment: "Collage / cutout" },
      ];
      setElements(randomElements);
    }

    setSel(newSel);

    // Smoothly scroll to the bottom of the viewport to reveal the compiled target cards
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 150);
  };

  const selCount = useMemo(() => {
    let n = 0;
    Object.values(sel).forEach(v => {
      if (v !== null && v !== undefined && (!Array.isArray(v) || v.length)) n++;
    });
    if (genre) n++;
    return n;
  }, [sel, genre]);

  const specificFields = TAX[technique].specific;
  const refineKeys = ["Lighting", "Color grade", "Camera angle"];
  const refineUniversal = UNIVERSAL.filter(f => refineKeys.includes(f.key));
  const fullUniversal = UNIVERSAL.filter(f => !refineKeys.includes(f.key));

  const toggle = useCallback((field: TaxField, v: string) => {
    setSel(prev => {
      const cur = prev[field.key];
      if (field.multi) {
        const arr = (cur as string[]) || [];
        return { 
          ...prev, 
          [field.key]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] 
        };
      }
      return { ...prev, [field.key]: cur === v ? null : v };
    });
    setAutofilled(prev => ({ ...prev, [field.key]: false }));
  }, []);

  const handleDeselectToken = useCallback((tok: string) => {
    const foundField = [...specificFields, ...UNIVERSAL].find(f => {
      const v = sel[f.key];
      if (!v) return false;
      if (Array.isArray(v)) return v.includes(tok);
      return v === tok;
    });
    if (foundField) {
      toggle(foundField, tok);
    }
  }, [sel, specificFields, toggle]);

  const pickGenre = (g: string) => {
    if (genre === g) {
      setGenre(null);
      return;
    }
    setGenre(g);
    const d = GENRE_DEFAULTS[g];
    if (d) {
      setSel(prev => {
        const next = { ...prev };
        const af: Record<string, boolean> = {};
        for (const [k, v] of Object.entries(d)) {
          const fieldKey = { lighting: "Lighting", color: "Color grade", mood: "Mood", shadow: "Shadow" }[k];
          if (!fieldKey) continue;
          const fieldDef = UNIVERSAL.find(f => f.key === fieldKey);
          if (!fieldDef) continue;
          if (fieldDef.multi) {
            if (!next[fieldKey] || next[fieldKey].length === 0) {
              next[fieldKey] = [v];
              af[fieldKey] = true;
            }
          } else {
            if (!next[fieldKey]) {
              next[fieldKey] = v;
              af[fieldKey] = true;
            }
          }
        }
        setAutofilled(prevAf => ({ ...prevAf, ...af }));
        return next;
      });
    }
  };

  const recipe = useMemo(() => {
    const r: Record<string, any> = { technique, subject: subject || "(Describe your subject above)" };
    if (genre) r.genre = genre;
    if (technique === "Mixed media") {
      const els = elements.filter(e => e.desc.trim());
      if (els.length) {
        r.elements = els.map(e => ({ element: e.desc, treatment: e.treatment }));
      }
    }
    [...specificFields, ...UNIVERSAL].forEach(f => {
      const v = sel[f.key];
      if (v !== null && v !== undefined && (!Array.isArray(v) || v.length)) {
        r[f.key.toLowerCase().replace(/ /g, "_")] = v;
      }
    });
    return r;
  }, [technique, subject, genre, sel, specificFields, elements]);

  const activeTokens = useMemo(() => {
    const out: string[] = [];
    [...specificFields, ...UNIVERSAL].forEach(f => {
      const v = sel[f.key];
      if (v === null || v === undefined || (Array.isArray(v) && !v.length)) return;
      (Array.isArray(v) ? v : [v]).forEach(x => out.push(x));
    });
    return out;
  }, [sel, specificFields]);

  // Real-time local compiled prose preview (before API call!)
  const liveProseText = useMemo(() => {
    return compileProsePrompt(technique, subject, genre, sel);
  }, [technique, subject, genre, sel]);

  // Assemble Raw Prompt (LOCAL ONLY)
  const assembleRawPrompt = () => {
    const raw = compileProsePrompt(technique, subject, genre, sel);
    setAiProse(raw);
    const simpleJson = {
      technique,
      subject: subject || "(Describe your subject above)",
      genre: genre || undefined,
      selected_tokens: activeTokens,
      recipe: recipe
    };
    setOutput(JSON.stringify(simpleJson, null, 2));
    setOutputTab("prose");
    setErr(null);
  };

  // Generate / Compile Prompt with Gemini AI core model
  const generate = async (userApiKey?: string) => {
    setLoading(true);
    setErr(null);
    setOutput(null);
    setAiProse(null);

    const basePrompt = `You are an expert AI image-prompt engineer, Creative Director, and Visual Architect. 
Your job is to convert the structured creative recipe below into a single, unified JSON response containing two high-fidelity prompt variants for image generators (Nano Banana / GPT Image / Midjourney / Higgsfield):
1. A breathtaking, highly cinematic visual prose prompt ("prose_prompt").
2. An advanced, production-ready structured JSON prompt containing spatial, optical, and color formulas ("json_prompt").

Deliver your response STRICTLY as a single, valid JSON object with exactly two keys. Do not return any other text, markdown blocks, prefaces, or postfaces.
The JSON structure MUST conform exactly to:
{
  "prose_prompt": "YOUR_BREATHTAKING_PROSE_PROMPT_STRING_HERE",
  "json_prompt": YOUR_JSON_PROMPT_OBJECT_HERE
}

CRITICAL RULES FOR "prose_prompt" (THE CINEMATIC PROSE):
1. DO NOT just list the parameters out as comma-separated tags. 
2. Weave the chosen parameters (like specific film stocks, lenses, or art styles) organically into a rich, fluid description.
3. Write with raw visceral energy and human artistic nuance. Avoid generic corporate, mechanical, or robotic filler words (e.g. "highly detailed", "photorealistic", "ultra-detailed", "beautiful").
4. Output ONLY the final visual prompt string inside this key. Do not say "Here is your prompt." Go straight into the imagery.

APPROACH FOR "json_prompt" (THE STRUCTURED JSON):
A) FIDELITY: every technical token must survive (film stock, lens, contrast, shadow, grain, focus).
B) MOOD COHERENCE: the overall result must actually FEEL like the chosen genre/mood. Do not bury the atmosphere under a pile of technical tokens. Lead the JSON with the mood/vibe, then specify the technical details that serve it.

MUST-INCLUDE IN BOTH (reproduce these EXACT concepts, verbatim where technical — do not drop, soften, or "fix" them):
${activeTokens.length ? activeTokens.map(t => "- " + t).join("\n") : "- (none specified)"}

RULES FOR "json_prompt":
1. The must-include list is non-negotiable. If "Slightly out of focus" is listed, the image MUST be soft-focus. If "Low contrast / soft" is listed, the tonal range MUST be compressed and low-contrast — state it plainly.
2. Do NOT sanitize deliberate imperfections (out of focus, lifted blacks, grain, harsh flash). They are required features.
3. Film stock: name it verbatim and describe its GRAIN and COLOR character only — do NOT assign it a contrast level. Contrast is controlled solely by the "Contrast & tone" field if present.
4. WARDROBE: the style/genre decides clothing. Dress the subject to fit the genre and scene. Do not feel bound to the reference image's original outfit.
5. If the subject implies a real person, add "instruction": "preserve the exact facial features and likeness of the reference image".
6. Resolve conflicts by honoring BOTH, never by deleting. Genre auto-defaults yield to explicit user picks. Never write a "conflict_resolution" field — silently produce coherent language instead.
7. No quality-filler ("8k, masterpiece, ultra-detailed").
8. PER-ELEMENT TREATMENTS (if an "elements" array is present): this is a compositing request. Each listed element MUST keep its OWN treatment — do NOT unify them into one style. If an element says "Photoreal", that element must be a real photograph (real skin, real materials), NOT illustrated. State explicitly per element. Add a top-level note: "composite distinct media — preserve each element's specified treatment; do not stylistically unify the frame." Lead with this instruction.`;

    const elevatedInstructions = `

ELEVATED CINEMATIC JSON STRUCTURE FOR "json_prompt":
Because "Cinematic Prompt Expansion" is enabled, you MUST output a highly advanced, detailed JSON structure that maximizes the spatial composition, sensory depth, and physical lighting parameters. Organize the "json_prompt" object using these clear keys:
- "scene_composition": A highly detailed descriptive narrative of the scene action. Specify the subject's posture, authentic human micro-details (e.g., skin tension, shoulder angles, direction of gaze), and precise spatial layout of objects.
- "composition_geometry": Arrangement of elements, rule-of-thirds balances, golden ratio focus points, or radial leading vectors.
- "optical_formula": Professional description of lens (e.g., 85mm prime lens), aperture focal planes, physical chromatic aberration, depth profile.
- "lighting_sculpture": Define the physical properties of the illumination: Key/fill/rim light balances (e.g., 3:1 lighting ratio), light falloff slopes, interaction with particles (e.g., morning mist backlighting or microscopic dust scattering).
- "chromatic_grade": Deep rich description of color values: Exact color temps (ambient 5500K daylight with 3200K tungsten accents), specific shadow bias tinting, highlight saturation limits.
- "materiality_and_texture": Micro-scale textures (e.g., silver-halide film grain clusters, watercolor paper tooth, brushed carbon fibre, or micro-fabric pores).
- "emotive_atmosphere": A paragraph describing the emotional subtext, narrative pacing, and psychological atmosphere of the captured frame.
- "negative_influences": Avoid flat digital textures, simplified vectors, auto-sharpening halos, or default 3D renders.`;

    const simpleInstructions = `

STANDARD JSON STRUCTURE FOR "json_prompt":
Because "Cinematic Prompt Expansion" is disabled, output a simpler, streamlined, production-ready JSON structure containing the primary attributes like "subject", "style", "lighting", "camera", "color_grading", "imperfections", etc.`;

    const promptPayload = `${basePrompt}${isSwellVisible ? elevatedInstructions : simpleInstructions}\n\nRecipe:\n${JSON.stringify(recipe, null, 2)}`;

    let attempt = 0;
    const maxAttempts = 3; // 1 initial + 2 retries
    let response: Response | null = null;
    let text = "";
    let data: any = null;
    let fallbackToDirectClient = false;

    try {
      while (attempt < maxAttempts) {
        try {
          response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: promptPayload,
              temperature: 0.7,
              modelName: 'gemini-3.5-flash',
              apiKey: userApiKey
            })
          });

          const status = response.status;
          text = await response.text();

          if (text.trim().toLowerCase().startsWith('<!doctype') || text.trim().toLowerCase().startsWith('<html')) {
            fallbackToDirectClient = true;
            break;
          }

          try {
            data = JSON.parse(text);
          } catch (parseErr) {
            throw new Error("Invalid response format. Failed to parse server response as JSON.");
          }

          const is503Status = status === 503;
          const isOverloadedMessage = data && data.message && (
            data.message.includes("503") ||
            data.message.toLowerCase().includes("high demand") ||
            data.message.toLowerCase().includes("overloaded") ||
            data.message.toLowerCase().includes("currently experiencing high demand")
          );

          if (is503Status || isOverloadedMessage) {
            attempt++;
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1500));
              continue;
            }
          }

          break;
        } catch (errLoop: any) {
          const errMsg = errLoop.message || "";
          const is503Err = errMsg.includes("503") || errMsg.toLowerCase().includes("high demand") || errMsg.toLowerCase().includes("overloaded");
          if (is503Err) {
            attempt++;
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1500));
              continue;
            }
          }
          // On other fetch/network errors (especially direct connection failures or absolute target missing on Netlify), trigger fallback
          fallbackToDirectClient = true;
          break;
        }
      }

      if (fallbackToDirectClient) {
        if (userApiKey && userApiKey.trim() !== '') {
          console.log("Static hosting (Netlify) or backend error detected. Direct client-side Gemini generation routing activated.");
          const directResult = await callGeminiDirectly(userApiKey.trim(), promptPayload);
          data = { status: 'success', text: directResult };
        } else {
          throw new Error("Static Host (Netlify) Detected: This browser-based app is currently hosted on a static server without an active backend. To use 'Enhance with AI' here, please paste your free Google AI Studio API key by clicking '[✨ Enhance with AI]' to configure your browser interface.");
        }
      }

      if (data && data.status === 'success') {
        const txt = (data.text || "").trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        try {
          const parsed = JSON.parse(txt);
          if (parsed && typeof parsed === "object" && "prose_prompt" in parsed && "json_prompt" in parsed) {
            setAiProse(parsed.prose_prompt);
            setOutput(JSON.stringify(parsed.json_prompt, null, 2));
          } else {
            // Fallback if returned object doesn't match keys exactly
            setOutput(JSON.stringify(parsed, null, 2));
            setAiProse(null);
          }
          setOutputTab("prose"); // automatically reveal Breathtaking Prose prompt tab
        } catch {
          setOutput(txt);
          setAiProse(null);
          setOutputTab("json");
        }
      } else {
        setErr((data && data.message) || "An error occurred during Gemini prompt compilation.");
      }
    } catch (e: any) {
      if (e.message && e.message.includes("Static Host")) {
        setErr(e.message);
      } else {
        setErr(`${e.message || "Compilation failed."} Please check that your Gemini API key is valid.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate / Invoke AI Storyboard Visualizer
  const generateStoryboard = async () => {
    setStoryboardLoading(true);
    setErr(null);
    setStoryboardText(null);

    const targetPromptString = output || liveProseText;

    const storyboardPayload = `You are a veteran cinematic director and concept artist. Analyze the following image prompt configuration and visualize the final frame as a structured cinematic storyboard layout guide.

PROMPT BLUEPRINT:
"${targetPromptString}"

JSON RECIPE:
${JSON.stringify(recipe, null, 2)}

Provide your response in an elegant markdown format with the following four clear, beautifully written short paragraphs:
1. 🎬 **Composition Blockout**: Detail the placement of shapes, subjects, and horizons in the frame (Foreground, Midground, and Background vectors).
2. 💡 **Lighting & Shadow Play**: Define key light behavior, auxiliary rays, and shadow hardness gradients.
3. 🎨 **Chromatics & Texture**: Explain color grade dynamics, analog grain distribution, and surface texturing.
4. 🎭 **Atmosphere & Director's Cut**: A deep evocative artistic summary of the scene's emotional tone, pacing, and visual story.

Output direct, vivid paragraphs with no conversational prefaces or postfaces.`;

    try {
      let data: any = null;
      let fallbackToDirectClient = false;
      let response: Response | null = null;
      let text = "";

      try {
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: storyboardPayload,
            temperature: 0.6,
            modelName: 'gemini-3.5-flash',
            apiKey: userApiKey
          })
        });

        text = await response.text();
        if (text.trim().toLowerCase().startsWith('<!doctype') || text.trim().toLowerCase().startsWith('<html')) {
          fallbackToDirectClient = true;
        } else {
          try {
            data = JSON.parse(text);
          } catch (parseErr) {
            throw new Error("Invalid response format. Failed to parse storyboard response as JSON.");
          }
        }
      } catch (errLoop: any) {
        fallbackToDirectClient = true;
      }

      if (fallbackToDirectClient) {
        if (userApiKey && userApiKey.trim() !== '') {
          console.log("Static hosting (Netlify) or backend error detected. Direct client-side storyboard generation routing activated.");
          const directResult = await callGeminiDirectly(userApiKey.trim(), storyboardPayload, undefined, 0.6);
          data = { status: 'success', text: directResult };
        } else {
          throw new Error("Static Host (Netlify) Detected: This browser-based app is currently hosted on a static server without an active backend. To use the 'VISUALIZE' feature here, please paste your free Google AI Studio API key by clicking '[✨ Enhance with AI]' to configure your browser interface.");
        }
      }

      if (data && data.status === 'success') {
        setStoryboardText(data.text || "Directives compile completed.");
        setShowStoryboard(true);
      } else {
        setErr((data && data.message) || "Failed to generate visual storyboard layout.");
      }
    } catch (e: any) {
      if (e.message && e.message.includes("Static Host")) {
        setErr(e.message);
      } else {
        setErr(`${e.message || "Visualizer compile failed."} Please check that your Gemini API key is valid.`);
      }
    } finally {
      setStoryboardLoading(false);
    }
  };

  // Reverse image engineering handler
  const deconstructReferenceImage = async () => {
    if (!deconstructImage) {
      setDeconstructError("Please select or drop an image file first.");
      return;
    }
    setDeconstructLoading(true);
    setDeconstructError(null);
    setDeconstructFeedback(null);

    try {
      let data: any = null;
      let fallbackToDirectClient = false;
      let response: Response | null = null;
      let text = "";

      try {
        response = await fetch('/api/deconstruct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: deconstructImage,
            apiKey: userApiKey
          })
        });

        text = await response.text();
        if (text.trim().toLowerCase().startsWith('<!doctype') || text.trim().toLowerCase().startsWith('<html')) {
          fallbackToDirectClient = true;
        } else {
          try {
            data = JSON.parse(text);
          } catch {
            throw new Error("Invalid response format. Non-JSON response received.");
          }
        }
      } catch (errLoop) {
        fallbackToDirectClient = true;
      }

      if (fallbackToDirectClient) {
        if (userApiKey && userApiKey.trim() !== '') {
          console.log("Static hosting (Netlify) or backend error detected. Direct client-side image deconstruction activated.");
          const directResult = await deconstructDirectly(userApiKey.trim(), deconstructImage, deconstructSystemInstructionClient);
          let parsedDirectResult;
          try {
            parsedDirectResult = JSON.parse(directResult);
          } catch {
            const stripped = directResult.replace(/```json/i, '').replace(/```/g, '').trim();
            parsedDirectResult = JSON.parse(stripped);
          }
          data = { status: 'success', data: parsedDirectResult };
        } else {
          throw new Error("Static Host (Netlify) Detected: Your image reverse-engineering could not be processed because Netlify lacks a server backend. To analyze custom visual references here, please click '[✨ Enhance with AI]' or click the key icon to configure your own free Google AI Studio API Key.");
        }
      }

      if (data && data.status === 'success' && data.data) {
        const payload = data.data.ui_mapping || data.data;
        const detTeardown = data.data.detailed_teardown || null;
        setDetailedTeardown(detTeardown);

        // 1. Update subject text
        let newSubject = subject;
        if (payload.subject) {
          newSubject = payload.subject;
          setSubject(payload.subject);
        }

        // 2. Update technique medium if matched
        let newTechnique = technique;
        if (payload.technique) {
          if (["Photography", "Illustration", "3D", "Mixed media"].includes(payload.technique)) {
            newTechnique = payload.technique;
            setTechnique(payload.technique);
          }
        }

        // 3. Set/align matching taxonomy parameters
        const newSel: Record<string, any> = {};
        if (payload.detected_tokens) {
          const targetSpecificFields = TAX[newTechnique]?.specific || [];
          const allFields = [...targetSpecificFields, ...UNIVERSAL];
          
          allFields.forEach(field => {
            const matchVal = payload.detected_tokens[field.key];
            if (matchVal !== undefined && matchVal !== null) {
              const validOptions: string[] = [];
              Object.values(field.items).forEach(itmArr => {
                validOptions.push(...itmArr);
              });

              if (field.multi) {
                const arr = Array.isArray(matchVal) ? matchVal : [matchVal];
                const cleanArr = arr.filter(v => validOptions.includes(v));
                if (cleanArr.length) {
                  newSel[field.key] = cleanArr;
                }
              } else {
                const singleStr = Array.isArray(matchVal) ? matchVal[0] : matchVal;
                if (validOptions.includes(singleStr)) {
                  newSel[field.key] = singleStr;
                }
              }
            }
          });

          // Replace/Extend selected state with newly detected tokens
          setSel(prev => {
            const updated = {
              ...prev,
              ...newSel
            };
            
            // Build local representation immediately to prevent stale state display lags
            const raw = compileProsePrompt(newTechnique, newSubject, genre, updated);
            setAiProse(raw);

            const activeTks: string[] = [];
            const targetSpecificFieldsInner = TAX[newTechnique]?.specific || [];
            [...targetSpecificFieldsInner, ...UNIVERSAL].forEach(f => {
              const v = updated[f.key];
              if (v === null || v === undefined || (Array.isArray(v) && !v.length)) return;
              (Array.isArray(v) ? v : [v]).forEach(x => activeTks.push(x));
            });

            const simpleJson = {
              technique: newTechnique,
              subject: newSubject || "(Describe your subject above)",
              genre: genre || undefined,
              selected_tokens: activeTks,
              recipe: updated
            };
            setOutput(JSON.stringify(simpleJson, null, 2));
            return updated;
          });

          const matchedCount = Object.keys(newSel).length;
          setDeconstructFeedback(`Successfully decoded visual blueprint! Autofilled subject description and matched ${matchedCount} parameter tokens for ${newTechnique} medium.`);
        } else {
          setDeconstructFeedback(`Successfully decoded visual subject! Medium detected: ${newTechnique}.`);
          const raw = compileProsePrompt(newTechnique, newSubject, genre, sel);
          setAiProse(raw);
          const simpleJson = {
            technique: newTechnique,
            subject: newSubject || "(Describe your subject above)",
            genre: genre || undefined,
            selected_tokens: [],
            recipe: sel
          };
          setOutput(JSON.stringify(simpleJson, null, 2));
        }

        if (detTeardown) {
          setOutputTab("teardown");
        } else {
          setOutputTab("prose");
        }

        // Smoothly scroll to the bottom of the viewport to reveal the compiled target cards
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        }, 150);
      } else {
        setDeconstructError(data.message || "Failed to deconstruct reference image.");
      }
    } catch (e: any) {
      setDeconstructError(e.message || "Deconstruction process failed due to server error.");
    } finally {
      setDeconstructLoading(false);
    }
  };

  // Drag and Drop Image handler utilities
  const handleImageFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setDeconstructError("File must be a valid image format (JPEG, PNG, WebP, etc.).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDeconstructImage(reader.result);
        setDeconstructError(null);
        setDeconstructFeedback(null);
      }
    };
    reader.onerror = () => {
      setDeconstructError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const clearDeconstructImage = () => {
    setDeconstructImage(null);
    setDeconstructError(null);
    setDeconstructFeedback(null);
  };

  // Copy active text tool
  const copyOutput = () => {
    let copyText = "";
    if (outputTab === "prose") {
      copyText = aiProse || liveProseText;
    } else if (outputTab === "json") {
      copyText = output || JSON.stringify(recipe, null, 2);
    } else {
      copyText = activeTokens.join(", ");
    }

    try {
      navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = copyText;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Dedicated always-copy-JSON function
  const copyJsonPrompt = () => {
    const copyText = output || JSON.stringify(recipe, null, 2);
    try {
      navigator.clipboard.writeText(copyText);
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 1550);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = copyText;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 1550);
    }
  };

  // Local Storage Save Draft Vault
  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const titleToUse = saveTitle.trim() || `Draft #${savedVault.length + 1} (${technique})`;
    
    const draft: SavedPrompt = {
      id: Date.now().toString(),
      title: titleToUse,
      timestamp: Date.now(),
      technique,
      subject,
      genre,
      sel,
      elements: technique === "Mixed media" ? [...elements] : undefined
    };

    const updated = [draft, ...savedVault];
    setSavedVault(updated);
    localStorage.setItem("prompt_codex_vault", JSON.stringify(updated));
    setSaveTitle("");
    setShowVault(true); // reveal sidebar vault
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedVault.filter(x => x.id !== id);
    setSavedVault(updated);
    localStorage.setItem("prompt_codex_vault", JSON.stringify(updated));
  };

  const handleLoadDraft = (draft: SavedPrompt) => {
    setTechnique(draft.technique);
    setSubject(draft.subject);
    setGenre(draft.genre);
    setSel(draft.sel);
    setAutofilled({});
    setStoryboardText(null);
    setShowStoryboard(false);
    if (draft.elements) {
      setElements(draft.elements);
    }
  };

  const handleHoverToken = (label: string, tip: string | null) => {
    if (tip) {
      setHoveredTip({ label, tip });
    } else {
      setHoveredTip(null);
    }
  };

  // Theme configuration accents based on active technique
  const getThemeAccentClass = () => {
    if (technique === "Photography") return "text-teal-400 border-teal-500/20";
    if (technique === "Illustration") return "text-rose-455 border-rose-500/20";
    if (technique === "3D") return "text-emerald-400 border-emerald-500/20";
    return "text-indigo-400 border-indigo-500/20";
  };

  const getThemeBgClass = () => {
    if (technique === "Photography") return "bg-teal-500/10 border-teal-500/30 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.12)]";
    if (technique === "Illustration") return "bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.12)]";
    if (technique === "3D") return "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.12)]";
    return "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.12)]";
  };

  return (
    <div className="w-full min-h-screen bg-[#07080d] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(15,23,42,0.65),rgba(7,8,13,1))] text-[#d1d5db] font-sans flex flex-col selection:bg-amber-500/20 selection:text-amber-300 relative overflow-x-hidden overflow-y-auto">
      
      {/* Decorative cyber ambient depth spheres */}
      <div className="absolute top-[15%] left-[-15%] w-[450px] h-[450px] rounded-full bg-teal-500/[0.04] blur-[100px] pointer-events-none cyber-glow-sphere z-0" />
      <div className="absolute bottom-[20%] right-[-15%] w-[550px] h-[550px] rounded-full bg-amber-500/[0.03] blur-[125px] pointer-events-none cyber-glow-sphere z-0" style={{ animationDelay: '4.5s' }} />
      <div className="absolute top-[60%] left-[40%] w-[350px] h-[350px] rounded-full bg-indigo-500/[0.03] blur-[90px] pointer-events-none cyber-glow-sphere z-0" style={{ animationDelay: '2s' }} />

      {/* Dynamic Colored Ambient Glow Ray behind Header */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 ${
        technique === "Photography" ? "bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" :
        technique === "Illustration" ? "bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" :
        technique === "3D" ? "bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" :
        "bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"
      }`} />

      {/* ==========================================
          CREATIVE DASHBOARD NAVIGATION HEADER
         ========================================== */}
      <header className="h-16 border-b border-white/[0.05] flex items-center justify-between px-6 bg-[#0a0c10]/80 backdrop-blur-md sticky top-0 z-45 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className={`relative h-10 w-10 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center overflow-hidden`}>
              <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${
                technique === "Photography" ? "from-teal-400" :
                technique === "Illustration" ? "from-rose-500" :
                technique === "3D" ? "from-emerald-400" : "from-indigo-500"
              } to-transparent`} />
              <Sparkles className={`h-4.5 w-4.5 transition-all duration-300 ${
                technique === "Photography" ? "text-teal-400 animate-pulse" :
                technique === "Illustration" ? "text-rose-400" :
                technique === "3D" ? "text-emerald-400" : "text-indigo-400"
              }`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm tracking-[0.2em] uppercase text-white">
                  PROMPT <span className="font-light text-zinc-400">CODEX</span>
                </span>
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-amber-500 font-bold">
                  STUDIO v6
                </span>
              </div>
              <p className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 font-medium">
                Generative Lens Rig & Aesthetic Pipeline
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar States */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowVault(!showVault)}
            className={`flex items-center space-x-1.5 px-3 py-2 text-[11px] font-mono uppercase rounded-lg border tracking-wider transition-all duration-150 cursor-pointer ${
              showVault 
                ? "bg-amber-400/10 border-amber-400/30 text-amber-400 font-bold" 
                : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            <Bookmark size={12} />
            <span>Vault ({savedVault.length})</span>
          </button>

          {selCount > 0 && (
            <button
              type="button"
              onClick={resetAll}
              className="flex items-center space-x-1.5 px-3 py-2 text-[11px] font-mono uppercase bg-[#181210] hover:bg-[#221612] text-amber-500 font-bold border border-amber-900/40 rounded-lg cursor-pointer transition-all duration-150"
              title="Reset workspace configuration back to default values"
            >
              <RotateCcw size={12} className="text-amber-500" />
              <span>Reset parameters ({selCount})</span>
            </button>
          )}
        </div>
      </header>

      {/* ==========================================
          MAIN AREA: TWO WORKSPACE OVERVIEWS
         ========================================== */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-6 pb-32 flex flex-col space-y-6">
        
        {/* ==========================================
            TOP WORKSPACE PANEL: SUBJECT MATTER DESCRIPTION NODE & THE CHAOS ENGINE
           ========================================== */}
        <div className="bg-[#0b0c11]/80 backdrop-blur-lg border border-white/[0.06] rounded-2xl p-5 shadow-2xl relative overflow-hidden shrink-0">
          {/* Technique Gradient Border Line indicator */}
          <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
            technique === "Photography" ? "bg-teal-500" :
            technique === "Illustration" ? "bg-rose-500" :
            technique === "3D" ? "bg-emerald-500" : "bg-indigo-500"
          }`} />

          <div className="flex flex-col gap-4">
            <div className="flex border-b border-white/[0.04] pb-2 items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className={`text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-mono font-bold border ${getThemeAccentClass()}`}>
                  1
                </span>
                <h3 className="text-xs font-black uppercase tracking-widest text-white font-mono flex items-center gap-2">
                  <Compass size={12} className="text-amber-500 shrink-0" />
                  Subject Matter Node
                </h3>
              </div>

              {/* DUAL MODE BAR */}
              <div className="flex items-center bg-zinc-950/70 p-0.5 border border-white/[0.04] rounded-lg">
                <button
                  type="button"
                  onClick={() => setSubjectTab("prose")}
                  className={`px-3 py-1 text-[9.5px] font-mono uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                    subjectTab === "prose"
                      ? "bg-amber-400/15 border border-amber-400/10 text-amber-450 font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Prose Composer
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectTab("deconstruct")}
                  className={`px-3 py-1 text-[9.5px] font-mono uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    subjectTab === "deconstruct"
                      ? "bg-amber-400/15 border border-amber-400/10 text-amber-450 font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <ImageIcon size={10} />
                  <span>Deconstruct Image</span>
                </button>
              </div>
            </div>

            {subjectTab === "prose" ? (
              <div className="flex flex-row gap-4 items-stretch flex-wrap md:flex-nowrap w-full animate-fadeIn">
                <textarea
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Describe your primary visual focus node (e.g. 'a weathered sea captain staring into the storm, wearing a yellow thermal jacket, looking away from camera...')"
                  className={`flex-1 h-20 p-3.5 bg-zinc-950/60 border border-white/[0.04] rounded-xl text-xs leading-relaxed text-zinc-100 placeholder-zinc-700 focus:ring-2 outline-none resize-none transition-all font-mono ${
                    technique === "Photography" ? "focus:border-teal-500/80 focus:ring-teal-500/10" :
                    technique === "Illustration" ? "focus:border-rose-500/80 focus:ring-rose-500/10" :
                    technique === "3D" ? "focus:border-emerald-500/80 focus:ring-emerald-500/10" :
                    "focus:border-indigo-500/80 focus:ring-indigo-500/10"
                  }`}
                />

                {/* Chaos Engine Button: Highly prominent, premium neon action button */}
                <button
                  type="button"
                  onClick={rollChaosEngine}
                  className="w-full md:w-72 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-500/30 via-orange-600/10 to-transparent border-2 border-amber-400 text-amber-300 hover:text-white rounded-xl transition-all duration-300 cursor-pointer text-center relative overflow-hidden group/chaos select-none shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] active:scale-[0.98]"
                >
                  {/* Visual glow frame */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-400" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-400" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-400" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-400" />

                  <div className="text-[20px] mb-1 group-hover/chaos:rotate-12 transition-transform duration-300">🎲</div>
                  <span className="text-[11px] font-black tracking-widest uppercase font-mono block">
                    Roll Random Aesthetic Blend
                  </span>
                  <p className="text-[8.5px] font-mono text-zinc-400 mt-1 normal-case leading-none">
                    Trigger synchronized visual highlight animation
                  </p>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-1 animate-fadeIn">
                
                {/* IMAGE DROPZONE */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("deconstruct-file-input")?.click()}
                  className="border-2 border-dashed border-white/[0.08] hover:border-amber-500/30 rounded-xl p-5 flex flex-col items-center justify-center bg-zinc-950/45 hover:bg-zinc-950/60 transition-all cursor-pointer min-h-[140px] text-center relative group"
                >
                  <input 
                    id="deconstruct-file-input"
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  
                  {deconstructImage ? (
                    <div className="flex flex-col items-center" onClick={e => e.stopPropagation()}>
                      <img 
                        src={deconstructImage} 
                        alt="Reference Thumb" 
                        className="max-h-24 max-w-full rounded-lg border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)] object-contain mb-3"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={clearDeconstructImage}
                        className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900 border border-red-500/30 rounded text-[9.5px] font-mono text-red-300 font-bold uppercase cursor-pointer select-none transition-all flex items-center gap-1"
                      >
                        <span>✕ Clear Image</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="text-zinc-600 group-hover:text-amber-500 mb-2 transition-colors" />
                      <span className="text-[11.5px] font-mono text-zinc-300 font-bold">
                        Drag & Drop Reference Image Here
                      </span>
                      <p className="text-[9px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">
                        or click to browse local files (JPG, PNG, WebP)
                      </p>
                    </>
                  )}

                  {/* Aesthetic corner accents */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/[0.07] group-hover:border-amber-500/30 transition-colors" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/[0.07] group-hover:border-amber-500/30 transition-colors" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/[0.07] group-hover:border-amber-500/30 transition-colors" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/[0.07] group-hover:border-amber-500/30 transition-colors" />
                </div>

                {/* CONTROL WORKSPACE */}
                <div className="flex flex-col justify-between">
                  <div className="space-y-1.5 text-left">
                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-extrabold flex items-center gap-1.5">
                      <Sparkles size={11} className="text-amber-450 animate-pulse" />
                      <span>Reverse Engineering Multimodal Engine</span>
                    </h4>
                    <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                      Let Gemini read your reference image to rebuild its visual blueprint. It will generate rich subject prose, detect the matching medium, and activate aligned style buttons!
                    </p>
                    
                    {userApiKey ? (
                      <div className="text-[9px] font-mono bg-emerald-950/25 border border-emerald-500/15 rounded px-2.5 py-1 text-emerald-400 flex items-center gap-2 inline-block">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Saved API key is Active</span>
                      </div>
                    ) : (
                      <div className="text-[9px] font-mono bg-amber-950/20 border border-amber-900/40 rounded px-2.5 py-1 text-amber-500 flex items-center gap-2 inline-block">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Using Workspace Server-Side API Credentials</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    {deconstructError && (
                      <div className="p-2.5 bg-red-950/20 border border-red-500/15 rounded-lg text-[10px] font-mono text-red-300 leading-normal flex items-start gap-1.5">
                        <span className="text-sm leading-none shrink-0">⚠️</span>
                        <span className="flex-1">{deconstructError}</span>
                      </div>
                    )}

                    {deconstructFeedback && (
                      <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/15 rounded-lg text-[10px] font-mono text-emerald-300 leading-normal flex items-start gap-2 animate-fadeIn">
                        <span className="text-xs shrink-0">✅</span>
                        <span className="flex-1 font-semibold">{deconstructFeedback}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={deconstructLoading || !deconstructImage}
                      onClick={deconstructReferenceImage}
                      className={`w-full py-2.5 px-4 rounded-xl font-mono text-[10.5px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                        deconstructLoading
                          ? "bg-amber-500/10 border border-amber-500/20 text-zinc-500 cursor-not-allowed"
                          : !deconstructImage
                          ? "bg-zinc-900/50 border border-white/[0.04] text-zinc-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:scale-[1.01] active:opacity-90 shadow-[0_3px_15px_rgba(245,158,11,0.2)] cursor-pointer"
                      }`}
                    >
                      {deconstructLoading ? (
                        <>
                          <RefreshCw size={12} className="animate-spin text-amber-500" />
                          <span className="text-amber-500">DECONSTRUCTING VISUAL PLOTS...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          <span>⚡ Reverse Engineer Image deck</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            MIDDLE SECTION: TWO WORKSPACE OVERVIEWS
           ========================================== */}
        <div className="flex flex-col space-y-6">
          
          {/* AESTHETIC BASE CHANNELS CARD */}
          <section className="flex flex-col space-y-5">
            
            {/* Presets "cookbook" banner - Chef recommendation of ready formulas */}
            <div className="backdrop-blur-md bg-slate-900/15 border border-white/[0.05] rounded-2xl p-4 shadow-xl">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#a1a1aa] font-black mb-3 flex items-center gap-1.5 leading-none">
                <Compass size={12} className="text-amber-400_not_exist hidden" />
                RECOMMENDED CREATIVE COOKBOOKS (1-CLICK LOAD)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {COOKBOOKS.map((cb) => (
                  <button
                    key={cb.id}
                    type="button"
                    onClick={() => loadCookbookPreset(cb)}
                    className="flex flex-col items-start text-left p-3 rounded-xl border border-white/[0.04] bg-zinc-950/40 hover:bg-zinc-900/60 transition-all duration-150 cursor-pointer group text-zinc-300 hover:text-white"
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="text-base">{cb.emoji}</span>
                      <span className="text-[11px] font-black tracking-tight leading-none group-hover:text-amber-450 transition-colors inline-block">{cb.name}</span>
                    </div>
                    <p className="text-[9px] text-zinc-500 leading-tight block line-clamp-2">
                      {cb.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* PARAMETER SELECTION DECK */}
            <div id="parameter-deck" className="bg-[#0b0c11]/80 backdrop-blur-lg border border-white/[0.06] rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col">
              
              {/* Technique Gradient Border Line indicator */}
              <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
                technique === "Photography" ? "bg-teal-500" :
                technique === "Illustration" ? "bg-rose-500" :
                technique === "3D" ? "bg-emerald-500" : "bg-indigo-500"
              }`} />

              {/* Title Block */}
              <div className="flex items-center justify-between mb-5 select-none">
                <div className="flex items-center space-x-2.5">
                  <span className={`text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-mono font-bold border ${getThemeAccentClass()}`}>
                    2
                  </span>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white font-mono">
                    AESTHETIC STYLE CHANNELS
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">/ select medium baseline</span>
                </div>
              </div>

            {/* Technique Switcher Row */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase font-mono block">
                  Aesthetic Medium Technique
                </label>
                <div className="text-[9px] font-mono tracking-wider uppercase bg-white/[0.02] border border-white/5 text-zinc-400 px-2 py-0.5 rounded-md">
                  Active: {technique}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TECHNIQUES.map(t => {
                  const isActive = technique === t;
                  let IconComponent = Camera;
                  let activeAccent = "";
                  
                  if (t === "Illustration") {
                    IconComponent = Palette;
                    activeAccent = "Photography"; // generic fallback representation
                  }
                  if (t === "3D") IconComponent = Box;
                  if (t === "Mixed media") IconComponent = Layers;

                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => changeTechnique(t)}
                      className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                        isActive 
                          ? getThemeBgClass()
                          : "bg-zinc-950/40 border-white/[0.03] text-zinc-400 hover:text-white hover:bg-zinc-900/40 hover:border-white/[0.08]"
                      }`}
                    >
                      {isActive && (
                        <span className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${
                          t === "Photography" ? "bg-teal-400" :
                          t === "Illustration" ? "bg-rose-455" :
                          t === "3D" ? "bg-emerald-400" : "bg-indigo-400"
                        } animate-pulse`} />
                      )}
                      <IconComponent size={18} className={`mb-1.5 transition-colors duration-300 ${
                        isActive 
                          ? (t === "Photography" ? "text-teal-400" :
                             t === "Illustration" ? "text-rose-400" :
                             t === "3D" ? "text-emerald-400" : "text-indigo-400")
                          : "text-zinc-500"
                      }`} />
                      <span className="text-[11px] font-extrabold tracking-wide">{t}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mixed media dynamic elements composite manager */}
            {technique === "Mixed media" && (
              <div className="mb-5 bg-zinc-950/40 border border-indigo-500/20 rounded-xl p-4 shadow-inner">
                <div className="flex items-center justify-between mb-3 border-b border-white/[0.04] pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-1.5">
                    <Layers size={14} className="text-indigo-400" />
                    COMPOSITED LAYER MANAGER
                  </span>
                  <button 
                    type="button"
                    onClick={addElement} 
                    disabled={elements.length >= 5}
                    className="text-[9px] font-mono tracking-wider uppercase bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-white py-1.5 px-3 rounded-lg cursor-pointer transition-colors"
                  >
                    + Add Layer ({elements.length}/5)
                  </button>
                </div>
                
                <div className="space-y-2.5">
                  {elements.map((el, i) => (
                    <div key={el.id} className="flex gap-2 items-center flex-wrap sm:flex-nowrap bg-zinc-900/60 p-2.5 rounded-lg border border-white/5">
                      <div className="w-5.5 h-5.5 flex items-center justify-center rounded-full bg-slate-950 border border-white/10 text-[9px] font-mono font-bold text-indigo-400 shrink-0 select-none">
                        {i + 1}
                      </div>
                      <input 
                        value={el.desc} 
                        onChange={e => updateElement(el.id, { desc: e.target.value })} 
                        placeholder={i === 0 ? "Photoreal main character details" : i === 1 ? "Background flat vector illustration details" : "Specify composited item detail"}
                        className="flex-1 min-w-0 bg-zinc-950 border border-white/[0.06] rounded-lg text-xs px-3 py-1.5 inline-block text-white placeholder-zinc-700 outline-none focus:border-indigo-500 font-mono" 
                      />
                      <select 
                        value={el.treatment} 
                        onChange={e => updateElement(el.id, { treatment: e.target.value })}
                        className="bg-zinc-955 border border-white/10 rounded-lg text-[10px] text-zinc-300 hover:text-white px-2 py-1.5 outline-none cursor-pointer focus:border-indigo-500 font-mono"
                      >
                        {ELEMENT_TREATMENTS.map(t => (
                          <option key={t} value={t} className="bg-zinc-950 text-white">{t}</option>
                        ))}
                      </select>
                      {elements.length > 2 && (
                        <button 
                          type="button"
                          onClick={() => removeElement(el.id)} 
                          className="p-1.5 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-indigo-400/70 mt-2.5 leading-relaxed font-mono">
                  💡 Mixed media directs the compiler to output strict per-element composition rules preventing art styles from collapsing into each other.
                </p>
              </div>
            )}

            {/* Atmospheric Era / Genre Switcher */}
            <div className="border-t border-white/[0.04] pt-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase font-mono flex items-center gap-1.5">
                  <Compass size={12} className="text-amber-500 shrink-0" />
                  Creative Period Atmospheric Era / Genre
                </span>
                <button 
                  type="button"
                  onClick={() => setGenreOpen(!genreOpen)} 
                  className="text-[10px] font-mono uppercase font-bold text-amber-500 hover:text-amber-400 border border-amber-900/40 rounded-lg px-2.5 py-1 bg-amber-500/5 transition-colors cursor-pointer flex items-center gap-1"
                >
                  {genreOpen ? "− Collapse Catalogue" : "🎭 Browse Period Catalog"}
                </button>
              </div>

              {!genreOpen ? (
                <div className="flex flex-wrap gap-3 items-center justify-start w-full py-3">
                  <button
                    type="button"
                    onClick={() => setGenre(null)}
                    className={`px-3 py-2 text-[11px] font-bold rounded-lg border tracking-wide transition-all duration-150 cursor-pointer ${
                      !genre 
                        ? "bg-amber-400/10 border-amber-400/30 text-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.1)]" 
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Custom Baseline
                  </button>
                  {GENRES["Popular"].map(g => (
                    <Chip 
                      key={g} 
                      label={g} 
                      active={genre === g} 
                      onClick={() => pickGenre(g)} 
                      colorTheme={technique}
                      fieldKey="Atmospheric Genre"
                      onHover={(hov) => {
                        handleHoverToken(g, hov ? TIPS[g] || "Pre-programmed creative style atmospheric backdrop." : null);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-auto min-h-fit transition-all duration-300 space-y-4 bg-zinc-950/80 p-3.5 rounded-xl border border-white/[0.05] pr-1">
                  <div className="flex justify-between items-center bg-zinc-900/80 p-2 rounded-lg border border-white/[0.03]">
                    <span className="text-[9.5px] font-bold text-zinc-400 font-mono tracking-widest uppercase">Select Atmosphere Defaults</span>
                    <button 
                      type="button"
                      onClick={() => { setGenre(null); setSel({}); setAutofilled({}); }}
                      className="px-2 py-1 rounded bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-[8.5px] font-mono uppercase font-black text-red-400 cursor-pointer"
                    >
                      Reset Genre Vectors
                    </button>
                  </div>
                  
                  {Object.entries(GENRES).map(([cat, items]) => (
                    <div key={cat} className="space-y-1.5" id={`genre-cat-${cat}`}>
                      <div className="text-[9px] font-mono tracking-widest text-[#a1a1aa] uppercase font-black">
                        {cat}
                      </div>
                      <div className="flex flex-wrap gap-3 items-center justify-start w-full py-3">
                        {items.map(g => (
                          <Chip 
                            key={g} 
                            label={g} 
                            active={genre === g} 
                            onClick={() => pickGenre(g)} 
                            colorTheme={technique}
                            fieldKey="Atmospheric Genre"
                            onHover={(hov) => {
                              handleHoverToken(g, hov ? TIPS[g] || "Preset creative style era." : null);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

          {/* COMPREHENSIVE OPTICAL & STYLE RIG PANEL */}
          <section className="flex flex-col space-y-5">
            <div className="bg-[#0b0c11]/80 backdrop-blur-lg border border-white/[0.06] rounded-2xl p-5 shadow-2xl flex flex-col justify-between relative">
              {/* Technique Gradient line */}
              <div className={`absolute top-0 left-0 right-0 h-[2.5px] transition-all duration-300 ${
                technique === "Photography" ? "bg-teal-500/30" :
                technique === "Illustration" ? "bg-rose-500/30" :
                technique === "3D" ? "bg-emerald-500/30" : "bg-indigo-500/30"
              }`} />
              
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.04]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1.5 leading-none">
                    <Sliders size={12} className="text-amber-500 shrink-0" />
                    COMPREHENSIVE OPTICAL & STYLE RIG
                  </span>
                  <span className="text-[9.5px] font-mono text-zinc-500">all taxonomy filters deck</span>
                </div>

                <div className="w-full h-auto min-h-fit transition-all duration-300 space-y-5 pr-2">

                  {/* SPECIFIC FIELDS LIST (Lenses, Apertures, Mediums depending on technique selection) */}
                  <div className="space-y-2">
                    <h4 className="text-[9.5px] font-mono uppercase tracking-widest text-zinc-405 font-bold flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-amber-405" />
                      {technique} Specific Parameters
                    </h4>
                    <div className="space-y-1.5">
                      {specificFields.map(f => (
                        <div key={f.key} className="relative">
                          {autofilled[f.key] && (
                            <div className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-mono font-bold text-amber-400 tracking-wider uppercase pointer-events-none select-none z-10 animate-pulse">
                              AUTO-FILLED BY GENRE
                            </div>
                          )}
                    <Field 
                      field={f} 
                      selected={sel[f.key]} 
                      onToggle={toggle} 
                      colorTheme={technique}
                      onHoverToken={handleHoverToken} 
                    />
                  </div>
                ))}
              </div>
            </div>

                  {/* UNIVERSAL REFINEMENT KEY PROPERTIES (Lighting, Color grade, Camera Angle) */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[9.5px] font-mono uppercase tracking-widest text-zinc-405 font-bold flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-amber-405" />
                      Primary Aesthetic Refinements
                    </h4>
                    <div className="space-y-1.5">
                      {refineUniversal.map(f => (
                        <div key={f.key} className="relative">
                          {autofilled[f.key] && (
                            <div className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-mono font-bold text-amber-400 tracking-wider uppercase pointer-events-none select-none z-10 animate-pulse">
                              AUTO-FILLED BY GENRE
                            </div>
                          )}
                          <Field 
                            field={f} 
                            selected={sel[f.key]} 
                            onToggle={toggle} 
                            colorTheme={technique}
                            onHoverToken={handleHoverToken} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADVANCED DEEP VECTOR PARAMETERS (Shadows, Contrast, Focus Blur, composition metrics) */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[9.5px] font-mono uppercase tracking-widest text-zinc-405 font-bold flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-amber-405" />
                      Deep Layout & Optical Settings
                    </h4>
                    <div className="space-y-1.5">
                      {fullUniversal.map(f => (
                        <div key={f.key} className="relative">
                          {autofilled[f.key] && (
                            <div className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-mono font-bold text-amber-400 tracking-wider uppercase pointer-events-none select-none z-10 animate-pulse">
                              AUTO-FILLED BY GENRE
                            </div>
                          )}
                          <Field 
                            field={f} 
                            selected={sel[f.key]} 
                            onToggle={toggle} 
                            colorTheme={technique}
                            onHoverToken={handleHoverToken} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>


            </div>
          </section>
        </div>
      </main>

      {/* =========================================================================
          STICKY PROMPT CANVAS CONSOLE HUD (Bottom Sticky)
         ========================================================================= */}
      <div className="sticky bottom-0 left-0 right-0 z-50 bg-[#090a0f]/95 backdrop-blur-md border-t border-white/[0.08] shadow-[0_-12px_40px_rgba(0,0,0,0.85)] transition-all">
        {/* TOP GOLD GRADIENT LINE */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        
        {/* DYNAMIC FLOATING AESTHETIC DEFINITION RIBBON */}
        <AnimatePresence>
          {hoveredTip && (
            <motion.div 
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full right-6 mb-3 bg-[#0d0e15]/95 border border-amber-500/30 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-[0_-10px_35px_rgba(0,0,0,0.9)] max-w-sm text-left select-none pointer-events-none z-55 mr-4"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-extrabold block">
                  Aesthetic Definition • {hoveredTip.label}
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-350 leading-normal">
                {hoveredTip.tip}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="w-full max-w-7xl mx-auto px-6 py-3 flex flex-col gap-3">
          {/* COMPACT HUD LINE (Minimal Height Profile) */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* LEFT SIDE: Live Prompt Prose */}
            <div className="flex items-center space-x-3 flex-1 min-w-0 w-full md:w-auto">
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold tracking-wider uppercase shrink-0">
                PROMPT HUD
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-mono text-zinc-100 truncate pr-4 leading-normal select-text">
                  {aiProse || liveProseText}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE: HUD Core Action Controls */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto justify-end">
              {/* Save Draft Form */}
              <form onSubmit={handleSaveDraft} className="hidden sm:flex items-center gap-1.5 bg-zinc-950/60 p-1 border border-white/[0.04] rounded-lg">
                <input
                  type="text"
                  value={saveTitle}
                  onChange={e => setSaveTitle(e.target.value)}
                  placeholder="Save title..."
                  className="bg-transparent text-[10.5px] py-1 px-2.5 outline-none text-zinc-100 placeholder-zinc-700 font-mono w-24"
                />
                <button
                  type="submit"
                  className="bg-amber-550/15 hover:bg-amber-550 border border-amber-500/20 hover:text-black font-extrabold text-[9.5px] font-mono uppercase px-2.5 py-1.5 rounded-md flex items-center gap-1 cursor-pointer select-none transition-all text-amber-400"
                >
                  <Save size={10} />
                  <span>Save</span>
                </button>
              </form>

              {/* Copy Prompt Button */}
              <button
                type="button"
                onClick={copyOutput}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10.5px] tracking-wider font-mono uppercase px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-[0_2px_10px_rgba(245,158,11,0.15)] hover:shadow-[0_2px_15px_rgba(245,158,11,0.35)] transition-all shrink-0 font-bold"
              >
                {copied ? (
                  <>
                    <Check size={11} className="text-black select-none animate-bounce" />
                    <span className="text-black font-black">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} className="shrink-0 text-black" />
                    <span className="font-black">Copy Prompt</span>
                  </>
                )}
              </button>

              {/* Local Assemble Raw Prompt Button */}
              <button
                type="button"
                onClick={assembleRawPrompt}
                className="bg-white/[0.03] hover:bg-white/[0.08] hover:text-white border border-white/[0.06] text-zinc-350 px-3 py-2 text-[10.5px] font-mono uppercase font-black tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                title="Stitch together selected active parameters and subject text into a complete raw prompt instantly on the client."
              >
                Assemble Raw Prompt
              </button>

              {/* Compile Gemini Button */}
              <button
                type="button"
                onClick={() => {
                  setApiKeyError(null);
                  setShowApiKeyModal(true);
                }}
                disabled={loading}
                title="Processes your selected parameter tokens and subject text using Gemini AI to synthesize a seamless, production-ready cinematic narrative prompt."
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 disabled:from-zinc-850 disabled:to-zinc-850 text-black font-extrabold text-[10.5px] tracking-widest uppercase font-mono flex items-center justify-center space-x-1.5 select-none disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-[0_2px_10px_rgba(245,158,11,0.15)] animate-pulse hover:animate-none shrink-0"
              >
                {loading ? (
                  <>
                    <RefreshCw size={11} className="animate-spin text-black" />
                    <span>BAKING ({elapsed.toFixed(1)}s)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={11} className="text-black" />
                    <span>✨ Enhance with AI</span>
                  </>
                )}
              </button>

              {/* Visualize Button */}
              <button
                type="button"
                onClick={generateStoryboard}
                disabled={storyboardLoading}
                className="px-3 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-white/[0.08] text-white hover:text-amber-400 font-extrabold text-[10.5px] tracking-widest uppercase font-mono flex items-center justify-center space-x-1.5 select-none disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {storyboardLoading ? (
                  <RefreshCw size={11} className="animate-spin text-amber-500" />
                ) : (
                  <Eye size={11} className="text-zinc-400" />
                )}
                <span className="hidden sm:inline">VISUALIZE</span>
              </button>

              {/* Drawer Console expander */}
              <button
                type="button"
                onClick={() => setIsSwellVisible(!isSwellVisible)}
                className={`px-2.5 py-2 text-[10.5px] font-mono uppercase tracking-wider rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  isSwellVisible
                    ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                    : "bg-transparent border-white/[0.04] text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>{isSwellVisible ? "▼ HIDE SWELL" : "▲ SHOW SWELL"}</span>
              </button>
            </div>

          </div>

          {/* COLLAPSIBLE EXTENDED REACTOR PANEL */}
          <AnimatePresence>
            {isSwellVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-white/[0.04] mt-1 pt-3"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch py-2">
                  {/* Left side info / local prose */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                    <div className="bg-gradient-to-br from-[#0c0d15] to-[#131522] border border-white/[0.04] rounded-xl p-4 relative shadow-inner overflow-hidden flex flex-col justify-between h-full min-h-[140px]">
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-amber-500/30" />
                      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-amber-500/30" />
                      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-amber-500/30" />
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-amber-500/30" />

                      <div>
                        <div className="flex items-center justify-between mb-1 select-none">
                          <h4 className="text-[9.5px] font-mono uppercase tracking-widest text-[#a1a1aa] font-black flex items-center gap-1">
                            <Terminal size={10} className="text-amber-500 animate-pulse" />
                            Live Local Prose (Pre-API Build)
                          </h4>
                          <span className="text-[9px] font-mono text-zinc-500">{selCount} active options</span>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-300 leading-relaxed max-h-[80px] overflow-y-auto select-text">
                          {liveProseText}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right side detailed code view tabs */}
                  <div className="lg:col-span-7 flex flex-col bg-zinc-950 border border-white/[0.06] rounded-xl p-3.5 shadow-inner">
                    <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 mb-3 select-none">
                      <div className="flex space-x-1.5 overflow-x-auto scrollbar-none">
                        {(["prose", "json", "tags", ...(detailedTeardown ? ["teardown" as const] : [])] as const).map(tab => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setOutputTab(tab)}
                            className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider rounded transition-all shrink-0 cursor-pointer ${
                              outputTab === tab
                                ? tab === "teardown"
                                  ? "bg-amber-400/20 border border-amber-400/40 text-amber-300 font-extrabold animate-pulse"
                                  : "bg-amber-400/10 border border-amber-400/20 text-amber-400 font-bold"
                                : tab === "teardown"
                                ? "bg-amber-950/20 border border-amber-550/10 text-amber-500/80 hover:text-amber-400 font-semibold"
                                : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {tab === "prose" ? "PROSE PHRASE" : tab === "json" ? "JSON STRUCT" : tab === "tags" ? "TOKEN VECTOR" : "✨ DEEP TEARDOWN"}
                          </button>
                        ))}
                      </div>
                      <div className="flex space-x-1.5">
                        <button
                          type="button"
                          onClick={copyJsonPrompt}
                          className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/15 rounded text-[9px] font-mono uppercase text-amber-400 flex items-center space-x-1 cursor-pointer transition-all"
                        >
                          <span>JSON Copy</span>
                        </button>
                      </div>
                    </div>

                    <div className={`relative overflow-auto min-h-[100px] transition-all duration-300 ${outputTab === "teardown" ? "max-h-[380px]" : "max-h-[120px]"}`}>
                      {err && (
                        <div className="p-2.5 bg-red-950/20 border border-red-500/20 text-red-500 rounded text-[10.5px] font-mono mb-2">
                          <strong>CRITICAL COMPILE LOG:</strong> {err}
                        </div>
                      )}
                      {outputTab === "prose" && (
                        <div className="text-[11.5px] leading-relaxed text-zinc-200 select-text font-mono">
                          {aiProse || liveProseText}
                        </div>
                      )}
                      {outputTab === "json" && (
                        <div className="text-[10.5px] leading-relaxed text-zinc-300 select-text font-mono whitespace-pre overflow-x-auto">
                          {output ? renderSyntaxColoredJson(output) : "// Compile with Gemini AI to generate structured schema definitions"}
                        </div>
                      )}
                      {outputTab === "tags" && (
                        <div className="flex flex-wrap gap-1">
                          {activeTokens.map((tok, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-zinc-900 border border-white/[0.04] rounded text-[10px] font-mono text-amber-400">{tok}</span>
                          ))}
                        </div>
                      )}
                      {outputTab === "teardown" && detailedTeardown && (
                        <div className="space-y-4 text-xs font-mono text-zinc-300 leading-normal select-text pr-1">
                          {/* Metadata Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-900/50 p-2.5 rounded border border-white/[0.03]">
                            <div>
                              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Style Genre:</span>
                              <span className="text-zinc-100 font-semibold">{detailedTeardown.metadata?.style || "Unspecified"}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Atmospheric Mood:</span>
                              <span className="text-zinc-100 font-semibold">{detailedTeardown.metadata?.mood || "Unspecified"}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Aspect Ratio:</span>
                              <span className="text-zinc-100">{detailedTeardown.metadata?.aspect_ratio || "Unspecified"}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Rendering Technique:</span>
                              <span className="text-zinc-100">{detailedTeardown.composition?.technique_used || "Unspecified"}</span>
                            </div>
                          </div>

                          {/* Color Palette Panel */}
                          <div className="bg-zinc-900/50 p-2.5 rounded border border-white/[0.03] space-y-2">
                            <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-bold">Dynamic Color Palette:</span>
                            <div className="flex flex-wrap items-center gap-3">
                              {/* Dominant Colors */}
                              <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded">
                                <span className="text-[9.5px] text-zinc-400">Dominant:</span>
                                {Array.isArray(detailedTeardown.color_palette?.dominant_colors_hex) && detailedTeardown.color_palette.dominant_colors_hex.map((hex: string, i: number) => (
                                  <div key={i} className="flex items-center gap-1" title={hex}>
                                    <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: hex }} />
                                    <span className="text-[10px] text-zinc-300">{hex}</span>
                                  </div>
                                ))}
                              </div>
                              {/* Accent Colors */}
                              <div className="flex items-center gap-1.5 bg-black/45 px-2 py-1 rounded">
                                <span className="text-[9.5px] text-zinc-400">Accents:</span>
                                {Array.isArray(detailedTeardown.color_palette?.accent_colors_hex) && detailedTeardown.color_palette.accent_colors_hex.map((hex: string, i: number) => (
                                  <div key={i} className="flex items-center gap-1" title={hex}>
                                    <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: hex }} />
                                    <span className="text-[10px] text-amber-400">{hex}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {detailedTeardown.color_palette?.gradients && (
                              <p className="text-[10px] text-zinc-400 italic">Gradients: {detailedTeardown.color_palette.gradients}</p>
                            )}
                          </div>

                          {/* Technical & Optical Blueprint */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-zinc-900/40 p-2 rounded border border-white/[0.02] space-y-1">
                              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-bold">Lighting Formulation:</span>
                              <div className="text-[11px] text-zinc-200">
                                <p><strong className="text-amber-500">Source:</strong> {detailedTeardown.lighting?.type}</p>
                                <p><strong className="text-zinc-400">Shadows:</strong> {detailedTeardown.lighting?.shadows}</p>
                                <p><strong className="text-zinc-400">Ambient Reflections:</strong> {detailedTeardown.lighting?.ambient_light}</p>
                              </div>
                            </div>
                            <div className="bg-zinc-900/40 p-2 rounded border border-white/[0.02] space-y-1">
                              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-bold">Compositional Optics:</span>
                              <div className="text-[11px] text-zinc-200">
                                <p className="truncate"><strong className="text-amber-500">Angle:</strong> {detailedTeardown.camera_details?.angle || detailedTeardown.composition?.technique_used}</p>
                                <p><strong className="text-zinc-400">Aperture Style:</strong> {detailedTeardown.camera_details?.aperture_effect}</p>
                                <p className="truncate"><strong className="text-zinc-400">Depth Layers:</strong> {detailedTeardown.composition?.depth_layers}</p>
                              </div>
                            </div>
                          </div>

                          {/* Detailed Subjects */}
                          {Array.isArray(detailedTeardown.subjects) && detailedTeardown.subjects.length > 0 && (
                            <div className="bg-zinc-900/40 p-2.5 rounded border border-white/[0.02] space-y-1">
                              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-bold">Delineated Subjects:</span>
                              {detailedTeardown.subjects.map((sub: any, i: number) => (
                                <div key={i} className="text-[11px] text-zinc-200 border-l border-amber-500/30 pl-2 leading-relaxed mb-1.5">
                                  <strong className="text-amber-400">{sub.type || "Element"}:</strong> {sub.description} <span className="text-zinc-500 text-[9.5px]">({sub.position_in_frame})</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Background Details */}
                          {detailedTeardown.background_details && (
                            <div className="bg-zinc-900/40 p-2.5 rounded border border-white/[0.02] space-y-0.5">
                              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-bold">Environment & BG Details:</span>
                              <p className="text-[11px]"><strong>Environment Style:</strong> {detailedTeardown.background_details.environment_type}</p>
                              {detailedTeardown.background_details.text_elements_present && (
                                <p className="text-[11px]"><strong>Typography/text detected:</strong> <span className="text-emerald-400 font-bold">{detailedTeardown.background_details.text_elements_present}</span></p>
                              )}
                            </div>
                          )}

                          {/* Micro details list */}
                          {Array.isArray(detailedTeardown.micro_details) && (
                            <div className="bg-zinc-900/30 p-2.5 rounded space-y-1 text-zinc-400">
                              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Microscopic Attributes:</span>
                              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                {detailedTeardown.micro_details.map((mic: string, idx: number) => (
                                  <li key={idx}>{mic}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Suggested Prompts for Generator Blueprints */}
                          {detailedTeardown.suggested_ai_prompts && (
                            <div className="space-y-2 pt-2 border-t border-white/5">
                              <span className="text-zinc-500 block text-[9.5px] uppercase font-bold text-amber-400 tracking-widest">Multi-Model Target Copyable Blueprints:</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {detailedTeardown.suggested_ai_prompts.midjourney_prompt && (
                                  <div className="bg-zinc-900 p-2 rounded border border-white/5 flex flex-col justify-between">
                                    <div>
                                      <span className="text-[9.5px] text-zinc-400 font-extrabold uppercase tracking-wider">Midjourney v6 Blueprint:</span>
                                      <p className="text-[10px] text-zinc-300 leading-relaxed select-text italic mt-1 mb-2">{detailedTeardown.suggested_ai_prompts.midjourney_prompt}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(detailedTeardown.suggested_ai_prompts.midjourney_prompt);
                                      }}
                                      className="text-[9.5px] w-full self-start hover:text-white py-1 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer text-center"
                                    >
                                      Copy Prompt
                                    </button>
                                  </div>
                                )}
                                {detailedTeardown.suggested_ai_prompts.dalle_prompt && (
                                  <div className="bg-zinc-900 p-2 rounded border border-white/5 flex flex-col justify-between">
                                    <div>
                                      <span className="text-[9.5px] text-zinc-400 font-extrabold uppercase tracking-wider">DALL-E 3 Precision Blueprint:</span>
                                      <p className="text-[10px] text-zinc-300 leading-relaxed select-text italic mt-1 mb-2">{detailedTeardown.suggested_ai_prompts.dalle_prompt}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(detailedTeardown.suggested_ai_prompts.dalle_prompt);
                                      }}
                                      className="text-[9.5px] w-full self-start hover:text-white py-1 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer text-center"
                                    >
                                      Copy Prompt
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STORYBOARD DIRECTIVE INSIDE THE HUD OR STICKY */}
          <AnimatePresence>
            {showStoryboard && storyboardText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-amber-500/10 bg-[#0d0f17] rounded-xl overflow-hidden shadow-inner flex flex-col p-3 gap-2 mt-1"
              >
                <div className="flex items-center justify-between select-none">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1">
                    <Eye size={11} /> STORYBOARD INTERPRETATION
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setShowStoryboard(false)}
                    className="text-[9px] font-mono text-zinc-500 hover:text-white"
                  >
                    [×] Close
                  </button>
                </div>
                <div className="text-[11px] text-zinc-300 leading-relaxed font-mono space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {storyboardText.split("\n\n").map((chunk, index) => (
                    <p key={index} className="whitespace-pre-wrap">{chunk}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ==========================================
          SAVED DRAFTS SLIDE-DRAWER SYSTEM (VAULT)
         ========================================== */}
      <AnimatePresence>
        {showVault && (
          <>
            {/* Backdrop cover overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVault(false)}
              className="fixed inset-0 bg-black z-40"
            />
            
            {/* Right sidebar drawer */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[440px] bg-[#0c0e14] border-l border-white/[0.08] z-50 p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4.5 mb-5 select-none">
                <div className="flex items-center space-x-2.5">
                  <Bookmark className="text-amber-400" size={17} />
                  <div>
                    <h3 className="text-white font-extrabold text-[12px] uppercase font-mono tracking-widest">
                      THE SAVED DRAFT VAULT
                    </h3>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase leading-none mt-0.5">
                      Persistent session formulations library
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVault(false)}
                  className="text-zinc-500 hover:text-white font-mono text-xs uppercase cursor-pointer"
                >
                  Close [×]
                </button>
              </div>

              {/* Vault body list */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {savedVault.length > 0 ? (
                  savedVault.map((item) => {
                    const countItems = Object.keys(item.sel).length;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          handleLoadDraft(item);
                          setShowVault(false);
                        }}
                        className="p-4 bg-zinc-950/80 hover:bg-zinc-900 border border-white/[0.04] hover:border-amber-500/20 rounded-2xl cursor-pointer group transition-all duration-150 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-black uppercase text-amber-400/80 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                            {item.technique}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500 select-none">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <h4 className="text-xs font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1 mb-1.5 pr-6">
                          {item.title}
                        </h4>
                        
                        <p className="text-[11px] text-zinc-400 font-mono line-clamp-2 leading-relaxed mb-3">
                          {item.subject || "No primary focus description node."}
                        </p>

                        <div className="flex items-center justify-between border-t border-white/[0.04] pt-2">
                          <div className="text-[9.5px] font-mono text-zinc-500">
                            Tags: <strong className="text-zinc-300">{countItems}</strong>
                            {item.genre && <> | Genre: <strong className="text-zinc-300">{item.genre}</strong></>}
                          </div>
                          
                          <button
                            type="button"
                            onClick={(e) => handleDeleteDraft(item.id, e)}
                            className="p-1 text-zinc-650 hover:text-red-400 rounded transition-colors cursor-pointer shrink-0"
                            title="Delete draft from local cabinet"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                    <FolderOpen size={40} className="text-zinc-800 mb-4 animate-pulse" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 font-mono mb-1 select-none">
                      VAULT CABINET EMPTY
                    </h4>
                    <p className="text-[10.5px] font-mono max-w-[240px]">
                      Title your prompt and click &quot;Save to Vault&quot; in the compiler workspace to keep record of your configurations.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.08] select-none text-center">
                <p className="text-[9.5px] font-mono text-zinc-500">
                  Total formulations stored locally: <span className="text-amber-450 font-bold">{savedVault.length}</span>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Google AI Studio API Key Modal Overlay */}
      <AnimatePresence>
        {showApiKeyModal && (
          <>
            {/* Backdrop cover overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApiKeyModal(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[100]"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:max-w-md mx-auto bg-[#0a0c12] border border-white/[0.08] rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-[101] flex flex-col space-y-4 font-sans text-zinc-100 animate-none"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="text-amber-400 shrink-0" size={17} />
                  <h3 className="text-white font-extrabold text-[12px] uppercase font-mono tracking-widest leading-none">
                    Enhance this prompt with Gemini
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="text-zinc-500 hover:text-white font-mono text-[10px] uppercase cursor-pointer"
                >
                  [×] Close
                </button>
              </div>

              {/* Description */}
              <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                Weave your layout tokens into a seamless cinematic narrative. Paste your free Google AI Studio API key below to process.
              </p>

              {/* Secure Input Area */}
              <div className="space-y-1.5 font-mono">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">
                  Google AI Studio API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={userApiKey}
                    onChange={(e) => {
                      setUserApiKey(e.target.value);
                      setApiKeyError(null);
                    }}
                    placeholder="AIzaSy..."
                    className="w-full bg-zinc-950/80 border border-white/[0.08] focus:border-amber-450/40 rounded-xl px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-750 outline-none transition-all"
                  />
                </div>
                {apiKeyError && (
                  <p className="text-[10px] text-red-400 font-mono italic animate-pulse">
                    ⚠ {apiKeyError}
                  </p>
                )}
              </div>

              {/* Get Key Hyperlink */}
              <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between pointer-events-auto">
                <span>No key yet?</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer flex items-center gap-1 transition-all"
                >
                  Get a free key here <span className="text-[8px]">↗</span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-white/[0.08] text-zinc-400 hover:text-white font-bold text-[10.5px] font-mono uppercase tracking-wider cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!userApiKey.trim()) {
                      setApiKeyError("ApiKey cannot be empty. Please enter your API key.");
                      return;
                    }
                    try {
                      localStorage.setItem("user_gemini_api_key", userApiKey.trim());
                    } catch (e) {
                      console.error(e);
                    }
                    setShowApiKeyModal(false);
                    await generate(userApiKey.trim());
                  }}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-[10.5px] font-mono uppercase tracking-widest cursor-pointer shadow-[0_2px_10px_rgba(245,158,11,0.15)] hover:shadow-[0_2px_15px_rgba(245,158,11,0.35)] transition-all font-bold"
                >
                  Apply AI Enhancement
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
