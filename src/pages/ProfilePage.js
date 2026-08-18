import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import PhoneIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined';
import { Link } from 'react-router-dom';
import { useWishlist } from 'state/WishlistContext';
import { useAuth } from 'state/AuthContext';
import { formatPrice } from 'core/utils/price';
import Alert from '@mui/material/Alert';

function TabPanel({ value, index, children }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

function ProfilePage() {
  const [tab, setTab] = React.useState(0);
  const { items: wishlist, toggle } = useWishlist();
  const { user, updateUser } = useAuth();
  const [saved, setSaved] = React.useState(false);

  // Mock orders for demo
  const [orders] = React.useState(
    Array.from({ length: 6 }).map((_, i) => ({
      id: 2000 + i,
      date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
      total: 39.99 + i * 12,
      status: ['Processing', 'Shipped', 'Delivered'][i % 3],
      items: Math.ceil(Math.random() * 4),
    }))
  );

  // Addresses state and dialog
  const [addresses, setAddresses] = React.useState([
    { id: 1, name: 'Home', line1: '221B Baker Street', city: 'London', state: '', zip: 'NW1', country: 'UK' },
  ]);
  const [addrOpen, setAddrOpen] = React.useState(false);
  const [addrForm, setAddrForm] = React.useState({ id: '', name: '', line1: '', city: '', state: '', zip: '', country: '' });

  const openNewAddr = () => { setAddrForm({ id: '', name: '', line1: '', city: '', state: '', zip: '', country: '' }); setAddrOpen(true); };
  const openEditAddr = (a) => { setAddrForm(a); setAddrOpen(true); };
  const saveAddr = () => {
    if (!addrForm.name.trim() || !addrForm.line1.trim()) return;
    const id = addrForm.id || Date.now();
    const next = { ...addrForm, id };
    setAddresses((prev) => {
      const exists = prev.some((p) => p.id === id);
      return exists ? prev.map((p) => (p.id === id ? next : p)) : [next, ...prev];
    });
    setAddrOpen(false);
  };
  const deleteAddr = (id) => setAddresses((prev) => prev.filter((a) => a.id !== id));

  // Settings dialog
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [settings, setSettings] = React.useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', location: user?.location || '', avatar: user?.avatar || '' });
  React.useEffect(() => {
    setSettings({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', location: user?.location || '', avatar: user?.avatar || '' });
  }, [user]);
  const saveSettings = () => {
    updateUser({ name: settings.name, email: settings.email, phone: settings.phone, location: settings.location, avatar: settings.avatar });
    setSettingsOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Centered Profile Card */}
      <Paper elevation={0} sx={{
        mx: 'auto', p: { xs: 3, md: 4 }, maxWidth: 900,
        borderRadius: 4, border: '1px solid', borderColor: 'divider',
        boxShadow: (t) => t.shadows[2],
        background: (t) => t.palette.mode === 'light' ? 'linear-gradient(180deg, #FFFFFF, #F8FAFC)' : t.palette.background.paper,
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
          <Avatar sx={{ width: 104, height: 104, boxShadow: 1 }} src={user?.avatar || `https://i.pravatar.cc/200?img=5`} />
          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h4" sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>{user?.name || 'Guest'}</Typography>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }} sx={{ mt: 0.5 }}>
              {user?.email && <Chip label={user.email} size="small" variant="outlined" />}
              <Chip label="Member" size="small" color="primary" variant="soft" sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 560 }}>
              Minimal style enthusiast. Loving clean lines, neutral tones, and timeless basics.
            </Typography>
            <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'center', sm: 'flex-start' }} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => setSettingsOpen(true)}>Edit Profile</Button>
              <Button variant="text" component={Link} to="/orders">View Orders</Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
      {saved && <Alert severity="success" sx={{ mt: 2, mx: 'auto', maxWidth: 900 }}>Profile updated</Alert>}

      {/* Sections Grid */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Personal Details */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%', transition: 'all .2s ease', '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' } }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Personal Details</Typography>
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon fontSize="small" />
                <Typography variant="body2">{user?.email || '-'}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon fontSize="small" />
                <Typography variant="body2">{user?.phone || '-'}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnIcon fontSize="small" />
                <Typography variant="body2">{user?.location || '-'}</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* Order History */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, transition: 'all .2s ease', '&:hover': { boxShadow: 3 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1">Order History</Typography>
              <Button component={Link} to="/orders" size="small">View All</Button>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.slice(0, 4).map((o) => (
                    <TableRow key={o.id} hover sx={{ transition: 'background .2s ease' }}>
                      <TableCell>
                        <Button component={Link} to={`/orders/${o.id}`} size="small">{o.id}</Button>
                      </TableCell>
                      <TableCell>{o.date}</TableCell>
                      <TableCell>{o.items}</TableCell>
                      <TableCell align="right">{formatPrice(o.total)}</TableCell>
                      <TableCell>{o.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Wishlist */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Wishlist</Typography>
              <Typography variant="body2" color="text.secondary">{wishlist.length} items</Typography>
            </Stack>
            {wishlist.length === 0 ? (
              <Stack alignItems="center" spacing={1} sx={{ py: 4, color: 'text.secondary' }}>
                <FavoriteBorderIcon />
                <Typography>No items in wishlist</Typography>
              </Stack>
            ) : (
              <Grid container spacing={2} sx={{ mt: 0 }}>
                {wishlist.map((p) => (
                  <Grid key={p.id} item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, transition: 'all .2s ease', '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' } }}>
                      <img alt={p.title} src={`https://picsum.photos/seed/${p.id}/320/220`} width="100%" height={160} style={{ borderRadius: 10, objectFit: 'cover' }} loading="lazy" />
                      <Typography variant="subtitle2" noWrap title={p.title} sx={{ mt: 1 }}>{p.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{formatPrice(p.price)}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button size="small" component={Link} to={`/product/${p.id}`}>View</Button>
                        <Button size="small" color="error" onClick={() => toggle(p)}>Remove</Button>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={settings.avatar || undefined} sx={{ width: 72, height: 72 }} />
              <Button component="label" variant="outlined">
                Upload Photo
                <input type="file" accept="image/*" hidden onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setSettings((s) => ({ ...s, avatar: reader.result }));
                  reader.readAsDataURL(file);
                }} />
              </Button>
            </Stack>
            <TextField label="Name" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} fullWidth />
            <TextField label="Email" type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} fullWidth />
            <TextField label="Phone" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} fullWidth />
            <TextField label="Location" value={settings.location} onChange={(e) => setSettings({ ...settings, location: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveSettings}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProfilePage;
