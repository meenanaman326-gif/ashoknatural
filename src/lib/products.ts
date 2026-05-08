import turmeric from "@/assets/product-turmeric.jpg";
import cardamom from "@/assets/product-cardamom.jpg";
import chili from "@/assets/product-chili.jpg";
import pepper from "@/assets/product-pepper.jpg";
import cinnamon from "@/assets/product-cinnamon.jpg";
import cumin from "@/assets/product-cumin.jpg";
import garam from "@/assets/product-garam.jpg";
import honey from "@/assets/product-honey.jpg";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "Whole Spices" | "Ground Spices" | "Spice Blends" | "Natural Foods";
  shortDescription: string;
  description: string;
  ingredients: string;
  usage: string;
  image: string;
  weights: { label: string; price: number; mrp: number }[];
  rating: number;
  reviews: number;
  inStock: boolean;
  badges?: string[];
  bestseller?: boolean;
};

export const products: Product[] = [
  {
    id: "p1",
    slug: "premium-turmeric-powder",
    name: "Premium Turmeric Powder",
    category: "Ground Spices",
    shortDescription: "Stone-ground from Erode turmeric — high curcumin, naturally golden.",
    description:
      "Hand-picked Erode turmeric, sun-cured and stone-ground in small batches to preserve its natural curcumin. Vibrant golden color, earthy aroma, and a clean finish — the soul of every Indian kitchen.",
    ingredients: "100% Pure Turmeric (Curcuma longa). No fillers, no colors, no preservatives.",
    usage:
      "Use 1/4 tsp in dals, curries and sabzis. Add to warm milk with a pinch of pepper for golden milk. Excellent in skin-care face packs.",
    image: turmeric,
    weights: [
      { label: "100g", price: 99, mrp: 130 },
      { label: "250g", price: 219, mrp: 280 },
      { label: "500g", price: 399, mrp: 520 },
    ],
    rating: 4.8,
    reviews: 1240,
    inStock: true,
    badges: ["Bestseller", "High Curcumin"],
    bestseller: true,
  },
  {
    id: "p2",
    slug: "green-cardamom-pods",
    name: "Green Cardamom Pods",
    category: "Whole Spices",
    shortDescription: "Plump 8mm Idukki cardamom — intensely aromatic, naturally sweet.",
    description:
      "Sourced directly from small farms in the Idukki hills of Kerala. Bold green pods, plump seeds, and a sweet floral aroma that elevates teas, biryanis and desserts.",
    ingredients: "100% Whole Green Cardamom (Elettaria cardamomum).",
    usage: "Crush 2 pods into chai, biryani, kheer or coffee. Store in an airtight jar away from light.",
    image: cardamom,
    weights: [
      { label: "50g", price: 249, mrp: 320 },
      { label: "100g", price: 469, mrp: 600 },
      { label: "250g", price: 1099, mrp: 1399 },
    ],
    rating: 4.9,
    reviews: 612,
    inStock: true,
    badges: ["Premium", "Single Origin"],
    bestseller: true,
  },
  {
    id: "p3",
    slug: "kashmiri-red-chili-powder",
    name: "Kashmiri Red Chili Powder",
    category: "Ground Spices",
    shortDescription: "Bright red color, mild heat — the chef's secret.",
    description:
      "Sun-dried Kashmiri chilies, stone-ground to a fine powder. Famous for its deep crimson color and gentle heat — perfect for tandoori marinades, curries and rogan josh.",
    ingredients: "100% Kashmiri Red Chili (Capsicum annuum).",
    usage: "Use 1 tsp for color, 2 tsp for mild heat. Bloom in hot oil for richer flavor.",
    image: chili,
    weights: [
      { label: "100g", price: 119, mrp: 160 },
      { label: "250g", price: 269, mrp: 340 },
      { label: "500g", price: 499, mrp: 640 },
    ],
    rating: 4.7,
    reviews: 880,
    inStock: true,
    badges: ["Mild Heat"],
    bestseller: true,
  },
  {
    id: "p4",
    slug: "tellicherry-black-pepper",
    name: "Tellicherry Black Pepper",
    category: "Whole Spices",
    shortDescription: "TGSEB grade — bold, fruity, the king of spices.",
    description:
      "Tellicherry Garbled Special Extra Bold (TGSEB) — only the largest, ripest peppercorns from Malabar make the cut. Complex aroma with citrus and pine notes.",
    ingredients: "100% Whole Black Peppercorns (Piper nigrum).",
    usage: "Crack fresh over salads, pasta, eggs, and steaks. Whole pods for stocks and pickles.",
    image: pepper,
    weights: [
      { label: "100g", price: 199, mrp: 260 },
      { label: "250g", price: 449, mrp: 580 },
    ],
    rating: 4.9,
    reviews: 540,
    inStock: true,
    badges: ["TGSEB Grade"],
  },
  {
    id: "p5",
    slug: "ceylon-cinnamon-sticks",
    name: "Ceylon Cinnamon Sticks",
    category: "Whole Spices",
    shortDescription: "True cinnamon — delicate, sweet, low in coumarin.",
    description:
      "Real Ceylon cinnamon (not cassia) — paper-thin, multi-layered quills with a delicate, sweet flavor. Loved by bakers, baristas and Ayurveda practitioners alike.",
    ingredients: "100% Ceylon Cinnamon (Cinnamomum verum).",
    usage: "Simmer in chai, mulled wine, or porridge. Grind fresh for baking.",
    image: cinnamon,
    weights: [
      { label: "50g", price: 179, mrp: 230 },
      { label: "100g", price: 329, mrp: 420 },
    ],
    rating: 4.8,
    reviews: 312,
    inStock: true,
    badges: ["True Ceylon"],
  },
  {
    id: "p6",
    slug: "jeera-cumin-seeds",
    name: "Jeera (Cumin Seeds)",
    category: "Whole Spices",
    shortDescription: "Sun-dried Gujarat jeera — warm, nutty, aromatic.",
    description:
      "Plump golden cumin seeds from the farms of Unjha, Gujarat. Cleaned three times for the brightest aroma and a clean, nutty taste.",
    ingredients: "100% Whole Cumin Seeds (Cuminum cyminum).",
    usage: "Temper in ghee for dals, raitas and rice. Dry-roast and grind for chaat masala.",
    image: cumin,
    weights: [
      { label: "100g", price: 89, mrp: 120 },
      { label: "250g", price: 199, mrp: 260 },
      { label: "500g", price: 369, mrp: 480 },
    ],
    rating: 4.7,
    reviews: 705,
    inStock: true,
  },
  {
    id: "p7",
    slug: "royal-garam-masala",
    name: "Royal Garam Masala",
    category: "Spice Blends",
    shortDescription: "13-spice heirloom blend — warming, complex, never bitter.",
    description:
      "Our signature blend of 13 whole spices — slow-roasted and stone-ground in small batches. Built on a 4-generation family recipe from old Lucknow.",
    ingredients:
      "Coriander, Cumin, Black Pepper, Cardamom, Cloves, Cinnamon, Bay Leaf, Nutmeg, Mace, Fennel, Star Anise, Black Cumin, Rose Petals.",
    usage: "Add 1/2 tsp at the end of cooking for curries, biryanis and kebabs.",
    image: garam,
    weights: [
      { label: "100g", price: 249, mrp: 320 },
      { label: "200g", price: 469, mrp: 600 },
    ],
    rating: 4.9,
    reviews: 1023,
    inStock: true,
    badges: ["Signature Blend"],
    bestseller: true,
  },
  {
    id: "p8",
    slug: "raw-forest-honey",
    name: "Raw Forest Honey",
    category: "Natural Foods",
    shortDescription: "Wild-harvested, unprocessed multifloral honey.",
    description:
      "Ethically harvested from the forests of the Western Ghats by tribal beekeepers. Unfiltered, unheated and unpasteurized — exactly as nature made it.",
    ingredients: "100% Raw Multifloral Honey.",
    usage: "A spoon a day in warm water, on toast, or in tea (let it cool first).",
    image: honey,
    weights: [
      { label: "250g", price: 349, mrp: 450 },
      { label: "500g", price: 649, mrp: 850 },
      { label: "1kg", price: 1199, mrp: 1500 },
    ],
    rating: 4.8,
    reviews: 478,
    inStock: true,
    badges: ["Wild Harvested"],
  },
];

export const categories = [
  { name: "Whole Spices", image: pepper, count: products.filter(p => p.category === "Whole Spices").length },
  { name: "Ground Spices", image: turmeric, count: products.filter(p => p.category === "Ground Spices").length },
  { name: "Spice Blends", image: garam, count: products.filter(p => p.category === "Spice Blends").length },
  { name: "Natural Foods", image: honey, count: products.filter(p => p.category === "Natural Foods").length },
];

export const getProduct = (slug: string) => products.find(p => p.slug === slug);
export const bestsellers = () => products.filter(p => p.bestseller);
export const related = (id: string, cat: string) =>
  products.filter(p => p.id !== id && p.category === cat).slice(0, 4);
