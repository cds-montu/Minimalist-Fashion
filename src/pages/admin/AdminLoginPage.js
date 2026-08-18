import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAdminAccessConfigured, startAdminSession } from 'services/adminSession';

export default function AdminLoginPage() {
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdminAccessConfigured()) {
      setError('Admin access is not configured for this deployment.');
      return;
    }
    if (startAdminSession(value)) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid Admin ID');
    }
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
          type="password"
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" fullWidth disabled={!isAdminAccessConfigured()}>Enter</Button>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          This area is restricted. Enter the provided Admin ID.
        </Typography>
      </Paper>
    </Box>
  );
}
