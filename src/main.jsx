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

// 初始化钱包连接，确保 signer 存在后再渲染应用
const initWallet = async () => {
  // 检查本地是否有保存的钱包地址（说明用户之前连接过）
  const savedAccount = localStorage.getItem('account')
  
  if (savedAccount) {
    try {
      // 尝试重新连接钱包
      await ETH.getAccount()
      console.log('✅ 钱包自动重连成功:', ETH.account)
    } catch (error) {
      // 自动连接失败（用户可能锁定了钱包或拒绝了连接）
      console.log('⚠️ 钱包自动连接失败:', error.message || error)
      // 清除本地保存的地址，下次需要手动连接
      localStorage.removeItem('account')
    }
  }
  
  // 无论连接成功或失败，都渲染应用
  createRoot(document.getElementById('root')).render(
    <ConfigProvider locale={languageList[language] || enUS}>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </ConfigProvider>
  )
}

initWallet()
