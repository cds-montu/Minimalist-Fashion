import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useWishlist } from '../state/WishlistContext';
import { useCart } from '../state/CartContext';
import { formatPrice } from 'core/utils/price';

function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { addItem } = useCart();

  return (
    <Grid container spacing={2} sx={{ py: 3 }}>
      {items.length === 0 && <Typography color="text.secondary">No items in wishlist.</Typography>}
      {items.map((p) => (
        <Grid item key={p.id} xs={12} sm={6} md={4} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">{p.title}</Typography>
              <Typography variant="body2" color="text.secondary">{formatPrice(p.price)}</Typography>
            </CardContent>
            <CardActions>
              <Button onClick={() => addItem(p, 1)} variant="contained" size="small">Add to Cart</Button>
              <Button onClick={() => toggle(p)} size="small">Remove</Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default WishlistPage;
