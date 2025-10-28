import type { Theme } from '@mui/material/styles';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Central source of truth for product colors. Always try to map new UI to an
// existing token first; add new ones only after aligning with design so we keep
// the palette intentional and consistent.
const designTokens = {
  /* Background tokens: use for surfaces and section gradients, not component chrome. */
  backgroundBody: '#f7f9fc',
  backgroundHeroStart: '#edf1f7',
  backgroundHeroEnd: '#e0e4eb',
  /* Brand color tokens: primary actions and key brand accents. */
  brandPrimary: '#0f172a',
  // brandPrimary: '#f0572a',
  brandPrimaryHover: '#0c1422',
  brandPrimaryActive: '#090f19',
  brandAccent: '#1a4d8f',
  /* Status tokens: map success/positive messaging here before adding new status colors. */
  brandSuccess: '#047857',
  /* Neutral tokens: borders, surfaces, and text neutrals should lean on these shades. */
  borderMuted: '#d6dce7',
  borderPanel: '#dbe3f3',
  borderLight: '#dde3ee',
  borderCard: '#d0d7e3',
  surface: '#ffffff',
  surfaceSubtle: '#f1f5f9',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textDisabled: '#94a3b8',
  textInverse: '#ffffff',
  /* Focus + overlay tokens: accessibility affordances and depth effects. */
  focusRingSubtle: 'rgba(26, 77, 143, 0.15)',
  focusRingStrong: 'rgba(26, 77, 143, 0.35)',
  overlayShadow: 'rgba(15, 23, 42, 0.08)',
  overlayShadowSoft: 'rgba(15, 23, 42, 0.06)',
  overlayShadowStrong: 'rgba(15, 23, 42, 0.2)',
};

// Build gradient helpers out of tokens so we can tweak colors in one place.
const gradients = {
  hero: (angle = '180deg') =>
    `linear-gradient(${angle}, ${designTokens.backgroundHeroStart} 0%, ${designTokens.backgroundHeroEnd} 100%)`,
};

let theme = createTheme({
  spacing: 4,
  palette: {
    mode: 'light',
    primary: {
      main: designTokens.brandPrimary,
      dark: designTokens.brandPrimaryHover,
      contrastText: designTokens.textInverse,
    },
    secondary: {
      main: designTokens.brandAccent,
    },
    success: {
      main: designTokens.brandSuccess,
    },
    info: {
      main: designTokens.brandAccent,
    },
    text: {
      primary: designTokens.textPrimary,
      secondary: designTokens.textSecondary,
      disabled: designTokens.textDisabled,
    },
    divider: designTokens.borderLight,
    background: {
      default: designTokens.backgroundBody,
      paper: designTokens.surface,
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: designTokens.backgroundBody,
          color: designTokens.textPrimary,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: 'contained',
      },
      styleOverrides: {
        root: {
          paddingInline: 16, // 16 means 1rem
        },
        containedSecondary: {
          color: designTokens.textPrimary,
          backgroundColor: designTokens.surface,
          border: `1px solid ${designTokens.brandAccent}`,
          '&:hover': {
            backgroundColor: designTokens.surfaceSubtle,
            borderColor: designTokens.brandAccent,
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: {
          boxShadow: `0 12px 28px ${designTokens.overlayShadowSoft}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        // root: {
          // borderRadius: 16,
        // },
        notchedOutline: {
          borderColor: designTokens.borderPanel,
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

// Extend the theme with custom properties
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      designTokens: typeof designTokens;
      gradients: typeof gradients;
    };
  }
  interface ThemeOptions {
    custom?: {
      designTokens?: typeof designTokens;
      gradients?: typeof gradients;
    };
  }
}

theme.custom = {
  designTokens,
  gradients,
};

export { designTokens, gradients };
export default theme as Theme;

