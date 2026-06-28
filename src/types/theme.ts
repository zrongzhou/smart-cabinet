// types/theme.ts

/** 支持的主题列表 */
export type Theme = 'starry' | 'skyblue' | 'nature';

/** 主题元信息（用于ThemeSwitcher展示） */
export interface ThemeMeta {
  id: Theme;
  name: string;           // 显示名称（如 "星空"）
  nameEn: string;         // 英文名称（如 "Starry"）
  description: string;    // 简短描述
  previewColor: string;   // 预览色（用于主题切换器的小圆点）
  memoryPoint: string;    // 记忆点描述（如 "流星划过"）
}

/** ThemeContext 的返回值类型 */
export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: ThemeMeta[];    // 所有可用主题列表
}
