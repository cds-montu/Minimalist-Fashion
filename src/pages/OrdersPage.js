import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { getAllOrders } from 'services/ordersStore';
import { formatPrice } from 'core/utils/price';
import { APP_EVENTS } from 'core/utils/appEvents';
import { useWindowEvent } from 'hooks/useWindowEvent';

export default function OrdersPage() {
  const [rows, setRows] = React.useState(getAllOrders());
  useWindowEvent(APP_EVENTS.ordersUpdated, () => setRows(getAllOrders()));

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Your Orders</Typography>
      <Paper variant="outlined" sx={{ p: { xs: 1, md: 2 } }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.id} hover>
                  <TableCell>
                    <Button component={Link} to={`/orders/${o.id}`} size="small">{o.id}</Button>
                  </TableCell>
                  <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{o.items.reduce((n, i) => n + i.qty, 0)}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell align="right">{formatPrice(o.totals?.total)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">No orders yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ mt: 2 }} />
        <Typography variant="caption" color="text.secondary">Orders are stored locally for demo. Integrate your backend to persist securely.</Typography>
      </Paper>
    </Box>
  );
}
