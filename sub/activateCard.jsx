import React, { useState, useEffect } from 'react'
import SubHeader from './components/subHeader'
import { Tabs, Toast } from 'react-vant'
import { fetchActivateCard } from '@services/api'
import getSign from '@tools/sign'
import './styles/activateCard.less'

const ActivateCard = (props) => {
  const [aText, setAText] = useState('')
  const [bText, setBText] = useState('')
  const [active, setActive] = useState('1')
  const [loading, setLoading] = useState(false)

  const { t } = props

  useEffect(() => {}, [])

  const handleTabChange = (value) => {
    setActive(value)

    if (value === '2') {
      setBText('')
    } else {
      setAText('')
    }
  }

  const handleConfirm = async () => {
    if (active === '1' && !aText) return Toast.info(t('请输入实体卡号'))
    if (active === '2' && !bText) return Toast.info(t('请输入虚拟卡号'))

    setLoading(true)

    Toast.loading({
      message: t('激活中') + '...',
      forbidClick: true,
    })

    try {
      const sign = await getSign()

      fetchActivateCard({
        sign,
        checkType: active,
        num: active === '1' ? aText : bText,
      }).then(res => {
        if (res.status === 'ok') {
          Toast.success(t('激活成功'))
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
      <SubHeader title={t('激活卡片')} {...props} />
      <div className="activate-card">
        <Tabs active={active} onChange={value => handleTabChange(value)}>
          <Tabs.TabPane name="1" title={t('实体卡')}>
            <div className="card-form">
              <input value={aText} onChange={e => setAText(e.target.value)} placeholder={t('请输入实体卡号')} />
              <button className="confirm-activate-btn" disabled={loading} onClick={() => handleConfirm()}>{t('确认激活')}</button>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane name="2" title={t('虚拟卡')}>
            <div className="card-form">
              <input value={bText} onChange={e => setBText(e.target.value)} placeholder={t('请输入虚拟卡号')} />
              <button className="confirm-activate-btn" disabled={loading} onClick={() => handleConfirm()}>{t('确认激活')}</button>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </>
  )
}

export default ActivateCard
