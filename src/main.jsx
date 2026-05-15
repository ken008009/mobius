import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'react-vant';
import enUS from 'react-vant/es/locale/lang/en-US';
import zhCN from 'react-vant/es/locale/lang/zh-CN';
import App from './App.jsx'
import i18n from './i18n'
import { I18nextProvider } from 'react-i18next';
import { ETH } from '@tools/contract'
import '@styles/global.less'

const language = localStorage.getItem('language') || 'en'

const languageList = {
  en: enUS,
  zh: zhCN
}

const getAccount = async () => {
  await ETH.getAccount();
}

getAccount()

createRoot(document.getElementById('root')).render(
  <ConfigProvider locale={languageList[language] || enUS}>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </ConfigProvider>
)
