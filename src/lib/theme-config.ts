// lib/theme-config.ts

import { ThemeMeta, Theme } from '@/types/theme';

/** 所有可用主题列表 */
export const themes: ThemeMeta[] = [
  {
    id: 'starry',
    name: '星空',
    nameEn: 'Starry',
    description: '科技感、深邃，适合首页和Hero区域',
    previewColor: '#0d1b2a',
    memoryPoint: '流星划过、粒子星空',
  },
  {
    id: 'skyblue',
    name: '蓝天',
    nameEn: 'SkyBlue',
    description: '清新、明亮，适合产品详情页',
    previewColor: '#3b82f6',
    memoryPoint: '渐变天空、云朵光晕',
  },
  {
    id: 'nature',
    name: '自然',
    nameEn: 'Nature',
    description: '温暖、有机，适合About/Contact页面',
    previewColor: '#166534',
    memoryPoint: '纸张纹理、暖色光影',
  },
];

/** 默认主题 */
export const DEFAULT_THEME: Theme = 'starry';

/** 本地存储的key */
export const THEME_STORAGE_KEY = 'smart-cabinet-theme';
