import en from './messages/en.json';
import zh from './messages/zh.json';

import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async (locale) => {
  const messages = locale === 'en' ? en : zh;
  
  return {
    messages,
  };
});
