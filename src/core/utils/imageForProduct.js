// Utility: map a product's category/title/description to a deterministic, relevant image URL.
// We use loremflickr with a seed for stability per product and category/topic keywords for relevance.
// Example output: https://loremflickr.com/seed/12-0/600/600/electronics,laptop,tech

function norm(str = '') {
  return String(str).toLowerCase();
}

function pickKeywords(product = {}) {
  const { category = '', title = '', description = '' } = product;
  const text = `${category} ${title} ${description}`.toLowerCase();

  // Base by category
  const byCategory = {
    electronics: ['electronics', 'tech', 'device', 'gadget'],
    fashion: ['fashion', 'clothing', 'apparel', 'style'],
    home: ['home', 'furniture', 'interior', 'decor'],
    sports: ['sports', 'fitness', 'outdoor', 'gear'],
    beauty: ['beauty', 'cosmetics', 'skincare', 'makeup'],
  };

  const catKey = norm(category).split(' ')[0];
  let kw = byCategory[catKey] ? [...byCategory[catKey]] : [];

  // Keyword refinement from title/description
  const map = [
    { match: /(laptop|notebook|macbook)/, add: ['laptop'] },
    { match: /(phone|smartphone|iphone|android)/, add: ['smartphone'] },
    { match: /(headphone|earbud|earphone)/, add: ['headphones'] },
    { match: /(camera|dslr|mirrorless)/, add: ['camera'] },
    { match: /(watch|smartwatch)/, add: ['watch'] },

    { match: /(jacket|coat|parka)/, add: ['jacket'] },
    { match: /(shoe|sneaker|boot)/, add: ['shoes'] },
    { match: /(dress|skirt)/, add: ['dress'] },
    { match: /(shirt|t\-?shirt|tee)/, add: ['shirt'] },
    { match: /(bag|handbag|backpack)/, add: ['bag'] },

    { match: /(sofa|couch)/, add: ['sofa'] },
    { match: /(chair|armchair)/, add: ['chair'] },
    { match: /(table|desk)/, add: ['table'] },
    { match: /(lamp|lighting)/, add: ['lamp'] },
    { match: /(bed|mattress)/, add: ['bedroom'] },

    { match: /(ball|football|soccer|basketball)/, add: ['ball'] },
    { match: /(racket|racquet|tennis|badminton)/, add: ['racket'] },
    { match: /(bicycle|bike)/, add: ['bicycle'] },
    { match: /(yoga|mat)/, add: ['yoga'] },
    { match: /(hiking|camp|tent)/, add: ['hiking'] },

    { match: /(skincare|skin)/, add: ['skincare'] },
    { match: /(makeup|lipstick|eyeshadow)/, add: ['makeup'] },
    { match: /(perfume|fragrance)/, add: ['perfume'] },
    { match: /(hair|shampoo|conditioner)/, add: ['hair'] },
    { match: /(nail|manicure)/, add: ['nails'] },
  ];

  for (const m of map) {
    if (m.match.test(text)) kw.push(...m.add);
  }

  // Fallbacks
  if (kw.length === 0) kw.push('product');

  // Deduplicate and limit
  kw = Array.from(new Set(kw)).slice(0, 4);
  return kw;
}

export function getProductImage(product, { w = 600, h = 600, index = 0 } = {}) {
  // Prefer uploaded images if present (indexed), then primary image, then fallbacks
  if (product && Array.isArray(product.images) && product.images.length) {
    const img = product.images[index] ?? product.images[0];
    if (img) return img;
  }
  if (product && product.image) return product.image;
  const candidates = getProductImageCandidates(product, { w, h, index });
  return candidates[0];
}

export function getGalleryImages(product, count = 5, { w = 800, h = 600 } = {}) {
  // If product has uploaded images array, use it directly (up to max count)
  if (product && Array.isArray(product.images) && product.images.length) {
    return product.images.slice(0, count);
  }
  // Else synthesize a gallery from seeded fallbacks
  return Array.from({ length: count }).map((_, i) => getProductImage(product, { w, h, index: i }));
}

export default getProductImage;

// Build multiple candidate image URLs for robust fallbacks
export function getProductImageCandidates(product, { w = 600, h = 600, index = 0 } = {}) {
  const keywords = pickKeywords(product);
  const seed = `${product?.id ?? 'x'}-${index}`;
  const path = encodeURIComponent(keywords.join(','));
  const candidates = [
    // Primary: loremflickr with seed + tags (description/category-aware)
    `https://loremflickr.com/seed/${seed}/${w}/${h}/${path}`,
    // Fallback 1: picsum with stable seed (not category-aware but stable)
    `https://picsum.photos/seed/${seed}/${w}/${h}`,
    // Fallback 2: generic picsum
    `https://picsum.photos/${w}/${h}`,
    // Fallback 3: plain placeholder
    `https://placehold.co/${w}x${h}?text=Image`,
  ];
  // Prepend uploaded specific index image if available, then primary image
  if (product) {
    if (Array.isArray(product.images) && product.images.length) {
      const indexed = product.images[index];
      const primary = product.image || product.images[0];
      if (indexed) candidates.unshift(indexed);
      if (primary && primary !== indexed) candidates.unshift(primary);
    } else if (product.image) {
      candidates.unshift(product.image);
    }
  }
  return candidates;
}

// onError handler to swap to next candidate URL when current image fails
export function onImgErrorSwap(e, product, { w = 600, h = 600, index = 0 } = {}) {
  try {
    const el = e?.currentTarget;
    if (!el) return;
    const urls = getProductImageCandidates(product, { w, h, index });
    const pos = Number(el.dataset.fallbackIdx || '0');
    if (pos >= urls.length - 1) return; // no more fallbacks
    const next = urls[pos + 1];
    el.dataset.fallbackIdx = String(pos + 1);
    el.src = next;
  } catch {
    // swallow
  }
}
