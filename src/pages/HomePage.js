import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getAllProducts } from 'services/productsStore';
import herobanner from "../assests/images/herobanner.jpg";
import collection from "../assests/images/collection.jpg";
import Lifestyle from "../assests/images/Lifestyle Section.jpg";
import { getProductImage, onImgErrorSwap } from 'core/utils/imageForProduct';
import BrandLogo from 'components/BrandLogo';
import LookbookSlider from 'components/lookbook/LookbookSlider';
import ScrollReveal from 'components/layout/ScrollReveal';
import { useCart } from 'state/CartContext';
import { useWishlist } from 'state/WishlistContext';

const STORAGE_KEY = 'home:config';
const DEFAULT_HERO_VIDEO = 'https://cdn.mixkit.co/videos/preview/mixkit-fabric-textile-soft-flow-40626-large.mp4';

function loadConfig() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function HomePage() {
  const theme = useTheme();
  const { addItem } = useCart();
  const { toggle: toggleWishlist, contains: isInWishlist } = useWishlist();
  const [cfg, setCfg] = React.useState(loadConfig());
  const [all, setAll] = React.useState(getAllProducts());
  const [heroVideoFailed, setHeroVideoFailed] = React.useState(false);

  React.useEffect(() => {
    const onUpdate = () => setAll(getAllProducts());
    window.addEventListener('products:updated', onUpdate);
    return () => window.removeEventListener('products:updated', onUpdate);
  }, []);

  React.useEffect(() => {
    const onStorage = () => setCfg(loadConfig());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const primarySx = cfg.themeMode === 'custom' ? { bgcolor: cfg.customPrimaryColor, '&:hover': { filter: 'brightness(0.9)' } } : undefined;

  const featured = React.useMemo(() => {
    if (!Array.isArray(cfg.featuredProducts) || !cfg.featuredProducts.length) return [];
    const set = new Set(cfg.featuredProducts);
    return all.filter((p) => set.has(p.id));
  }, [cfg.featuredProducts, all]);

  const newArrivals = React.useMemo(() => {
    const tagged = all.filter((p) => Array.isArray(p.tags) && p.tags.includes('new'));
    if (tagged.length) return tagged.slice(0, 8);
    // Fallback: newest by createdAt or last added
    return [...all].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 8);
  }, [all]);
  const bestSellers = React.useMemo(() => [...all].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8), [all]);
  const discounts = React.useMemo(() => all.filter((p) => p.price <= 30).slice(0, 8), [all]);

  const renderProducts = (items) => (
    <Grid container spacing={3}>
      {items.map((p, idx) => (
        <Grid key={p.id} item xs={12} sm={6} md={3}>
          <ScrollReveal delay={idx * 0.06}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 2,
                },
                '&:hover .product-img-wrap img': { transform: 'scale(1.05)' },
                '&:hover .product-card-overlay': { opacity: 1 },
              }}
            >
              <Box className="product-img-wrap" sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                <img
                  src={getProductImage(p, { w: 900, h: 1200 })}
                  alt={p.title}
                  width="100%"
                  height={280}
                  style={{ objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                  onError={(e) => onImgErrorSwap(e, p, { w: 900, h: 1200 })}
                />
                <Box
                  className="product-card-overlay"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 1,
                    p: 2,
                    background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.6) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddShoppingCartIcon fontSize="small" />}
                      onClick={(e) => { e.stopPropagation(); addItem(p, 1); }}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      component={Link}
                      to={`/product/${p.id}`}
                      startIcon={<VisibilityIcon fontSize="small" />}
                    >
                      Quick View
                    </Button>
                    <IconButton
                      size="small"
                      sx={{ bgcolor: 'background.paper', color: isInWishlist(p.id) ? 'error.main' : 'inherit' }}
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                    >
                      {isInWishlist(p.id) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                </Box>
              </Box>
              <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }} noWrap>
                {p.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">${p.price}</Typography>
              <Box sx={{ mt: 1.5 }}>
                <Button size="small" component={Link} to={`/product/${p.id}`} variant="text">
                  View
                </Button>
              </Box>
            </Paper>
          </ScrollReveal>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 520, md: 640 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'common.white',
          overflow: 'hidden',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {heroVideoFailed ? (
          <Box
            component="img"
            src={cfg.heroImage || herobanner}
            alt="Hero"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'grayscale(8%)',
              transform: 'scale(1.02)',
            }}
          />
        ) : (
          <Box
            component="video"
            autoPlay
            loop
            muted
            playsInline
            poster={cfg.heroImage || herobanner}
            onError={() => setHeroVideoFailed(true)}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'grayscale(8%)',
              transform: 'scale(1.02)',
            }}
          >
            <source src={cfg.heroVideo || DEFAULT_HERO_VIDEO} type="video/mp4" />
          </Box>
        )}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.55) 100%)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Centered overlay slightly below mid to align under collection text */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: { xs: '56%', md: '62%' },
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              width: '100%',
              px: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              pointerEvents: 'none',
            }}
          >
            {(cfg.banner?.showHeading ?? true) && (() => {
              const heading = cfg.banner?.heading || 'Minimalist Fashion';
              const isMultiLine = heading.includes('\n');
              const items = isMultiLine ? heading.split('\n').filter(Boolean) : heading.split(' ').filter(Boolean);
              return (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: isMultiLine ? 'column' : 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: isMultiLine ? 0 : '0 0.35em',
                    mb: 5,
                  }}
                >
                  {items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.9, delay: 0.15 * i, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <Typography
                        variant="h1"
                        sx={{
                          color: 'common.white',
                          textShadow: '0 2px 6px rgba(0,0,0,0.35)',
                          letterSpacing: { xs: 0, md: 0.5 },
                        }}
                      >
                        {item}
                      </Typography>
                    </motion.div>
                  ))}
                </Box>
              );
            })()}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ pointerEvents: 'auto' }}
            >
              <Button
                component={Link}
                to="/products"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 999,
                  transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    transform: 'translateY(-2px) scale(1.03)',
                    boxShadow: (t) => `0 16px 40px ${t.palette.mode === 'dark' ? 'rgba(201,169,98,0.35)' : 'rgba(79,70,229,0.3)'}, 0 0 0 1px rgba(255,255,255,0.08)`,
                  },
                }}
              >
                {cfg.banner?.buttonText || 'Shop Now'}
              </Button>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* New Arrivals */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <ScrollReveal>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h2">New Arrivals</Typography>
            <Button component={Link} to="/products" variant="text">View all</Button>
          </Stack>
          {renderProducts(newArrivals)}
          <Box sx={{ mt: 4 }}>
            <LookbookSlider />
          </Box>
        </ScrollReveal>
      </Container>

      {/* Collection Banner */}
      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 9 } }}>
        <ScrollReveal delay={0.1}>
        <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden' }}>
          <Box
            component="img"
            src={cfg.collectionImage || collection}
            alt="Collection"
            sx={{ width: '100%', height: { xs: 260, md: 360 }, objectFit: 'cover', filter: 'grayscale(12%)' }}
          />
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.25)' }} />
          <Stack spacing={1} sx={{ position: 'absolute', left: { xs: 16, md: 32 }, bottom: { xs: 16, md: 24 }, color: 'common.white' }}>
            <Typography variant="h2" sx={{ letterSpacing: 6 }}>COLLECTION</Typography>
            <Button component={Link} to="/products" variant="contained" size="medium" sx={{ width: 'fit-content', borderRadius: 999 }}>View</Button>
          </Stack>
        </Box>
        </ScrollReveal>
      </Container>

      {/* Editorial / Lifestyle Section */}
      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 9 } }}>
        <ScrollReveal delay={0.1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ borderRadius: 3, overflow: 'hidden', height: { xs: 280, md: 420 } }}>
              <Box
                component="img"
                src={Lifestyle}
                alt="Editorial 1"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(8%)' }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={2} sx={{ height: '100%', justifyContent: 'center' }}>
              <Typography variant="h2">Twice as Cozy</Typography>
              <Typography variant="body1" color="text.secondary">
                Discover elevated textures and refined silhouettes crafted for comfort and intention. Layer softly, move freely, and live beautifully.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Button component={Link} to="/products?category=coats" variant="outlined">Shop Coats</Button>
                <Button component={Link} to="/products?category=knitwear" variant="text">Shop Knitwear</Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
        </ScrollReveal>
      </Container>

      {/* Minimal Footer */}
      <Divider />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <BrandLogo size={24} withWordmark />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Modern essentials with a luxury touch.</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>About Us</Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary" component={Link} to="/about" style={{ textDecoration: 'none' }}>Our Story</Typography>
              <Typography variant="body2" color="text.secondary" component={Link} to="/sustainability" style={{ textDecoration: 'none' }}>Sustainability</Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Customer Service</Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary" component={Link} to="/help" style={{ textDecoration: 'none' }}>Help Center</Typography>
              <Typography variant="body2" color="text.secondary" component={Link} to="/shipping" style={{ textDecoration: 'none' }}>Shipping & Returns</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Contact</Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">support@example.com</Typography>
              <Typography variant="body2" color="text.secondary">Terms • Privacy</Typography>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage;
