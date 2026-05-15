import { Toast } from 'antd-mobile'
import { ETH } from "@tools/contract"
import i18next from '../i18n';

const { t } = i18next;

const fetchSign = async () => {
  let signStorage = localStorage.getItem('sign')
  const account = await ETH.getAccount();
  const accountLac = localStorage.getItem("account");

  if (account !== accountLac) {
    localStorage.removeItem('sign')
    signStorage = null
  }

  if (!signStorage) {
    try {
      const sign = await ETH.signMessage();
      localStorage.setItem('sign', sign)
      return sign
    } catch (error) {
      Toast.show(t('Signature failed')); // 显示失败的提示信息
      throw t('Signature failed') // 抛出错误信息
    }
  }
  return signStorage
}

export default fetchSign