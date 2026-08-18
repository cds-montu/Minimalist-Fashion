import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { formatPrice } from 'core/utils/price';

const seed = Array.from({ length: 12 }).map((_, i) => ({
  id: 1000 + i,
  customer: `Customer ${i + 1}`,
  total: 50 + i * 8,
  status: ['Pending', 'Paid', 'Shipped', 'Delivered'][i % 4],
  date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
}));

export default function OrdersAdminPage() {
  const [rows, setRows] = React.useState(seed);
  const nextStatus = (s) => {
    const states = ['Pending', 'Paid', 'Shipped', 'Delivered'];
    const idx = states.indexOf(s);
    return states[Math.min(idx + 1, states.length - 1)];
  };
  const advance = (id) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: nextStatus(r.status) } : r)));

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Orders</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.customer}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell align="right">{formatPrice(r.total)}</TableCell>
                <TableCell>
                  <Chip label={r.status} size="small" color={r.status === 'Delivered' ? 'success' : r.status === 'Shipped' ? 'info' : r.status === 'Paid' ? 'primary' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => advance(r.id)} disabled={r.status === 'Delivered'}>Advance</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
