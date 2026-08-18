import React from 'react';
import RequireAuth from './guards/RequireAuth';

// Lazy-loaded user/auth/cart/profile routes
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const SignUpPage = React.lazy(() => import('../pages/SignUpPage'));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage'));
const WishlistPage = React.lazy(() => import('../pages/WishlistPage'));
const CartPage = React.lazy(() => import('../pages/CartPage'));
const CheckoutPage = React.lazy(() => import('../pages/CheckoutPage'));
const OrdersPage = React.lazy(() => import('../pages/OrdersPage'));
const OrderDetailPage = React.lazy(() => import('../pages/OrderDetailPage'));

// Fallbacks
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

const userRoutes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignUpPage /> },
  { path: '/profile/*', element: <RequireAuth><ProfilePage /></RequireAuth> },
  { path: '/wishlist', element: <WishlistPage /> },
  { path: '/cart', element: <CartPage /> },
  { path: '/checkout', element: <RequireAuth><CheckoutPage /></RequireAuth> },
  { path: '/orders', element: <RequireAuth><OrdersPage /></RequireAuth> },
  { path: '/orders/:id', element: <RequireAuth><OrderDetailPage /></RequireAuth> },
  // Global catch-all (for non-admin unmatched routes)
  { path: '*', element: <NotFoundPage /> },
];

export default userRoutes;
