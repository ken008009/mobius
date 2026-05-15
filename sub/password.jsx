import React, {useState, useEffect} from 'react'
import SubHeader from './components/subHeader'
import { Tabs, Empty,Toast } from 'react-vant'
import { fetchResetPassword } from '@services/api'
import './styles/password.less'

const Password = (props) => {
  const [aText, setAText] = useState('')
  const [bText, setBText] = useState('')
  const [active, setActive] = useState('1')
  const [loading, setLoading] = useState(false)

  const { address, cardStatus, cardStatusTwo } = props.state

  const { t } = props

  useEffect(() => {
  }, [])

  const handleTabChange = (value) => {
    setActive(value)

    if (value === '2') {
      setBText('')
    } else {
      setAText('')
    }
  }

  const handleConfirm = async () => {
    if (active === '1' && !aText) return Toast.info(t('输入PIN码'))
    if (active === '2' && !bText) return Toast.info(t('输入PIN码'))

    setLoading(true)

    Toast.loading({
      message: t('修改中') + '...',
      forbidClick: true,
    })

    try {
      const sign = await getSign()

      fetchResetPassword({
        sign,
        cardType: active === '1' ? '1' : '0',
        pin: active === '1' ? aText : bText,
      }).then(res => {
        if (res.status === 'ok') {
          Toast.success(t('修改成功'))
        }
      }).finally(() => {
        setLoading(false)
      });
    } catch (error) {
      setLoading(false)
    }
  }

  return (
    <>
      <SubHeader title={t('修改密码')} {...props} />
      <div className="password-page">
        <Tabs active={active} onChange={value => handleTabChange(value)}>
          <Tabs.TabPane name="1" title={t('实体卡')}>
            {
              cardStatus === '2' ? (
                <div className="card-form">
                  <input value={aText} onChange={e => setAText(e.target.value)} placeholder={t('输入PIN码(六位纯数字)')} />
                  <button className="confirm-activate-btn" disabled={loading} onClick={() => handleConfirm()}>{t('确认修改')}</button>
                </div>
              ) : (
                <Empty description={t('未开通实体卡')} />
              )
            }
          </Tabs.TabPane>
          <Tabs.TabPane name="2" title={t('虚拟卡')}>
            {
              cardStatusTwo === '2' ? (
                <div className="card-form">
                  <input value={bText} onChange={e => setBText(e.target.value)} placeholder={t('输入PIN码(六位纯数字)')} />
                  <button className="confirm-activate-btn" disabled={loading} onClick={() => handleConfirm()}>{t('确认修改')}</button>
                </div>
              ) : (
                <Empty description={t('未开通实体卡')} />
              )
            }
          </Tabs.TabPane>
        </Tabs>
      </div>
    </>
  )
}

export default Password;