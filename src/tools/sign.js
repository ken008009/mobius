import { Toast } from 'react-vant'
import { ETH } from "@tools/contract"

export default async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const sign = await ETH.signMessage()

      resolve(sign)
    } catch (error) {
      reject(error)
      Toast.info('Signature failed');
    }
  })
}