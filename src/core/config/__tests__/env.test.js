describe('ENV', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('reads values from the environment', () => {
    process.env.NODE_ENV = 'production';
    process.env.REACT_APP_API_BASE_URL = 'https://api.example.com';
    process.env.REACT_APP_GOOGLE_CLIENT_ID = 'client-123';

    const { ENV } = require('core/config/env');

    expect(ENV).toEqual({
      NODE_ENV: 'production',
      API_BASE_URL: 'https://api.example.com',
      MOCK_DELAY_MS: 350,
      GOOGLE_CLIENT_ID: 'client-123',
    });
  });

  it('falls back to development defaults when unset', () => {
    delete process.env.NODE_ENV;
    delete process.env.REACT_APP_API_BASE_URL;
    delete process.env.REACT_APP_GOOGLE_CLIENT_ID;

    const { ENV } = require('core/config/env');

    expect(ENV.NODE_ENV).toBe('development');
    expect(ENV.API_BASE_URL).toBe('');
    expect(ENV.GOOGLE_CLIENT_ID).toBe('');
  });
});

describe('API_ROUTES', () => {
  it('exposes static routes', () => {
    const { API_ROUTES } = require('core/config/env');
    expect(API_ROUTES.products).toBe('/products');
    expect(API_ROUTES.search).toBe('/search');
    expect(API_ROUTES.lookbook).toBe('/lookbook');
  });

  it('builds the product route from an id', () => {
    const { API_ROUTES } = require('core/config/env');
    expect(API_ROUTES.product(42)).toBe('/products/42');
  });
});
