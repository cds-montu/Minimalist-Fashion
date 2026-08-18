import {
  getAllUsers,
  upsertUser,
  removeUser,
  toggleUserStatus,
  bulkRemoveUsers,
  setUsersStatus,
  queryUsers,
} from 'services/usersStore';

const STORAGE_KEY = 'admin:users';

beforeEach(() => {
  localStorage.clear();
});

describe('getAllUsers', () => {
  it('seeds 24 users on first read and persists them', () => {
    const users = getAllUsers();
    expect(users).toHaveLength(24);
    expect(users[0]).toMatchObject({ id: 1, name: 'User 1', email: 'user1@example.com', role: 'admin' });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(24);
  });

  it('marks every seventh seeded user inactive', () => {
    const users = getAllUsers();
    expect(users.filter((u) => u.status === 'inactive').map((u) => u.id)).toEqual([1, 8, 15, 22]);
  });

  it('reads existing users from storage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 99, name: 'Zoe' }]));
    expect(getAllUsers()).toEqual([{ id: 99, name: 'Zoe' }]);
  });

  it('re-seeds when the stored value is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{oops');
    expect(getAllUsers()).toHaveLength(24);
  });
});

describe('upsertUser', () => {
  it('prepends a new user with a generated id', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 1, name: 'Old' }]));
    const next = upsertUser({ name: 'New', email: 'new@example.com' });

    expect(next).toHaveLength(2);
    expect(next[0]).toMatchObject({ name: 'New' });
    expect(next[0].id).toEqual(expect.any(Number));
    expect(next[0].createdAt).toEqual(expect.any(Number));
  });

  it('merges into an existing user', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 1, name: 'Old', role: 'user' }]));
    const next = upsertUser({ id: 1, name: 'Renamed' });

    expect(next).toEqual([{ id: 1, name: 'Renamed', role: 'user' }]);
  });

  it('keeps an explicit id for a user that does not exist yet', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    expect(upsertUser({ id: 77, name: 'Seven' })[0].id).toBe(77);
  });

  it('dispatches a users:updated event', () => {
    const listener = jest.fn();
    window.addEventListener('users:updated', listener);
    upsertUser({ name: 'Eventful' });
    window.removeEventListener('users:updated', listener);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('removeUser', () => {
  it('removes the matching user only', () => {
    const remaining = removeUser(1);
    expect(remaining).toHaveLength(23);
    expect(remaining.some((u) => u.id === 1)).toBe(false);
  });

  it('is a no-op for unknown ids', () => {
    expect(removeUser(9999)).toHaveLength(24);
  });
});

describe('toggleUserStatus', () => {
  it('flips active to inactive and back', () => {
    expect(toggleUserStatus(2).status).toBe('inactive');
    expect(toggleUserStatus(2).status).toBe('active');
  });

  it('returns undefined for unknown ids', () => {
    expect(toggleUserStatus(9999)).toBeUndefined();
  });
});

describe('bulkRemoveUsers', () => {
  it('removes every listed user', () => {
    const next = bulkRemoveUsers([1, 2, 3]);
    expect(next).toHaveLength(21);
    expect(next.some((u) => [1, 2, 3].includes(u.id))).toBe(false);
  });

  it('returns the full list for empty or invalid input', () => {
    expect(bulkRemoveUsers()).toHaveLength(24);
    expect(bulkRemoveUsers([])).toHaveLength(24);
    expect(bulkRemoveUsers('nope')).toHaveLength(24);
  });
});

describe('setUsersStatus', () => {
  it('sets the status of the listed users', () => {
    const next = setUsersStatus([1, 2], 'inactive');
    expect(next.filter((u) => [1, 2].includes(u.id)).map((u) => u.status)).toEqual(['inactive', 'inactive']);
    expect(next.find((u) => u.id === 3).status).toBe('active');
  });

  it('defaults to the active status', () => {
    const next = setUsersStatus([1]);
    expect(next.find((u) => u.id === 1).status).toBe('active');
  });

  it('returns the full list for empty or invalid input', () => {
    expect(setUsersStatus([], 'inactive')).toHaveLength(24);
    expect(setUsersStatus(null, 'inactive')).toHaveLength(24);
  });
});

describe('queryUsers', () => {
  it('paginates with 10 items per page by default', () => {
    const first = queryUsers({});
    expect(first.total).toBe(24);
    expect(first.totalPages).toBe(3);
    expect(first.items).toHaveLength(10);

    const last = queryUsers({ page: 3 });
    expect(last.items).toHaveLength(4);
  });

  it('supports a custom page size', () => {
    expect(queryUsers({ pageSize: 5 })).toMatchObject({ total: 24, totalPages: 5 });
    expect(queryUsers({ pageSize: 5, page: 2 }).items.map((u) => u.id)).toEqual([6, 7, 8, 9, 10]);
  });

  it('searches name and email case-insensitively', () => {
    expect(queryUsers({ q: '  USER 24 ' }).items.map((u) => u.id)).toEqual([24]);
    expect(queryUsers({ q: 'user 1', pageSize: 100 }).total).toBe(11);
    expect(queryUsers({ q: 'user2@example.com' }).items.map((u) => u.id)).toEqual([2]);
  });

  it('filters by role and status', () => {
    const admins = queryUsers({ role: 'admin', pageSize: 100 });
    expect(admins.items.every((u) => u.role === 'admin')).toBe(true);
    expect(admins.items.map((u) => u.id)).toEqual([1, 5, 9, 13, 17, 21]);

    const inactive = queryUsers({ status: 'inactive', pageSize: 100 });
    expect(inactive.items.map((u) => u.id)).toEqual([1, 8, 15, 22]);
  });

  it('combines filters', () => {
    expect(queryUsers({ role: 'admin', status: 'inactive', pageSize: 100 }).items.map((u) => u.id)).toEqual([1]);
  });

  it('returns at least one page when nothing matches', () => {
    expect(queryUsers({ q: 'nobody' })).toMatchObject({ items: [], total: 0, totalPages: 1 });
  });
});
