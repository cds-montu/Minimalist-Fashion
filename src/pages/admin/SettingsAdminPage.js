import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { readObject, writeJSON } from 'core/utils/storage';

const STORAGE_KEY = 'admin:settings';
const DEFAULT_SETTINGS = { name: 'My Store', currency: 'USD', supportEmail: 'support@example.com' };

export default function SettingsAdminPage() {
  const [store, setStore] = React.useState(() => {
    return readObject(STORAGE_KEY, DEFAULT_SETTINGS);
  });
  const [saved, setSaved] = React.useState(false);

  const save = () => {
    writeJSON(STORAGE_KEY, store);
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
        {saved && <Alert severity="success">Settings saved</Alert>}
      </Stack>
    </Box>
  );
}
