// themes/colors.js
export const colorThemes = {
  light: {
    // Background
    background: {
      main: "from-amber-50 via-orange-50 to-yellow-50",
      orb1: "from-amber-400/40 to-orange-400/40",
      orb2: "from-yellow-400/40 to-amber-500/40",
      orb3: "from-orange-400/30 to-yellow-400/30",
      overlay: "from-black/10",
    },
    // Text colors
    text: {
      primary: "text-slate-900",
      secondary: "text-slate-700",
      muted: "text-slate-500",
      accent: "text-amber-600",
    },

    //icon colors
    icon: {
      primary: "bg-slate-900",
      secondary: "bg-slate-700",
      muted: "bg-slate-500",
    },
    // Card and component backgrounds
    card: {
      background: "bg-white/90 backdrop-blur-lg border border-amber-300/60",
      hover: "hover:shadow-amber-500/30 hover:border-orange-400/50",
    },
    // Form elements
    form: {
      background: "bg-white/90 backdrop-blur-lg border border-amber-300/60",
      focus: "border-orange-400/80 shadow-amber-500/40",
      button:
        "from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500",
    },

    select: {
      background: "bg-white",
      border: "border-amber-200",
      hover: "hover:border-amber-400",
      focus: "border-amber-500 ring-2 ring-amber-500/20",
      dropdown: "bg-white",
      dropdownBorder: "border-amber-200/80",
      dropdownShadow: "shadow-xl shadow-amber-500/10",
      option: {
        default: "hover:bg-amber-50",
        selected: "bg-amber-100 text-amber-800 font-medium",
        text: "text-slate-900",
        textMuted: "text-slate-500",
      },
    },
  },

  dark: {
    // Background
    background: {
      main: "from-gray-950 via-black to-gray-950",
      orb1: "from-amber-500/20 to-yellow-500/20",
      orb2: "from-yellow-500/20 to-orange-500/20",
      orb3: "from-orange-500/15 to-amber-500/15",
      overlay: "from-black/40",
    },
    // Text colors
    text: {
      primary: "text-white",
      secondary: "text-white/90",
      muted: "text-white/70",
      accent: "text-amber-300",
    },

    //icon colors
    icon: {
      primary: "bg-white",
      secondary: "bg-white/90",
      muted: "bg-white/70",
    },
    // Card and component backgrounds
    card: {
      background: "bg-gray-900/90 backdrop-blur-lg border border-amber-500/20",
      hover: "hover:shadow-amber-500/30 hover:border-amber-400/40",
    },
    // Form elements
    form: {
      background: "bg-gray-900/90 backdrop-blur-lg border border-amber-500/20",
      focus: "border-amber-400/70 shadow-amber-500/40",
      button:
        "from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500",
    },
    // Custom Select (solid backgrounds)
    select: {
      background: "bg-gray-900/90",
      border: "border-amber-500/30",
      hover: "hover:border-amber-400/50",
      focus: "border-amber-400 ring-2 ring-amber-400/30",
      dropdown: "bg-gray-900/95 backdrop-blur-lg",
      dropdownBorder: "border-amber-500/40",
      dropdownShadow: "shadow-2xl shadow-amber-500/20",
      option: {
        default: "hover:bg-amber-500/20",
        selected:
          "bg-amber-500/30 text-amber-200 font-medium border-l-2 border-amber-400",
        text: "text-white",
        textMuted: "text-amber-100/70",
      },
    },
  },
};

// Gradient configurations
export const gradients = {
  light: {
    heading: {
      primary: "from-amber-700 via-orange-600 to-yellow-700",
      secondary: "from-yellow-600 via-amber-600 to-orange-600",
    },
    highlight: "from-yellow-500 to-orange-500",
    progress: "from-amber-500 to-orange-600",
    glow: {
      emerald: "from-amber-400/40 via-orange-400/40 to-yellow-400/40",
      focus: "from-amber-400/50 via-orange-400/50 to-yellow-400/50",
    },
  },

  dark: {
    heading: {
      primary: "from-amber-300 via-yellow-200 to-orange-300",
      secondary: "from-yellow-300 via-amber-300 to-orange-400",
    },
    highlight: "from-yellow-400 to-orange-400",
    progress: "from-amber-400 to-orange-500",
    glow: {
      emerald: "from-amber-500/30 via-yellow-500/30 to-orange-500/30",
      focus: "from-amber-500/40 via-yellow-500/40 to-orange-500/40",
    },
  },
};

// Status colors (consistent across themes)
export const statusColors = {
  success: "text-amber-400",
  error: "text-rose-400",
  loading: "text-amber-300",
  pulse: "bg-amber-500",
};

// Trust signals colors
export const trustSignals = {
  light: {
    secure: "text-amber-600",
    email: "text-orange-600",
    rocket: "text-yellow-600",
  },
  dark: {
    secure: "text-amber-400",
    email: "text-yellow-400",
    rocket: "text-orange-400",
  },
};

// Theme context hook (for React)
type ThemeKey = keyof typeof colorThemes;

export const getThemeColors = (theme: ThemeKey = "dark") => {
  return {
    colors: colorThemes[theme],
    gradients: gradients[theme],
    status: statusColors,
    trust: trustSignals[theme],
  };
};
