import { readObject, writeJSON } from 'core/utils/storage';

export const HOME_CONFIG_KEY = 'home:config';

export const defaultHomeConfig = {
  welcomeText: 'Welcome to E-Shop',
  themeMode: 'light', // light | dark | custom
  customPrimaryColor: '#1976d2',
  banner: { image: '', ctaText: 'Discover the latest products', buttonText: 'Shop Now', link: '/products' },
  heroImage: '',
  collectionImage: '',
  featuredProducts: [],
  layoutStyle: 'grid', // grid | list | masonry
  widgets: { newArrivals: true, bestSellers: true, discounts: true, testimonials: false },
};

export function loadHomeConfig() {
  return { ...defaultHomeConfig, ...readObject(HOME_CONFIG_KEY) };
}

export function saveHomeConfig(cfg) {
  return writeJSON(HOME_CONFIG_KEY, cfg);
}
