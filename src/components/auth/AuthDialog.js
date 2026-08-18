import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import FormHelperText from '@mui/material/FormHelperText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useUI } from '../../state/UIContext';
import { isStrongPassword, isValidEmail, PASSWORD_RULES } from 'core/utils/validation';

export default function AuthDialog() {
  const { authOpen, setAuthOpen } = useUI();
  const [tab, setTab] = React.useState(0);
  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // login state
  const [login, setLogin] = React.useState({ email: '', password: '' });
  // signup state
  const [signup, setSignup] = React.useState({ name: '', email: '', password: '' });
  // otp state
  const [otpStep, setOtpStep] = React.useState({ active: false, email: '', code: '', seconds: 30 });

  React.useEffect(() => {
    if (!otpStep.active) return undefined;
    if (otpStep.seconds <= 0) return undefined;
    const t = setTimeout(() => setOtpStep((s) => ({ ...s, seconds: s.seconds - 1 })), 1000);
    return () => clearTimeout(t);
  }, [otpStep.active, otpStep.seconds]);

  const validEmail = isValidEmail;
  const passwordRules = PASSWORD_RULES;

  const allPasswordRulesOk = isStrongPassword;

  const doLogin = async () => {
    setError('');
    if (!validEmail(login.email)) { setError('Please enter a valid email.'); return; }
    if (!login.password) { setError('Password is required.'); return; }
    setLoading(true);
    // Simulate auth
    setTimeout(() => {
      setLoading(false);
      setAuthOpen(false);
    }, 700);
  };

  const doSignup = async () => {
    setError('');
    if (!signup.name.trim()) { setError('Full name is required.'); return; }
    if (!validEmail(signup.email)) { setError('Please enter a valid email.'); return; }
    if (!allPasswordRulesOk(signup.password)) { setError('Please satisfy all password rules.'); return; }
    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setOtpStep({ active: true, email: signup.email, code: '', seconds: 30 });
    }, 600);
  };

  const verifyOtp = () => {
    setError('');
    if (!/^\d{6}$/.test(otpStep.code)) { setError('Enter the 6-digit code.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthOpen(false);
      setOtpStep({ active: false, email: '', code: '', seconds: 30 });
    }, 600);
  };

  const resendOtp = () => {
    if (otpStep.seconds > 0) return;
    setOtpStep((s) => ({ ...s, seconds: 30 }));
  };

  return (
    <Dialog open={authOpen} onClose={() => setAuthOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>{otpStep.active ? 'Verify Email' : tab === 0 ? 'Login' : 'Sign Up'}</DialogTitle>
      <DialogContent>
        {!otpStep.active && (
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="fullWidth">
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {otpStep.active ? (
          <Stack spacing={2}>
            <Box>
              <div>We sent a 6-digit code to</div>
              <strong>{otpStep.email}</strong>
            </Box>
            <TextField
              label="Enter code"
              value={otpStep.code}
              onChange={(e) => setOtpStep({ ...otpStep, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              inputProps={{ inputMode: 'numeric', maxLength: 6 }}
              fullWidth size="small"
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={verifyOtp} disabled={loading}>Verify</Button>
              <Button onClick={resendOtp} disabled={otpStep.seconds > 0}>Resend {otpStep.seconds > 0 ? `in ${otpStep.seconds}s` : ''}</Button>
            </Stack>
          </Stack>
        ) : tab === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Email" type="email" fullWidth size="small" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
            <TextField label="Password" type={showPass ? 'text' : 'password'} fullWidth size="small" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass((s) => !s)} edge="end">
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button variant="contained" onClick={doLogin} disabled={loading}>Login</Button>
            <Button startIcon={<GoogleIcon />} variant="outlined" disabled={loading}>Continue with Google</Button>
            <Button startIcon={<FacebookIcon />} variant="outlined" disabled={loading}>Continue with Facebook</Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Full Name" fullWidth size="small" value={signup.name} onChange={(e) => setSignup({ ...signup, name: e.target.value })} />
            <TextField label="Email" type="email" fullWidth size="small" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} />
            <TextField label="Password" type={showPass ? 'text' : 'password'} fullWidth size="small" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })}
              helperText="Use a strong password that meets the rules below"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass((s) => !s)} edge="end">
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box sx={{ pl: 0.5 }}>
              {passwordRules.map((r) => {
                const ok = r.test(signup.password);
                return (
                  <FormHelperText key={r.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: ok ? 'success.main' : 'text.secondary' }}>
                    {ok ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                    {r.label}
                  </FormHelperText>
                );
              })}
            </Box>
            <Button variant="contained" onClick={doSignup} disabled={loading || !signup.name || !validEmail(signup.email)}>Create Account</Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
