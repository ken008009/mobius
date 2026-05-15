import React, {useState, useEffect} from 'react'
import { Button, Toast } from 'react-vant'
import SubHeader from './components/subHeader'
import copy from 'copy-to-clipboard';
import './styles/invite.less'

const Invite = (props) => {
  const {t} = props

  useEffect(() => {
  }, [])

  const {address} = props.state

  const copyLink = () => {
    copy(`${window.location.host}/?code=${address}`)

    Toast.info(t('复制链接成功'))
  }

  return (
    <>
      <SubHeader title={t('邀请链接')} {...props} />
      <div className="invite-page">
        <i className="share-pic"></i>
        <input type="text" value={`${window.location.host}/?code=${address}`} />
        <Button type="primary" className="copy-btn" onClick={copyLink}>{t('立即邀请')}</Button>
      </div>
    </>
  )
}

export default Invite;