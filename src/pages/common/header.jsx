import React, {useState, useEffect, useContext} from 'react'
import { Popup, Toast, Picker } from 'antd-mobile'
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ETH } from '@tools/contract'
import StoreContext from '@store/context';
import classnames from 'classnames'
import MenuIcon from '@images/m/menu-icon.svg?react'
import MenuLogo from '@images/m/menu-logo.svg?react'
import MenuCloseIcon from '@images/m/menu-close-icon.svg?react'
import './styles/header.less'

const basicColumns = [
  [
    {
      label: 'English',
      value: 'en'
    },
    {
      label: 'العربية',
      value: 'ar'
    },
    {
      label: 'English (India)',
      value: 'en-IN'
    },
    {
      label: 'English (Singapore)',
      value: 'en-SG'
    },
    {
      label: 'English (US)',
      value: 'en-US'
    },
    {
      label: '日本語',
      value: 'ja'
    },
    {
      label: '한국어',
      value: 'ko'
    },
    {
      label: 'Bahasa Melayu',
      value: 'ms'
    },
    {
      label: 'Русский',
      value: 'ru'
    },
    {
      label: 'ไทย',
      value: 'th'
    },
    {
      label: 'اردو',
      value: 'ur'
    },
    {
      label: '简体中文',
      value: 'zh-CN'
    },
    {
      label: '繁體中文',
      value: 'zh-HK'
    }
  ]
]

const Header = (props) => {
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [code, setCode] = useState('')
  const { state, dispatch } = useContext(StoreContext)
  const [visible, setVisible] = useState(false)
  const [language, setLanguage] = useState([localStorage.getItem('language') || 'en'])
  const [pickerVisible, setPickerVisible] = useState(false)
  const { t, i18n } = useTranslation();
  const { formatAddress } = props

  const { address } = state

  const location = useLocation();

  useEffect(() => {
    console.log('location', location.pathname)
  }, [location])

  const getNumber = (number, digits = 2) => {
    if (digits === 0) {
      return Number(ETH.formatUnits(number)).toLocaleString('en-US', {
        maximumFractionDigits: 0
      });
    }
    return Number(ETH.formatUnits(number)).toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  const handleCreateLink = async () => {
    try {
      localStorage.setItem('address', ETH.account)

      dispatch({
        type: 'SET_DATA',
        payload: {
          address: ETH.account
        }
      })

      // setShow(true)
    } catch (error) {
      console.log(error)
    }
  }

  const confirmCode = async () => {
    if (loading) return
    setLoading(true)
    const isAddress = await ETH.isAddress(code)

    if (isAddress) {
      try {
        await ETH.register(code)

        setTimeout(() => {
          handleCreateLink()
          setShow(false)
          setLoading(false)
        }, 2000)
      } catch (error) {
        console.log(444, error)
        setLoading(false)
      }
    } else {
      Toast.show(t('Please enter a valid invitation code'))
      setLoading(false)
    }
  }

  const openPage = (url) => {
    if (location.pathname === url) return setVisible(false)
    props.navigate(url)
  }

  return (
    <>
      <div className="header">
        <div className="fixed-header">
          <div className="sign">
            <i className="logo" onClick={() => props.navigate('/')}></i>
          </div>
          <div className="tools">
            {
              !address ? <button className="create-link-btn" onClick={handleCreateLink}>{t('JOIN')}</button> : <span className="create-link-btn">{formatAddress(address)}</span>
            }
            <MenuIcon onClick={() => setVisible(true)} />
          </div>
        </div>
      </div>
      <Popup
        visible={visible}
        onMaskClick={() => {
          setVisible(false)
        }}
        position='left'
        bodyStyle={{ width: '100vw' }}
      >
        <div className="sidebar">
          <MenuCloseIcon className="menu-close-btn" onClick={() => setVisible(false)} />
          <div className="menu-logo">
            <MenuLogo />
          </div>
          <div className="menu-list">
            <div className={classnames('menu-item', {active: location.pathname === '/'})} onClick={() => openPage('/')}>{t('HOME')}</div>
            <div className={classnames('menu-item', {active: location.pathname === '/about'})} onClick={() => openPage('/about')}>{t('ABOUT')}</div>
            <div className={classnames('menu-item', {active: location.pathname === '/staking'})} onClick={() => openPage('/staking')}>{t('STAKING')}</div>
            <div className={classnames('menu-item', {active: location.pathname === '/community'})} onClick={() => openPage('/community')}>{t('COMMUNITY')}</div>
            <div className={classnames('menu-item', {active: location.pathname === '/nodes'})} onClick={() => openPage('/nodes')}>{t('NODES')}</div>
            <div className={classnames('menu-item', {active: location.pathname === '/courses'})} onClick={() => openPage('/courses')}>{t('COURSES')}</div>
            <div className={classnames('menu-item', {active: location.pathname === '/hls'})} onClick={() => openPage('/hls')}>{t('HLS')}</div>
          </div>
          <div className="sidebar-foot">
            <button className="language-btn" onClick={() => setPickerVisible(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" width="20px" height="20px" focusable="false"><path fill="currentColor" d="M16.578 15.733a8.65 8.65 0 0 0 2.144-5.726 8.66 8.66 0 0 0-2.553-6.163 8.66 8.66 0 0 0-6.056-2.552.8.8 0 0 0-.239 0 8.66 8.66 0 0 0-6.032 2.552A8.66 8.66 0 0 0 1.291 9.89a.8.8 0 0 0 0 .2 8.66 8.66 0 0 0 2.551 6.08 8.66 8.66 0 0 0 6.164 2.553 8.66 8.66 0 0 0 6.51-2.921.4.4 0 0 0 .062-.07M2.098 10.39h3.663c.025 1.283.18 2.486.44 3.557-1.206.326-1.97.75-2.366 1.014a7.88 7.88 0 0 1-1.737-4.57m1.728-5.325c.392.265 1.157.693 2.37 1.021A16.7 16.7 0 0 0 5.76 9.59H2.1a7.88 7.88 0 0 1 1.726-4.525M17.912 9.59H14.25a16.7 16.7 0 0 0-.435-3.503c1.21-.326 1.977-.75 2.375-1.016a7.88 7.88 0 0 1 1.72 4.52m-4.461 0h-3.057V6.543a15 15 0 0 0 2.642-.274 16 16 0 0 1 .415 3.321m-3.057-3.847V2.146c.72.203 1.421.96 1.971 2.148q.258.56.458 1.202c-.684.132-1.49.227-2.43.247m-.8-3.59v3.59a14.3 14.3 0 0 1-2.405-.25q.2-.641.458-1.199C8.19 3.12 8.883 2.365 9.594 2.152m0 4.39V9.59H6.561c.027-1.176.17-2.303.415-3.322.739.147 1.608.252 2.618.274M6.56 10.39h3.034v3.1a15 15 0 0 0-2.614.275 16 16 0 0 1-.42-3.375m3.034 3.9v3.572c-.711-.213-1.404-.968-1.947-2.142a10 10 0 0 1-.453-1.183 14.4 14.4 0 0 1 2.4-.248m.8 3.579v-3.581c.935.02 1.74.114 2.424.247a10 10 0 0 1-.453 1.185c-.55 1.187-1.252 1.945-1.971 2.149m0-4.38V10.39h3.057a16 16 0 0 1-.418 3.37 15 15 0 0 0-2.64-.272m3.857-3.099h3.662a7.88 7.88 0 0 1-1.73 4.563c-.4-.267-1.165-.69-2.37-1.013.258-1.07.412-2.27.438-3.55m1.404-5.924c-.358.226-1.022.574-2.048.85-.377-1.232-.901-2.246-1.525-2.949a7.9 7.9 0 0 1 3.573 2.1M7.93 2.367c-.623.702-1.147 1.714-1.523 2.943-1.024-.278-1.687-.626-2.043-.85A7.9 7.9 0 0 1 7.93 2.366M4.373 15.564c.357-.225 1.018-.57 2.038-.846.376 1.223.898 2.23 1.519 2.929a7.9 7.9 0 0 1-3.557-2.083m7.709 2.083c.621-.7 1.143-1.707 1.52-2.931 1.015.274 1.678.618 2.041.844a7.9 7.9 0 0 1-3.561 2.087"></path></svg>
              <span>{basicColumns[0].find(item => item.value === language[0])?.label}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" width="16px" height="16px" focusable="false"><path fill="currentColor" d="m3.54 6.46.92-.92L8 9.08l3.54-3.54.92.92L8 10.92z"></path></svg>
            </button>
          </div>
        </div>
      </Popup>
      <Picker
        columns={basicColumns}
        visible={pickerVisible}
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        onClose={() => {
          setPickerVisible(false)
        }}
        value={language}
        onConfirm={v => {
          setLanguage(v)
          localStorage.setItem('language', v[0])
          i18n.changeLanguage(v[0])
        }}
      />
    </>
  )
}

export default Header;