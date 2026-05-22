import React, { useState } from 'react'
import { Input, Button, Dialog, Toast } from 'antd-mobile'
import { X } from 'lucide-react'
import { ETH } from '@tools/contract'
import './index.less'

const JoinTeamForm = (props) => {
  const [address, setAddress] = useState('')
  const { t, onClose, onSuccess } = props

  const handleSubmit = async () => {
    if (!address) {
      Toast.show({
        content: t('Please enter the Team address')
      })
      return
    }

    // 验证地址格式
    if (!await ETH.isAddress(address)) {
      Toast.show({
        content: t('Invalid address format')
      })
      return
    }

    let toast
    try {
      toast = Toast.show({
        icon: 'loading',
        maskClickable: false,
        content: t('Joining...'),
      })

      // 确保钱包已连接
      if (!ETH.signer) {
        await ETH.getAccount()
      }

      // 调用 userContract 的 bind 方法绑定上级
      await ETH.bind(address)
      
      toast.close()
      Toast.show({
        icon: 'success',
        content: t('Operation Success'),
      })

      // 调用成功回调
      onSuccess && onSuccess(address)
      onClose && onClose()
    } catch (error) {
      console.error('绑定失败:', error)
      if (toast) {
        toast.close()
      }
      Toast.show({
        icon: 'fail',
        content: error.message || t('Operation Failed'),
      })
    }
  }

  return (
    <div className="join-team-form">
      <X className="close-btn" onClick={() => onClose && onClose()} />
      <p className="form-title">{t('Input Team Address')}</p>
      <Input 
        className="form-input" 
        placeholder={t('Enter team address')}
        onChange={(value) => setAddress(value)} 
      />
      <Button className="form-btn" onClick={handleSubmit}>
        {t('Confirm')}
      </Button>
    </div>
  )
}

/**
 * 显示绑定上级弹窗
 * @param {Object} options - 配置选项
 * @param {Function} options.t - 国际化翻译函数
 * @param {Function} options.onSuccess - 绑定成功回调，参数为绑定的地址
 */
export const showJoinTeamDialog = (options = {}) => {
  const { t, onSuccess } = options

  const dialog = Dialog.show({
    header: null,
    title: null,
    content: (
      <JoinTeamForm 
        t={t}
        onClose={() => dialog.close()}
        onSuccess={(address) => {
          onSuccess && onSuccess(address)
          dialog.close()
        }}
      />
    ),
    actions: [],
    className: 'join-team-dialog'
  })

  return dialog
}

export default JoinTeamForm
