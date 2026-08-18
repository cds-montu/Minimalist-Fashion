import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormHelperText from '@mui/material/FormHelperText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'state/AuthContext';
import { writeJSON, writeRaw } from 'core/utils/storage';
import { isStrongPassword, isValidEmail, PASSWORD_RULES } from 'core/utils/validation';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ name: '', email: '', password: '' });

  const validEmail = isValidEmail;
  const rules = PASSWORD_RULES;
  const ok = isStrongPassword;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Full name is required.'); return; }
    if (!validEmail(form.email)) { setError('Please enter a valid email.'); return; }
    if (!ok(form.password)) { setError('Please satisfy all password rules.'); return; }
    try {
      setLoading(true);
      const creds = { email: form.email, password: form.password };
      writeJSON('auth:creds', creds);
      // Optionally also persist display name
      writeRaw('auth:displayName', form.name);
      // Auto-login then go home
      await login({ email: form.email, name: form.name });
      navigate('/');
    } catch (err) {
      setError('Failed to save credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Typography variant="h5" gutterBottom>Sign Up</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={submit}>
        <Stack spacing={2}>
          <TextField label="Full Name" fullWidth size="small" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" type="email" fullWidth size="small" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Password" type={showPass ? 'text' : 'password'} fullWidth size="small" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            helperText="Use a strong password that meets the rules below"
            InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPass((s) => !s)} edge="end">{showPass ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }}
          />
          <Box sx={{ pl: 0.5 }}>
            {rules.map((r) => {
              const passed = r.test(form.password);
              return (
                <FormHelperText key={r.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: passed ? 'success.main' : 'text.secondary' }}>
                  {passed ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                  {r.label}
                </FormHelperText>
              );
            })}
          </Box>
          <Button type="submit" variant="contained" disabled={loading}>Create Account</Button>
          <Typography variant="body2">Already have an account? <Button component={Link} to="/login" size="small">Sign in</Button></Typography>
        </Stack>
      </Box>
    </Container>
  );
}
