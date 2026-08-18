import baseProducts, { facets as staticFacets } from 'shared/data/products';
import {
  getAllProducts,
  upsertProduct,
  removeProduct,
  replaceAllCustomProducts,
  getFacets,
  getAllTitles,
  getRecycleBinItems,
  restoreProduct,
  emptyRecycleBin,
} from 'services/productsStore';

const LS_KEY = 'products:custom';
const LS_DELETED_KEY = 'products:deleted';
const LS_TRASH_KEY = 'products:trash';

const baseCount = baseProducts.length;
const firstBase = baseProducts[0];

beforeEach(() => {
  localStorage.clear();
});

describe('getAllProducts', () => {
  it('returns the base catalog when nothing is customized', () => {
    expect(getAllProducts()).toHaveLength(baseCount);
  });

  it('lists custom products before base products', () => {
    localStorage.setItem(LS_KEY, JSON.stringify([{ id: 1000, title: 'Custom' }]));
    const all = getAllProducts();
    expect(all[0]).toMatchObject({ id: 1000, title: 'Custom' });
    expect(all).toHaveLength(baseCount + 1);
  });

  it('lets a custom product override a base product with the same id', () => {
    localStorage.setItem(LS_KEY, JSON.stringify([{ id: firstBase.id, title: 'Overridden' }]));
    const all = getAllProducts();
    expect(all).toHaveLength(baseCount);
    expect(all.filter((p) => String(p.id) === String(firstBase.id))).toEqual([
      { id: firstBase.id, title: 'Overridden' },
    ]);
  });

  it('hides tombstoned products', () => {
    localStorage.setItem(LS_DELETED_KEY, JSON.stringify([firstBase.id]));
    const all = getAllProducts();
    expect(all).toHaveLength(baseCount - 1);
    expect(all.some((p) => String(p.id) === String(firstBase.id))).toBe(false);
  });

  it('ignores corrupt storage values', () => {
    localStorage.setItem(LS_KEY, 'not json');
    localStorage.setItem(LS_DELETED_KEY, '{"a":1}');
    expect(getAllProducts()).toHaveLength(baseCount);
  });
});

describe('upsertProduct', () => {
  it('creates a product with a generated id', () => {
    const created = upsertProduct({ title: 'New' });
    expect(created.id).toEqual(expect.any(Number));
    expect(JSON.parse(localStorage.getItem(LS_KEY))).toEqual([created]);
  });

  it('updates an existing custom product in place', () => {
    upsertProduct({ id: 7, title: 'First' });
    upsertProduct({ id: 8, title: 'Second' });
    const updated = upsertProduct({ id: 7, title: 'First updated' });

    const stored = JSON.parse(localStorage.getItem(LS_KEY));
    expect(stored).toHaveLength(2);
    expect(stored.find((p) => p.id === 7)).toEqual(updated);
    expect(stored[1].id).toBe(7);
  });

  it('dispatches a products:updated event', () => {
    const listener = jest.fn();
    window.addEventListener('products:updated', listener);
    upsertProduct({ title: 'Eventful' });
    window.removeEventListener('products:updated', listener);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('removeProduct', () => {
  it('moves a custom product to the trash', () => {
    const created = upsertProduct({ id: 500, title: 'Temp' });
    removeProduct(created.id);

    expect(JSON.parse(localStorage.getItem(LS_KEY))).toEqual([]);
    const trash = JSON.parse(localStorage.getItem(LS_TRASH_KEY));
    expect(trash).toHaveLength(1);
    expect(trash[0]).toMatchObject({ id: 500, title: 'Temp' });
    expect(trash[0]._deletedAt).toEqual(expect.any(Number));
  });

  it('tombstones a base product', () => {
    removeProduct(firstBase.id);
    expect(JSON.parse(localStorage.getItem(LS_DELETED_KEY))).toEqual([String(firstBase.id)]);
  });

  it('does not duplicate an existing tombstone but still notifies', () => {
    removeProduct(firstBase.id);
    const listener = jest.fn();
    window.addEventListener('products:updated', listener);
    removeProduct(firstBase.id);
    window.removeEventListener('products:updated', listener);

    expect(JSON.parse(localStorage.getItem(LS_DELETED_KEY))).toEqual([String(firstBase.id)]);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('replaceAllCustomProducts', () => {
  it('overwrites the custom list', () => {
    upsertProduct({ id: 1, title: 'Old' });
    replaceAllCustomProducts([{ id: 2, title: 'Fresh' }]);
    expect(JSON.parse(localStorage.getItem(LS_KEY))).toEqual([{ id: 2, title: 'Fresh' }]);
  });

  it('clears the list when called without arguments', () => {
    upsertProduct({ id: 1, title: 'Old' });
    replaceAllCustomProducts();
    expect(JSON.parse(localStorage.getItem(LS_KEY))).toEqual([]);
  });
});

describe('getFacets / getAllTitles', () => {
  it('returns the static facets', () => {
    expect(getFacets()).toBe(staticFacets);
  });

  it('returns the titles of all visible products', () => {
    upsertProduct({ id: 900, title: 'Custom Title' });
    const titles = getAllTitles();
    expect(titles[0]).toBe('Custom Title');
    expect(titles).toHaveLength(baseCount + 1);
  });
});

describe('recycle bin', () => {
  it('lists trashed custom products and tombstoned base products', () => {
    upsertProduct({ id: 600, title: 'Trashable' });
    removeProduct(600);
    removeProduct(firstBase.id);

    const items = getRecycleBinItems();
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ id: 600 });
    expect(items[1]).toMatchObject({ id: firstBase.id, _tombstone: true, _deletedAt: null });
  });

  it('restores a trashed custom product', () => {
    upsertProduct({ id: 601, title: 'Restorable' });
    removeProduct(601);

    expect(restoreProduct(601)).toEqual({ restored: 'custom', item: expect.objectContaining({ id: 601 }) });
    expect(JSON.parse(localStorage.getItem(LS_KEY))[0]).toMatchObject({ id: 601 });
    expect(JSON.parse(localStorage.getItem(LS_TRASH_KEY))).toEqual([]);
  });

  it('restores a tombstoned base product', () => {
    removeProduct(firstBase.id);
    expect(restoreProduct(String(firstBase.id))).toEqual({ restored: 'base', id: String(firstBase.id) });
    expect(getAllProducts()).toHaveLength(baseCount);
  });

  it('reports nothing to restore for unknown ids', () => {
    expect(restoreProduct('missing')).toEqual({ restored: false });
  });

  it('empties the trash without touching tombstones', () => {
    upsertProduct({ id: 602, title: 'Trashable' });
    removeProduct(602);
    removeProduct(firstBase.id);

    emptyRecycleBin();

    expect(JSON.parse(localStorage.getItem(LS_TRASH_KEY))).toEqual([]);
    expect(getRecycleBinItems()).toHaveLength(1);
  });
});
