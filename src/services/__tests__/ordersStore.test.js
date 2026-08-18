import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  requestRMA,
  completeRMA,
  removeAllOrders,
} from 'services/ordersStore';

const ORDERS_KEY = 'orders:list';

const orderInput = (overrides = {}) => ({
  items: [{ product: { id: 1, title: 'Tee', price: 20 }, qty: 2 }],
  address: { line1: '1 Main St' },
  delivery: 'standard',
  paymentMethod: 'card',
  totals: { grand: 40 },
  user: { id: 'u1', email: 'a@b.c', name: 'Ann', password: 'secret' },
  ...overrides,
});

const readRaw = () => JSON.parse(localStorage.getItem(ORDERS_KEY));

beforeEach(() => {
  localStorage.clear();
});

describe('createOrder', () => {
  it('persists a pending order with a normalized item list', () => {
    const order = createOrder(orderInput());

    expect(order.status).toBe('Pending');
    expect(order.items).toEqual([{ id: 1, title: 'Tee', price: 20, qty: 2 }]);
    expect(order.payment).toEqual({ method: 'card', meta: {} });
    expect(order.timeline).toEqual([
      expect.objectContaining({ status: 'Pending', note: 'Order placed' }),
    ]);
    expect(order.rma).toBeNull();
    expect(readRaw()).toHaveLength(1);
  });

  it('only stores the id, email and name of the user', () => {
    const order = createOrder(orderInput());
    expect(order.user).toEqual({ id: 'u1', email: 'a@b.c', name: 'Ann' });
  });

  it('stores a null user for guest checkout', () => {
    expect(createOrder(orderInput({ user: undefined })).user).toBeNull();
  });

  it('keeps payment metadata when provided', () => {
    const order = createOrder(orderInput({ paymentMeta: { last4: '4242' } }));
    expect(order.payment.meta).toEqual({ last4: '4242' });
  });

  it('dispatches an orders:updated event', () => {
    const listener = jest.fn();
    window.addEventListener('orders:updated', listener);
    createOrder(orderInput());
    window.removeEventListener('orders:updated', listener);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('getAllOrders', () => {
  it('returns an empty list when nothing is stored', () => {
    expect(getAllOrders()).toEqual([]);
  });

  it('returns an empty list for corrupt or non-array data', () => {
    localStorage.setItem(ORDERS_KEY, 'not json');
    expect(getAllOrders()).toEqual([]);
    localStorage.setItem(ORDERS_KEY, '{"a":1}');
    expect(getAllOrders()).toEqual([]);
  });

  it('sorts newest first', () => {
    localStorage.setItem(
      ORDERS_KEY,
      JSON.stringify([
        { id: 1, createdAt: 100 },
        { id: 2, createdAt: 300 },
        { id: 3, createdAt: 200 },
      ])
    );
    expect(getAllOrders().map((o) => o.id)).toEqual([2, 3, 1]);
  });
});

describe('getOrderById', () => {
  it('finds an order regardless of id type', () => {
    const order = createOrder(orderInput());
    expect(getOrderById(order.id)).toMatchObject({ id: order.id });
    expect(getOrderById(String(order.id))).toMatchObject({ id: order.id });
  });

  it('returns null when missing', () => {
    expect(getOrderById('nope')).toBeNull();
  });
});

describe('updateOrderStatus', () => {
  it('updates the status and appends to the timeline', () => {
    const order = createOrder(orderInput());
    const next = updateOrderStatus(String(order.id), 'Shipped', 'On the way');

    expect(next.status).toBe('Shipped');
    expect(next.timeline).toHaveLength(2);
    expect(next.timeline[1]).toMatchObject({ status: 'Shipped', note: 'On the way' });
    expect(getOrderById(order.id).status).toBe('Shipped');
  });

  it('defaults the timeline note to an empty string', () => {
    const order = createOrder(orderInput());
    expect(updateOrderStatus(order.id, 'Packed').timeline[1].note).toBe('');
  });

  it('returns null for an unknown order', () => {
    expect(updateOrderStatus('missing', 'Shipped')).toBeNull();
  });
});

describe('requestRMA / completeRMA', () => {
  it('records an RMA request', () => {
    const order = createOrder(orderInput());
    const next = requestRMA(order.id, 'return', 'Too small');

    expect(next.rma).toMatchObject({ type: 'return', status: 'requested', note: 'Too small' });
    expect(getOrderById(order.id).rma.status).toBe('requested');
  });

  it('completes an existing RMA while keeping its type', () => {
    const order = createOrder(orderInput());
    requestRMA(order.id, 'refund');
    const next = completeRMA(order.id, 'approved', 'Refunded');

    expect(next.rma).toMatchObject({ type: 'refund', status: 'approved', note: 'Refunded' });
    expect(next.rma.completedAt).toEqual(expect.any(Number));
  });

  it('completes an RMA that was never requested', () => {
    const order = createOrder(orderInput());
    expect(completeRMA(order.id, 'rejected').rma).toMatchObject({ status: 'rejected', note: '' });
  });

  it('returns null for unknown orders', () => {
    expect(requestRMA('missing', 'return')).toBeNull();
    expect(completeRMA('missing', 'approved')).toBeNull();
  });
});

describe('removeAllOrders', () => {
  it('clears the stored orders', () => {
    createOrder(orderInput());
    removeAllOrders();
    expect(getAllOrders()).toEqual([]);
  });
});
