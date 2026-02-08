import React from 'react';
import { createTheme, ThemeProvider, useMediaQuery, CssBaseline, GlobalStyles } from '@mui/material';
import { responsiveFontSizes, alpha } from '@mui/material/styles';

const ColorModeContext = React.createContext({ toggleColorMode: () => {}, mode: 'light' });

export function useColorMode() {
  return React.useContext(ColorModeContext);
}

export function AppThemeProvider({ children }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = React.useState(() => localStorage.getItem('color-mode') || 'dark');

  const colorMode = React.useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light';
          localStorage.setItem('color-mode', next);
          return next;
        });
      },
    }),
    [mode]
  );

  const theme = React.useMemo(
    () => {
      let t = createTheme({
        palette: {
          mode,
          // Dark luxury: deep charcoal, warm accents
          primary: mode === 'light'
            ? { main: '#4F46E5', light: '#818CF8', dark: '#3730A3', contrastText: '#FFFFFF' }
            : { main: '#C9A962', light: '#E5D4A1', dark: '#A68B4B', contrastText: '#0D0D0D' },
          secondary: mode === 'light'
            ? { main: '#10B981', light: '#34D399', dark: '#047857', contrastText: '#0B1220' }
            : { main: '#8B7355', light: '#B0987A', dark: '#6B5344', contrastText: '#F5F0E8' },
          background: {
            default: mode === 'light' ? '#F8FAFC' : '#0D0D0D',
            paper: mode === 'light' ? '#FFFFFF' : '#161616',
          },
          text: {
            primary: mode === 'light' ? '#0F172A' : '#F5F0E8',
            secondary: mode === 'light' ? '#475569' : '#A8A29E',
          },
          divider: mode === 'light' ? 'rgba(2,6,23,0.08)' : 'rgba(255,255,255,0.08)',
          success: { main: '#10B981' },
          error: { main: '#EF4444' },
          warning: { main: '#F59E0B' },
          info: { main: '#3B82F6' },
          grey: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: 'Inter, Poppins, Roboto, Helvetica, Arial, sans-serif',
          h1: { fontFamily: 'Playfair Display, serif', fontWeight: 600, letterSpacing: '-0.5px', fontSize: '3rem' },
          h2: { fontFamily: 'Playfair Display, serif', fontWeight: 600, letterSpacing: '-0.4px', fontSize: '2.25rem' },
          h3: { fontFamily: 'Playfair Display, serif', fontWeight: 600, letterSpacing: '-0.3px', fontSize: '1.9rem' },
          h4: { fontFamily: 'Playfair Display, serif', fontWeight: 600, letterSpacing: '-0.2px', fontSize: '1.6rem' },
          h5: { fontWeight: 600, fontSize: '1.25rem' },
          h6: { fontWeight: 600, fontSize: '1.125rem' },
          subtitle1: { fontWeight: 500 },
          button: { textTransform: 'none', fontWeight: 600 },
        },
        shadows: [
          'none',
          mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.4)' : '0px 1px 2px rgba(16,24,40,0.06), 0px 1px 3px rgba(16,24,40,0.10)',
          mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.5)' : '0px 2px 4px rgba(16,24,40,0.06), 0px 2px 6px rgba(16,24,40,0.10)',
          ...Array(20).fill(mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.5)' : '0 6px 16px rgba(0,0,0,0.08)'),
        ],
        components: {
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
              root: {
                borderRadius: 10,
                paddingInline: 16,
                transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: (t) => t.shadows[2],
                },
              },
              sizeSmall: { paddingInline: 12, height: 34 },
              containedPrimary: { boxShadow: '0 8px 20px rgba(29,53,87,0.2)' },
              outlined: {
                '&:hover': {
                  transform: 'translateY(-1px)',
                  borderWidth: 1.5,
                },
              },
              text: {
                '&:hover': {
                  transform: 'translateY(-1px)',
                  backgroundColor: (t) => t.palette.action.hover,
                },
              },
            },
            variants: [
              { props: { variant: 'soft' }, style: { background: 'rgba(29,53,87,0.08)', color: '#1D3557' } },
            ],
          },
          MuiAppBar: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundImage: 'none',
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'saturate(180%) blur(8px)',
                WebkitBackdropFilter: 'saturate(180%) blur(8px)',
                borderBottom: `1px solid ${theme.palette.divider}`,
              }),
            },
          },
          MuiPaper: {
            styleOverrides: { rounded: { borderRadius: 16 } },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                border: (t) => `1px solid ${t.palette.divider}`,
              },
            },
          },
          MuiChip: {
            styleOverrides: { root: { borderRadius: 8 } },
          },
          MuiContainer: {
            defaultProps: { maxWidth: 'lg' },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: mode === 'light' ? '#1D3557' : '#A8DADC' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: mode === 'light' ? '#1D3557' : '#A8DADC' },
              },
              inputSizeSmall: { padding: '10px 12px' },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: { fontWeight: 500 },
            },
          },
          MuiLink: {
            styleOverrides: { root: { cursor: 'pointer', '&:hover': { textDecoration: 'underline' } } },
          },
          MuiTooltip: {
            styleOverrides: { tooltip: { borderRadius: 8, fontSize: 12, padding: '8px 10px' } },
          },
          MuiDivider: {
            styleOverrides: { root: { borderColor: 'divider' } },
          },
          MuiListItemButton: {
            styleOverrides: { root: { borderRadius: 10 } },
          },
          MuiTabs: {
            styleOverrides: {
              indicator: { height: 3, borderRadius: 3 },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: ({ theme }) => ({ borderRadius: 16, padding: theme.spacing(1) }),
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: ({ theme }) => ({ borderRadius: 12, border: `1px solid ${theme.palette.divider}` }),
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: ({ theme }) => ({ borderRight: `1px solid ${theme.palette.divider}` }),
            },
          },
          MuiPaginationItem: {
            styleOverrides: { root: { borderRadius: 10 } },
          },
          MuiBreadcrumbs: {
            styleOverrides: { separator: ({ theme }) => ({ color: theme.palette.text.disabled }) },
          },
        },
      });
      t = responsiveFontSizes(t);
      return t;
    },
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            '::selection': {
              background: theme.palette.mode === 'light' ? 'rgba(29,53,87,0.16)' : 'rgba(201,169,98,0.25)',
            },
            a: { color: theme.palette.primary.main },
            img: { display: 'block', maxWidth: '100%' },
            '*:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
            '.MuiButton-root, .MuiIconButton-root, .MuiCard-root, .MuiPaper-root': {
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            },
          }}
        />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
