// constants/theme.ts
export const Colors = {
  primary: "#2d5a27",
  primaryLight: "#4a7c42",
  primaryDark: "#1a3a1a",
  primaryMuted: "#e8f0e6",
  accent: "#c8860a",
  accentLight: "#f0a832",
  accentMuted: "#fef3e2",
  sand: "#f5f0e8",
  cream: "#fafaf7",
  white: "#ffffff",
  successBg: "#e8f5e9",
  warningBg: "#fff3e0",
  dangerBg: "#ffebee",
  criticalBg: "#f3e5f5",
  textPrimary: "#1a2e1a",
  textSecondary: "#4a5e4a",
  textMuted: "#7a8e7a",
  border: "#d4e2d0",
  borderLight: "#eaf2e8",
  severityLow: "#388e3c",
  severityModerate: "#f57c00",
  severityHigh: "#c62828",
  severityCritical: "#6a1b9a",
};

export const Typography = {
  fontDisplay: "Georgia",
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    heavy: "800" as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 100,
};

export const Shadow = {
  sm: {
    shadowColor: "#1a3a1a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#1a3a1a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#1a3a1a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

export function getSeverityColor(severity: string): string {
  const map: Record<string, string> = {
    Low: Colors.severityLow,
    Moderate: Colors.severityModerate,
    High: Colors.severityHigh,
    Critical: Colors.severityCritical,
  };
  return map[severity] ?? Colors.textMuted;
}

export function getSeverityBg(severity: string): string {
  const map: Record<string, string> = {
    Low: Colors.successBg,
    Moderate: Colors.warningBg,
    High: Colors.dangerBg,
    Critical: Colors.criticalBg,
  };
  return map[severity] ?? Colors.sand;
}

export function getSeverityIcon(severity: string): string {
  const map: Record<string, string> = {
    Low: "🟢",
    Moderate: "🟡",
    High: "🔴",
    Critical: "🟣",
  };
  return map[severity] ?? "⚪";
}

export function getSpreadColor(spread: string): string {
  const map: Record<string, string> = {
    Low: Colors.severityLow,
    Moderate: Colors.severityModerate,
    High: Colors.severityHigh,
  };
  return map[spread] ?? Colors.textMuted;
}