import { THEME_COLORS } from "../constants/appConstants";

export type Theme = "light" | "dark";

export const getThemeColors = (theme: Theme) => {
  return THEME_COLORS[theme];
};

export const getThemeClass = (theme: Theme, baseClass: string) => {
  return theme === "dark" ? `${baseClass} dark` : baseClass;
};

export const getGridColor = (theme: Theme) => {
  return getThemeColors(theme).GRID_COLOR;
};

export const getBackgroundColor = (theme: Theme) => {
  return getThemeColors(theme).BACKGROUND;
};
