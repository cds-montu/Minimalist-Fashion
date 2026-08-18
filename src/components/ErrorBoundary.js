import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { logError } from 'core/utils/storage';

// Catches render/lifecycle errors so a failure shows a recoverable message
// instead of an empty page with the error only visible in the console.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    logError('ErrorBoundary', error);
    logError('ErrorBoundary:componentStack', info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <Box sx={{ py: 6 }}>
        <Alert severity="error">
          <AlertTitle>Something went wrong</AlertTitle>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="body2">{error.message || 'An unexpected error occurred.'}</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" onClick={this.handleReset}>Try again</Button>
              <Button size="small" onClick={() => window.location.reload()}>Reload page</Button>
            </Stack>
          </Stack>
        </Alert>
      </Box>
    );
  }
}
