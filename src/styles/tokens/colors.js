// Raw brand colors - single source of truth
export const brandColors = {
  blue: {
    primary: '#2c83d4',    // Main brand blue, buttons, headers
    bright: '#0099CC',     // Accents, canvas controls, transform widget
    dark: '#0F6ACB',       // Scrollbar, darker variant
    navy: '#012457',       // App background
    slate: '#295b88',      // Dialogue panels
    medium: '#48759e',     // Medium blue variant
  },
  orange: {
    primary: '#ff9900',    // Primary orange, active states, phonetic buttons
    dark: '#ff6600',       // Darker orange variant, red button text
    light: '#ffcc00',      // Light orange, tertiary button border
  },
  green: {
    primary: '#339900',    // Primary green button
    light: '#44be06',      // Light green variant, range thumb
    material: '#4CAF50',   // Material design green, UI button
  },
  red: {
    primary: '#cc0000',    // Error states, red button background
    dark: '#9F051E',       // Dark red variant (brush SVG)
  },
  // Neutrals
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f8fafc',
    100: '#ddd',
    200: '#ccc',
    300: '#aaa',
    400: '#999',
    500: '#666',
    600: '#333',
    700: '#2a2a2a',
  },
};

// Semantic color mappings for common use cases
export const colors = {
  // Interactive elements
  interactive: {
    primary: brandColors.blue.primary,
    primaryHover: brandColors.blue.dark,
    accent: brandColors.blue.bright,
    accentHover: brandColors.blue.dark,
  },

  // Buttons
  button: {
    primary: brandColors.blue.primary,
    primaryText: brandColors.white,
    secondary: 'transparent',
    secondaryText: brandColors.white,
    tertiary: brandColors.orange.light,
    tertiaryText: brandColors.white,
    greenBg: brandColors.green.primary,
    greenUiBg: brandColors.green.material,
    redBg: brandColors.red.primary,
    redBorder: brandColors.orange.dark,
    redText: brandColors.orange.dark,
  },

  // States
  state: {
    success: brandColors.green.material,
    warning: brandColors.orange.primary,
    error: brandColors.red.primary,
    info: brandColors.blue.bright,
    active: brandColors.orange.primary,
    selected: brandColors.orange.primary,
    disabled: brandColors.gray[300],
  },

  // Backgrounds
  background: {
    app: brandColors.blue.navy,
    canvas: brandColors.white,
    canvasIcon: 'rgb(0, 153, 204)', // Canvas icon background (rgb format preserved)
    panel: brandColors.blue.slate,
    dialogue: brandColors.blue.slate,
    menu: brandColors.white,
    toolbar: brandColors.blue.primary,
    overlay: brandColors.black, // use with opacity
    dark: brandColors.black, // use with opacity
    lightPanel: brandColors.gray[100],
    darkUi: brandColors.gray[700],
  },

  // Borders & Lines
  border: {
    default: brandColors.gray[200],
    light: brandColors.gray[100],
    medium: brandColors.gray[300],
    dark: brandColors.gray[400],
    active: brandColors.orange.primary,
    selected: brandColors.orange.primary,
    focus: brandColors.blue.bright,
    white: brandColors.white,
  },

  // Text
  text: {
    primary: brandColors.black,
    secondary: brandColors.gray[500],
    tertiary: brandColors.gray[400],
    inverse: brandColors.white,
    disabled: brandColors.gray[400],
    darkGray: brandColors.gray[600],
  },

  // Special UI elements
  ui: {
    canvasControl: brandColors.blue.bright,
    transformWidget: brandColors.blue.bright,
    progressBar: brandColors.green.material,
    phonetic: brandColors.orange.primary,
    phoneticPot: brandColors.white,
    phoneticPotText: brandColors.gray[600],
    menuHeader: brandColors.blue.primary,
    toolbarLabel: brandColors.blue.primary,
    scrollbarTrack: brandColors.gray[100],
    scrollbarHandle: brandColors.blue.dark,
    rangeThumb: brandColors.green.light,
  },

  // Legacy compatibility (original structure)
  primary: {
    50: '#f0f9ff',
    500: '#3b82f6',
    900: '#1e3a8a'
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    500: '#64748b',
    900: '#0f172a'
  },
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  }
};

// Opacity helpers (hex values for transparency)
export const opacity = {
  light: '11',           // ~7%  - very subtle shadows
  subtle: '22',          // ~13% - subtle overlays
  soft: '33',            // ~20% - soft backgrounds
  medium: '44',          // ~27% - medium overlays
  semiTransparent: 'aa', // ~67% - semi-transparent backgrounds
  mostlyOpaque: 'CC',    // ~80% - mostly opaque overlays
};

// Utility function for creating colors with opacity
export const withOpacity = (hexColor, opacityHex) => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  return `#${hex}${opacityHex}`;
};

// Common transparent color combinations (for convenience)
export const transparentColors = {
  overlayDark: withOpacity(brandColors.black, opacity.mostlyOpaque),        // #000000CC
  overlayMedium: withOpacity(brandColors.black, opacity.medium),            // #00000044
  overlaySubtle: withOpacity(brandColors.black, opacity.subtle),            // #00000022
  overlayVerySubtle: withOpacity(brandColors.black, opacity.light),         // #00000011
  backgroundWhiteSemi: withOpacity(brandColors.white, opacity.semiTransparent), // #ffffffaa
  backgroundWhiteSoft: withOpacity(brandColors.white, opacity.soft),        // #ffffff33
  backgroundWhiteSubtle: withOpacity(brandColors.white, opacity.subtle),    // #ffffff22
  shadowLight: withOpacity(brandColors.black, opacity.subtle),              // #00000022
  shadowMedium: withOpacity(brandColors.black, opacity.medium),             // #00000044
};

// For backwards compatibility
export default colors;
