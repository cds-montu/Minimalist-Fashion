import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { errorMessage, readJSON, writeJSON } from 'core/utils/storage';

const STORAGE_KEY = 'admin:settings';
const defaultSettings = { name: 'My Store', currency: 'USD', supportEmail: 'support@example.com' };

export default function SettingsAdminPage() {
  const [store, setStore] = React.useState(() => readJSON(STORAGE_KEY, defaultSettings));
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState('');

  const save = () => {
    try {
      writeJSON(STORAGE_KEY, store);
    } catch (err) {
      setError(errorMessage(err, 'Could not save settings.'));
      return;
    }
    setError('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Settings</Typography>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <TextField label="Store Name" value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} />
        <TextField label="Currency" value={store.currency} onChange={(e) => setStore({ ...store, currency: e.target.value })} />
        <TextField label="Support Email" type="email" value={store.supportEmail} onChange={(e) => setStore({ ...store, supportEmail: e.target.value })} />
        <Button variant="contained" onClick={save}>Save</Button>
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
        {saved && <Alert severity="success">Settings saved</Alert>}
      </Stack>
    </Box>
  );
}
