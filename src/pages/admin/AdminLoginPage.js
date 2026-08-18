import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useLocation, useNavigate } from 'react-router-dom';
import { errorMessage, getStorage } from 'core/utils/storage';

const REQUIRED_ADMIN_ID = 'ADMIN-2025-SECURE';

export default function AdminLoginPage() {
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() !== REQUIRED_ADMIN_ID) {
      setError('Invalid Admin ID');
      return;
    }
    try {
      const storage = getStorage('local');
      if (!storage) throw new Error('Browser storage is unavailable');
      storage.setItem('adminId', REQUIRED_ADMIN_ID);
    } catch (err) {
      setError(errorMessage(err, 'Could not start your admin session.'));
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', px: 2 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, width: '100%', maxWidth: 400, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Admin Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="Admin ID"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fullWidth
          autoFocus
          autoComplete="off"
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" fullWidth>Enter</Button>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          This area is restricted. Enter the provided Admin ID.
        </Typography>
      </Paper>
    </Box>
  );
}
