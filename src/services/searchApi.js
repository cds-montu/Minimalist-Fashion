import { getAllTitles as getDynamicTitles } from 'services/productsStore';
import { delay } from 'core/utils/delay';
import { httpGet } from 'services/http/client';
import { logWarning, readJSON, writeJSON } from 'core/utils/storage';

const RECENT_KEY = 'recent-searches';

function getAllTitles() { return getDynamicTitles(); }

export function getRecentSearches(limit = 6) {
  const arr = readJSON(RECENT_KEY, []);
  return Array.isArray(arr) ? arr.slice(0, limit) : [];
}

export function saveRecentSearch(q) {
  if (!q) return;
  const arr = getRecentSearches(20);
  const existing = arr.filter((x) => x.toLowerCase() !== q.toLowerCase());
  const updated = [q, ...existing].slice(0, 20);
  try {
    writeJSON(RECENT_KEY, updated);
  } catch (error) {
    // Search history is a convenience: never block navigating to results.
    logWarning('searchApi:saveRecentSearch', error);
  }
}

export async function fetchSearchSuggestions(q, limit = 8) {
  try {
    const res = await httpGet('/search', { params: { q, limit } });
    const titles = getAllTitles();
    return { suggestions: res.suggestions || [], popular: titles.slice(0, 6) };
  } catch (error) {
    // The search endpoint is optional; fall back to local titles but log why.
    logWarning('searchApi:fetchSearchSuggestions', error);
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
