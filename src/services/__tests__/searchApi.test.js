import { getAllTitles } from 'services/productsStore';
import { httpGet } from 'services/http/client';
import { getRecentSearches, saveRecentSearch, fetchSearchSuggestions } from 'services/searchApi';

jest.mock('services/productsStore', () => ({ getAllTitles: jest.fn() }));
jest.mock('services/http/client', () => ({ httpGet: jest.fn() }));

const RECENT_KEY = 'recent-searches';

const titles = [
  'Blue Shirt',
  'Blue Sofa',
  'Red Shirt',
  'Green Lamp',
  'Yellow Bag',
  'Black Boot',
  'White Watch',
];

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  getAllTitles.mockReturnValue(titles);
});

describe('getRecentSearches', () => {
  it('returns an empty list when nothing is stored', () => {
    expect(getRecentSearches()).toEqual([]);
  });

  it('limits the number of results', () => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(['a', 'b', 'c']));
    expect(getRecentSearches(2)).toEqual(['a', 'b']);
    expect(getRecentSearches()).toEqual(['a', 'b', 'c']);
  });

  it('ignores corrupt or non-array values', () => {
    localStorage.setItem(RECENT_KEY, 'not json');
    expect(getRecentSearches()).toEqual([]);
    localStorage.setItem(RECENT_KEY, '{"a":1}');
    expect(getRecentSearches()).toEqual([]);
  });
});

describe('saveRecentSearch', () => {
  it('stores the newest query first', () => {
    saveRecentSearch('shirt');
    saveRecentSearch('sofa');
    expect(JSON.parse(localStorage.getItem(RECENT_KEY))).toEqual(['sofa', 'shirt']);
  });

  it('de-duplicates case-insensitively', () => {
    saveRecentSearch('Shirt');
    saveRecentSearch('bag');
    saveRecentSearch('shirt');
    expect(JSON.parse(localStorage.getItem(RECENT_KEY))).toEqual(['shirt', 'bag']);
  });

  it('caps the history at 20 entries', () => {
    for (let i = 0; i < 25; i += 1) saveRecentSearch(`q${i}`);
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY));
    expect(stored).toHaveLength(20);
    expect(stored[0]).toBe('q24');
  });

  it('ignores empty queries', () => {
    saveRecentSearch('');
    saveRecentSearch(undefined);
    expect(localStorage.getItem(RECENT_KEY)).toBeNull();
  });
});

describe('fetchSearchSuggestions', () => {
  it('uses the API response when the request succeeds', async () => {
    httpGet.mockResolvedValue({ suggestions: ['from-api'] });

    const res = await fetchSearchSuggestions('shi', 3);

    expect(httpGet).toHaveBeenCalledWith('/search', { params: { q: 'shi', limit: 3 } });
    expect(res).toEqual({ suggestions: ['from-api'], popular: titles.slice(0, 6) });
  });

  it('defaults to an empty suggestion list when the API omits it', async () => {
    httpGet.mockResolvedValue({});
    await expect(fetchSearchSuggestions('shi')).resolves.toMatchObject({ suggestions: [] });
  });

  it('falls back to local prefix matches before substring matches', async () => {
    httpGet.mockRejectedValue(new Error('offline'));

    const res = await fetchSearchSuggestions('blue');
    expect(res.suggestions).toEqual(['Blue Shirt', 'Blue Sofa']);

    const shirt = await fetchSearchSuggestions('shirt');
    expect(shirt.suggestions).toEqual(['Blue Shirt', 'Red Shirt']);
  });

  it('respects the limit in the fallback path', async () => {
    httpGet.mockRejectedValue(new Error('offline'));
    const res = await fetchSearchSuggestions('  BLUE  ', 1);
    expect(res.suggestions).toEqual(['Blue Shirt']);
  });

  it('returns recent searches for an empty query in the fallback path', async () => {
    httpGet.mockRejectedValue(new Error('offline'));
    saveRecentSearch('sofa');

    const res = await fetchSearchSuggestions('');
    expect(res).toEqual({ suggestions: ['sofa'], popular: titles.slice(0, 6) });
  });
});
