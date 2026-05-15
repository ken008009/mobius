import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en/translation.json';
import ar from '../locales/ar/translation.json';
import enIN from '../locales/en-IN/translation.json';
import enSG from '../locales/en-SG/translation.json';
import ja from '../locales/ja/translation.json';
import ko from '../locales/ko/translation.json';
import ms from '../locales/ms/translation.json';
import ru from '../locales/ru/translation.json';
import th from '../locales/th/translation.json';
import ur from '../locales/ur/translation.json';
import zhCN from '../locales/zh-CN/translation.json';
import zhHK from '../locales/zh-HK/translation.json';

const savedLanguage = localStorage.getItem('language') || 'en';
// 语言资源
const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
  'en-IN': {
    translation: enIN,
  },
  'en-SG': {
    translation: enSG,
  },
  ja: {
    translation: ja,
  },
  ko: {
    translation: ko,
  },
  ms: {
    translation: ms,
  },
  ru: {
    translation: ru,
  },
  th: {
    translation: th,
  },
  ur: {
    translation: ur,
  },
  'zh-CN': {
    translation: zhCN,
  },
  'zh-HK': {
    translation: zhHK,
  }
};

i18next
  .use(initReactI18next)  // 将 i18next 和 React 连接
  .init({
    lng: savedLanguage,  // 默认语言
    fallbackLng: 'en',  // 如果当前语言没有翻译，使用的回退语言
    resources,
    keySeparator: false,  // 关闭键分隔符（如果不需要嵌套）
    interpolation: {
      escapeValue: false,  // 不需要转义
    },
    react: {
      useSuspense: false,  // 关闭 Suspense
    },
    parseMissingKeyHandler: (key) => {
      return key; // 没有翻译就返回原文
    },
    returnNull: false,
    returnEmptyString: false,
  });

export default i18next;