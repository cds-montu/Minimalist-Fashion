import getProductImageDefault, {
  getProductImage,
  getGalleryImages,
  getProductImageCandidates,
  onImgErrorSwap,
} from 'core/utils/imageForProduct';

describe('getProductImageCandidates', () => {
  it('derives keywords from the category', () => {
    const [primary] = getProductImageCandidates({ id: 7, category: 'Electronics' });
    expect(primary).toBe(
      `https://loremflickr.com/seed/7-0/600/600/${encodeURIComponent('electronics,tech,device,gadget')}`
    );
  });

  it('refines keywords from the title and description', () => {
    const [primary] = getProductImageCandidates({ id: 1, category: 'Fashion', title: 'Leather Jacket' });
    expect(decodeURIComponent(primary.split('/').pop())).toBe('fashion,clothing,apparel,style');

    const [shoes] = getProductImageCandidates({ id: 2, title: 'Running Sneaker', description: 'comfy shoe' });
    expect(decodeURIComponent(shoes.split('/').pop())).toBe('shoes');
  });

  it('limits keywords to four unique entries', () => {
    const [primary] = getProductImageCandidates({
      id: 3,
      category: 'Home',
      title: 'Sofa Chair Table Lamp Bed',
    });
    const keywords = decodeURIComponent(primary.split('/').pop()).split(',');
    expect(keywords).toHaveLength(4);
    expect(new Set(keywords).size).toBe(4);
  });

  it('falls back to the generic "product" keyword', () => {
    const [primary] = getProductImageCandidates({ id: 4 });
    expect(decodeURIComponent(primary.split('/').pop())).toBe('product');
  });

  it('uses "x" as the seed when the product has no id', () => {
    const [primary] = getProductImageCandidates(undefined, { index: 2 });
    expect(primary).toContain('/seed/x-2/');
  });

  it('honours width, height and index options', () => {
    const [primary] = getProductImageCandidates({ id: 5 }, { w: 100, h: 200, index: 3 });
    expect(primary).toContain('/seed/5-3/100/200/');
  });

  it('provides picsum and placeholder fallbacks', () => {
    const candidates = getProductImageCandidates({ id: 6 }, { w: 300, h: 400 });
    expect(candidates.slice(1)).toEqual([
      'https://picsum.photos/seed/6-0/300/400',
      'https://picsum.photos/300/400',
      'https://placehold.co/300x400?text=Image',
    ]);
  });

  it('puts an uploaded image first when present', () => {
    const candidates = getProductImageCandidates({ id: 6, image: 'data:image/png;base64,AAA' });
    expect(candidates[0]).toBe('data:image/png;base64,AAA');
    expect(candidates).toHaveLength(5);
  });
});

describe('getProductImage', () => {
  it('returns the first candidate', () => {
    const product = { id: 9, category: 'Beauty' };
    expect(getProductImage(product)).toBe(getProductImageCandidates(product)[0]);
  });

  it('prefers the uploaded image', () => {
    expect(getProductImage({ id: 9, image: 'https://cdn.test/a.png' })).toBe('https://cdn.test/a.png');
  });

  it('is also exported as the default export', () => {
    expect(getProductImageDefault).toBe(getProductImage);
  });
});

describe('getGalleryImages', () => {
  it('returns one distinct url per index', () => {
    const urls = getGalleryImages({ id: 11, category: 'Sports' });
    expect(urls).toHaveLength(5);
    expect(new Set(urls).size).toBe(5);
    expect(urls[0]).toContain('/seed/11-0/800/600/');
    expect(urls[4]).toContain('/seed/11-4/800/600/');
  });

  it('supports a custom count and size', () => {
    const urls = getGalleryImages({ id: 12 }, 2, { w: 50, h: 60 });
    expect(urls).toHaveLength(2);
    expect(urls[1]).toContain('/seed/12-1/50/60/');
  });
});

describe('onImgErrorSwap', () => {
  const product = { id: 20, category: 'Home' };

  it('swaps to the next candidate and tracks the position', () => {
    const el = { dataset: {}, src: '' };
    const candidates = getProductImageCandidates(product);

    onImgErrorSwap({ currentTarget: el }, product);
    expect(el.src).toBe(candidates[1]);
    expect(el.dataset.fallbackIdx).toBe('1');

    onImgErrorSwap({ currentTarget: el }, product);
    expect(el.src).toBe(candidates[2]);
    expect(el.dataset.fallbackIdx).toBe('2');
  });

  it('stops once the last candidate is reached', () => {
    const candidates = getProductImageCandidates(product);
    const el = { dataset: { fallbackIdx: String(candidates.length - 1) }, src: 'last' };

    onImgErrorSwap({ currentTarget: el }, product);
    expect(el.src).toBe('last');
    expect(el.dataset.fallbackIdx).toBe(String(candidates.length - 1));
  });

  it('ignores events without a target', () => {
    expect(() => onImgErrorSwap(undefined, product)).not.toThrow();
    expect(() => onImgErrorSwap({}, product)).not.toThrow();
  });
});
