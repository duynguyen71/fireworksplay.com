import { extendTheme } from "@chakra-ui/react";
import { g100 } from "@carbon/themes";

// Official Carbon Gray 100 tokens, applied to the existing Chakra components.
const field = {
  borderRadius: 0,
  bg: g100.field01,
  color: g100.textPrimary,
  border: "none",
  borderBottom: "1px solid",
  borderColor: g100.borderStrong01,
  _placeholder: { color: g100.textHelper, opacity: 1 },
  _focusVisible: { outline: `2px solid ${g100.focus}`, outlineOffset: "-2px", boxShadow: "none" },
};
const theme = extendTheme({
  config: { initialColorMode: "dark", useSystemColorMode: false },
  fonts: { heading: '"IBM Plex Sans", sans-serif', body: '"IBM Plex Sans", sans-serif' },
  radii: { xs: "0", sm: "0", base: "0", md: "0", lg: "0", xl: "0", "2xl": "0", "3xl": "0" },
  shadows: { xs: "none", sm: "none", base: "none", md: "none", lg: "none", xl: "none", "2xl": "none" },
  colors: {
    surface: g100.layer01,
    surfaceRaised: g100.layer02,
    foreground: g100.textPrimary,
    muted: g100.textSecondary,
    line: g100.borderSubtle01,
    accent: g100.linkPrimary,
    gray: { 50: "#f4f4f4", 100: "#e0e0e0", 200: "#c6c6c6", 300: "#a8a8a8", 400: "#8d8d8d", 500: "#6f6f6f", 600: "#525252", 700: "#393939", 800: "#262626", 900: "#161616" },
    blue: { 50: "#edf5ff", 100: "#d0e2ff", 200: "#a6c8ff", 300: "#78a9ff", 400: "#4589ff", 500: "#0f62fe", 600: "#0043ce", 700: "#002d9c", 800: "#001d6c", 900: "#001141" },
  },
  styles: { global: {
    ":root": {
      "--site-background": g100.background,
      "--site-layer": g100.layer01,
      "--site-hover": g100.layerHover01,
      "--site-text": g100.textPrimary,
      "--site-secondary": g100.textSecondary,
      "--site-border": g100.borderSubtle01,
      "--site-link": g100.linkPrimary,
      "--site-focus": g100.focus,
    },
    body: { bg: g100.background, color: g100.textPrimary, colorScheme: "dark" },
    "::selection": { bg: "#0043ce", color: "#ffffff" },
  } },
  components: {
    Heading: { baseStyle: { fontWeight: 400, color: "inherit" } },
    Text: { baseStyle: { opacity: 1 } },
    Link: { baseStyle: { color: g100.linkPrimary, _focusVisible: { outline: `2px solid ${g100.focus}`, outlineOffset: "2px" } } },
    Button: {
      baseStyle: { borderRadius: 0, fontWeight: 400, _focusVisible: { outline: `2px solid ${g100.focus}`, outlineOffset: "2px" }, _disabled: { bg: "#393939", color: "#a8a8a8", opacity: 1 } },
      defaultProps: { colorScheme: "blue" },
    },
    Input: { variants: { outline: { field }, filled: { field } }, defaultProps: { variant: "outline" } },
    Textarea: { variants: { outline: field }, defaultProps: { variant: "outline" } },
    Card: { baseStyle: { container: { bg: g100.layer01, borderRadius: 0, boxShadow: "none", border: `1px solid ${g100.borderSubtle01}` } } },
    Modal: { baseStyle: { dialog: { borderRadius: 0, bg: g100.layer01, color: g100.textPrimary } } },
  },
});
export default theme;
