import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useCart } from '../../state/CartContext';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../state/UIContext';
import { formatLineTotal, formatPrice } from 'core/utils/price';

export default function MiniCartDrawer() {
  const [lastRemoved, setLastRemoved] = React.useState(null);
  const { items, removeItem, updateQty, subtotal, addItem } = useCart();
  const navigate = useNavigate();
  const { miniCartOpen, setMiniCartOpen } = useUI();

  const onRemove = (key, item) => {
    setLastRemoved(item);
    removeItem(key);
  };

  return (
    <>
      <Drawer anchor="right" open={miniCartOpen} onClose={() => setMiniCartOpen(false)}>
        <Box sx={{ width: 360, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Your Cart</Typography>
            <IconButton onClick={() => setMiniCartOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.length === 0 && <Typography color="text.secondary">Your cart is empty.</Typography>}
            {items.map((item) => (
              <Box key={item.key} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ width: 64, height: 64, bgcolor: 'action.hover', borderRadius: 1 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">{item.product.title}</Typography>
                  <Typography variant="body2" color="text.secondary">Qty: {item.qty}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <Typography variant="subtitle2">{formatLineTotal(item.product.price, item.qty)}</Typography>
                  <Button size="small" color="error" onClick={() => onRemove(item.key, item)}>Remove</Button>
                </Box>
              </Box>
            ))}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1">Subtotal</Typography>
            <Typography variant="subtitle1">{formatPrice(subtotal)}</Typography>
          </Box>
          <Button fullWidth variant="outlined" onClick={() => { setMiniCartOpen(false); navigate('/checkout'); }}>Checkout</Button>
        </Box>
      </Drawer>
      <Snackbar open={!!lastRemoved} onClose={() => setLastRemoved(null)} autoHideDuration={4000}>
        <Alert onClose={() => setLastRemoved(null)} severity="info" action={
          <Button color="inherit" size="small" onClick={() => {
            if (lastRemoved) addItem(lastRemoved.product, lastRemoved.qty, lastRemoved.variant);
            setLastRemoved(null);
          }}>Undo</Button>
        }>Item removed</Alert>
      </Snackbar>
    </>
  );
}
