import { getAllProducts, getFacets } from 'services/productsStore';
import { fetchProducts, fetchFacets } from 'services/productsApi';

jest.mock('services/productsStore', () => ({
  getAllProducts: jest.fn(),
  getFacets: jest.fn(),
}));

const product = (overrides) => ({
  id: 1,
  title: 'Item',
  price: 50,
  rating: 3,
  category: 'Fashion',
  brand: 'Levis',
  ...overrides,
});

const catalog = [
  product({ id: 1, title: 'Blue Shirt', price: 20, rating: 5, category: 'Fashion', brand: 'Levis' }),
  product({ id: 2, title: 'Blue Sofa', price: 80, rating: 2, category: 'Home', brand: 'Dior' }),
  product({ id: 3, title: 'Red Shirt', price: 50, rating: 4, category: 'Fashion', brand: 'Dior' }),
  product({ id: 4, title: 'Green Lamp', price: 150, rating: 1, category: 'Home', brand: 'Levis' }),
];

beforeEach(() => {
  getAllProducts.mockReturnValue(catalog);
  getFacets.mockReturnValue({ categories: ['Fashion'] });
});

describe('fetchProducts', () => {
  it('returns products within the default price range', async () => {
    const res = await fetchProducts({});
    expect(res.items.map((p) => p.id)).toEqual([1, 2, 3]);
    expect(res).toMatchObject({ total: 3, totalPages: 1 });
  });

  it('matches the query against the title, case-insensitively', async () => {
    const res = await fetchProducts({ q: 'SHIRT' });
    expect(res.items.map((p) => p.id)).toEqual([1, 3]);
  });

  it('filters by category, brand, price and rating', async () => {
    expect((await fetchProducts({ filters: { categories: ['Home'] } })).items.map((p) => p.id)).toEqual([2]);
    expect((await fetchProducts({ filters: { brands: ['Dior'] } })).items.map((p) => p.id)).toEqual([2, 3]);
    expect((await fetchProducts({ filters: { price: [30, 200] } })).items.map((p) => p.id)).toEqual([2, 3, 4]);
    expect((await fetchProducts({ filters: { rating: [4] } })).items.map((p) => p.id)).toEqual([1, 3]);
  });

  it('treats multiple rating thresholds as a minimum match', async () => {
    const res = await fetchProducts({ filters: { rating: [2, 5] } });
    expect(res.items.map((p) => p.id)).toEqual([1, 2, 3]);
  });

  it('combines filters', async () => {
    const res = await fetchProducts({ q: 'shirt', filters: { brands: ['Dior'], rating: [4] } });
    expect(res.items.map((p) => p.id)).toEqual([3]);
  });

  it('sorts by price and rating', async () => {
    expect((await fetchProducts({ sort: 'priceAsc' })).items.map((p) => p.id)).toEqual([1, 3, 2]);
    expect((await fetchProducts({ sort: 'priceDesc' })).items.map((p) => p.id)).toEqual([2, 3, 1]);
    expect((await fetchProducts({ sort: 'rating' })).items.map((p) => p.id)).toEqual([1, 3, 2]);
  });

  it('keeps the store order for the default sort', async () => {
    expect((await fetchProducts({ sort: 'relevance' })).items.map((p) => p.id)).toEqual([1, 2, 3]);
  });

  it('paginates', async () => {
    const first = await fetchProducts({ pageSize: 2 });
    expect(first.items.map((p) => p.id)).toEqual([1, 2]);
    expect(first).toMatchObject({ total: 3, totalPages: 2 });

    const second = await fetchProducts({ pageSize: 2, page: 2 });
    expect(second.items.map((p) => p.id)).toEqual([3]);
  });

  it('reports one page when nothing matches', async () => {
    const res = await fetchProducts({ q: 'nothing' });
    expect(res).toEqual({ items: [], total: 0, totalPages: 1 });
  });

  it('does not mutate the store order while sorting', async () => {
    await fetchProducts({ sort: 'priceDesc' });
    expect(catalog.map((p) => p.id)).toEqual([1, 2, 3, 4]);
  });
});

describe('fetchFacets', () => {
  it('proxies the store facets', async () => {
    await expect(fetchFacets()).resolves.toEqual({ categories: ['Fashion'] });
    expect(getFacets).toHaveBeenCalled();
  });
});
