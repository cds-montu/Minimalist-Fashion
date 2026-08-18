import { getAllTitles as getDynamicTitles } from 'services/productsStore';
import { delay } from 'core/utils/delay';
import { httpGet } from 'services/http/client';
import { readArray, writeJSON } from 'core/utils/storage';

const RECENT_KEY = 'recent-searches';

function getAllTitles() { return getDynamicTitles(); }

export function getRecentSearches(limit = 6) {
  return readArray(RECENT_KEY).slice(0, limit);
}

export function saveRecentSearch(q) {
  if (!q) return;
  const existing = getRecentSearches(20).filter((x) => String(x).toLowerCase() !== q.toLowerCase());
  writeJSON(RECENT_KEY, [q, ...existing].slice(0, 20));
}

export async function fetchSearchSuggestions(q, limit = 8) {
  try {
    const res = await httpGet('/search', { params: { q, limit } });
    const titles = getAllTitles();
    return { suggestions: res.suggestions || [], popular: titles.slice(0, 6) };
  } catch (e) {
    // fallback
    await delay(150);
    const lower = (q || '').toLowerCase().trim();
    const titles = getAllTitles();
    if (!lower) {
      return { suggestions: getRecentSearches(limit), popular: titles.slice(0, 6) };
    }
    const starts = titles.filter((t) => t.toLowerCase().startsWith(lower));
    const includes = titles.filter((t) => t.toLowerCase().includes(lower) && !starts.includes(t));
    const suggestions = [...starts, ...includes].slice(0, limit);
    return { suggestions, popular: titles.slice(0, 6) };
  }
}
