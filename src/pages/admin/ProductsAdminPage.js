import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import { getAllProducts, upsertProduct, removeProduct as storeRemove } from 'services/productsStore';
import { errorMessage } from 'core/utils/storage';

export default function ProductsAdminPage() {
  const [q, setQ] = React.useState('');
  const [rows, setRows] = React.useState(getAllProducts().slice(0, 50));
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ id: '', title: '', price: '', brand: '', category: '', image: '' });
  const [confirm, setConfirm] = React.useState({ open: false, row: null });
  const [orderBy, setOrderBy] = React.useState('title');
  const [order, setOrder] = React.useState('asc'); // 'asc' | 'desc'
  const [error, setError] = React.useState('');

  const persist = (action, fallbackMessage) => {
    try {
      action();
      setError('');
      return true;
    } catch (err) {
      setError(errorMessage(err, fallbackMessage));
      return false;
    }
  };

  const filtered = rows.filter(r => r.title.toLowerCase().includes(q.toLowerCase()));
  const comparator = React.useCallback((a, b) => {
    const dir = order === 'asc' ? 1 : -1;
    const get = (r) => {
      if (orderBy === 'price') return Number(r.price) || 0;
      return String(r[orderBy] || '').toLowerCase();
    };
    const va = get(a); const vb = get(b);
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  }, [order, orderBy]);
  const sorted = React.useMemo(() => [...filtered].sort(comparator), [filtered, comparator]);

  const handleSort = (key) => {
    if (orderBy === key) setOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
    else { setOrderBy(key); setOrder('asc'); }
  };

  const openCreate = () => {
    setForm({ id: '', title: '', price: '', brand: '', category: '', image: '' });
    setOpen(true);
  };

  const save = () => {
    if (!form.title.trim() || !form.price) return;
    const id = form.id || Date.now();
    const ok = persist(
      () => upsertProduct({ ...form, id, price: Number(form.price) }),
      'Could not save the product.'
    );
    // Refresh from store to reflect latest state
    setRows(getAllProducts().slice(0, 50));
    if (ok) setOpen(false);
  };

  const edit = (r) => {
    setForm({ id: r.id, title: r.title, price: r.price, brand: r.brand || '', category: r.category || '', image: r.image || '' });
    setOpen(true);
  };

  const remove = (id) => {
    persist(() => storeRemove(id), 'Could not delete the product.');
    setRows(getAllProducts().slice(0, 50));
  };

  const saveRow = (id) => {
    const row = rows.find((x) => x.id === id);
    if (!row) return;
    persist(() => upsertProduct(row), 'Could not save the product.');
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }));
    reader.onerror = () => setError('Could not read the selected image file.');
    try {
      reader.readAsDataURL(file);
    } catch (err) {
      setError(errorMessage(err, 'Could not read the selected image file.'));
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 2 }}>
        <Typography variant="h6">Products</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box>
            <TextField size="small" placeholder="Search products in this table" value={q} onChange={e => setQ(e.target.value)} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>This search filters the products table only.</Typography>
          </Box>
          <Button variant="contained" onClick={openCreate}>New Product</Button>
        </Stack>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={72}>Image</TableCell>
              <TableCell sortDirection={orderBy === 'title' ? order : false}>
                <TableSortLabel active={orderBy === 'title'} direction={order} onClick={() => handleSort('title')}>Title</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'brand' ? order : false}>
                <TableSortLabel active={orderBy === 'brand'} direction={order} onClick={() => handleSort('brand')}>Brand</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'category' ? order : false}>
                <TableSortLabel active={orderBy === 'category'} direction={order} onClick={() => handleSort('category')}>Category</TableSortLabel>
              </TableCell>
              <TableCell align="right" width={120} sortDirection={orderBy === 'price' ? order : false}>
                <TableSortLabel active={orderBy === 'price'} direction={order} onClick={() => handleSort('price')}>Price</TableSortLabel>
              </TableCell>
              <TableCell align="right" width={160}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>
                  {r.image ? (
                    <Box component="img" src={r.image} alt={r.title} sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
                  ) : (
                    <Box sx={{ width: 40, height: 40, bgcolor: 'action.hover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" noWrap title={r.title}>{r.title}</Typography>
                </TableCell>
                <TableCell>
                  <TextField
                    variant="standard"
                    value={r.brand || ''}
                    onChange={(e) => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, brand: e.target.value } : x))}
                    onBlur={() => saveRow(r.id)}
                    placeholder="-"
                    inputProps={{ 'aria-label': 'brand' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }} noWrap title={r.category}>{r.category || '-'}</Typography>
                </TableCell>
                <TableCell align="right">
                  <TextField
                    variant="standard"
                    value={r.price}
                    onChange={(e) => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, price: e.target.value } : x))}
                    onBlur={() => saveRow(r.id)}
                    inputProps={{ inputMode: 'numeric', step: '0.01', style: { textAlign: 'right' }, 'aria-label': 'price' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="contained" onClick={() => edit(r)}>Edit</Button>
                    <Button size="small" variant="contained" color="error" onClick={() => setConfirm({ open: true, row: r })}>Delete</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{form.id ? 'Edit Product' : 'New Product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth />
            <TextField label="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} fullWidth />
            <TextField label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} fullWidth />
            <TextField label="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} fullWidth />
            <Stack direction="row" spacing={2} alignItems="center">
              <Box component="img" src={form.image || undefined} alt="preview" sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 1, bgcolor: 'action.hover' }} />
              <Button component="label" variant="outlined">
                Upload Image
                <input type="file" accept="image/*" hidden onChange={onFile} />
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false, row: null })}>
        <DialogTitle>Delete product</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to delete <strong>{confirm.row?.title}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false, row: null })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => { remove(confirm.row.id); setConfirm({ open: false, row: null }); }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
