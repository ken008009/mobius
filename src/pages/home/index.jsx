import React, {useState, useEffect, useContext} from 'react'
import StoreContext from '@store/context';
import bannerVideo from '@images/m/57a7bbbfe4a006fcf7e9e40af6230fb522625f0a.mp4'
import video1 from '@images/m/89be22823b99beac83496e29ae0da873e0799c85.mp4'
import video2 from '@images/m/cde96ae1fc733be6f4d295218a4d1626ae6dc94d.mp4'
import MoreArrowIcon from '@images/m/more-arrow-icon.svg?react'
import videoImage1 from '@images/m/m7.png'
import videoImage2 from '@images/m/m14.png'
import AboutListIcon1 from '@images/m/about-list-icon-1.svg?react'
import AboutListIcon3 from '@images/m/about-list-icon-3.svg?react'
import { ETH } from '@tools/contract'
import classnames from 'classnames'
import NoticeScroll from './components/noticeScroll'
import FireVideo from '@components/FireVideo'
import { showJoinTeamDialog } from '@components/JoinTeamDialog'
import './index.less'

const Home = (props) => {
  const [tab, setTab] = useState(1)
  const [priceA, setPriceA] = useState(0)
  const [balance, setBalance] = useState('0.0')
  const [isRegistered, setIsRegistered] = useState(false)
  const { state, dispatch } = useContext(StoreContext)

  const { t } = props
  // const { state } = props
  // console.log('state', state)

  useEffect(() => {
    // 检查钱包是否已连接，避免刷新后 signer 为 null 导致报错
    if (ETH.signer) {
      getGlobalView()
      checkUserRegistered()
    }
  }, [])

  const getGlobalView = async () => {
    try {
      // 确保钱包已连接
      if (!ETH.signer) return
      
      const globalView = await ETH.getGlobalView()
      const balance = await ETH.getTOKENBalance()

      const { priceA } = globalView

      // 格式化 BigNumber 为字符串，避免 React error #31
      setPriceA(ETH.formatToken(priceA, 18, 4))
      setBalance(balance)
    } catch (error) {
      console.error('getGlobalView error:', error)
    }
  }

  const checkUserRegistered = async () => {
    try {
      if (!ETH.signer) {
        await ETH.getAccount()
      }
      
      const userData = await ETH.userView()
      if (userData) {
        // 优先使用 bound 字段
        if (userData.bound !== undefined) {
          setIsRegistered(userData.bound)
        } else if (userData.parent && userData.parent !== '0x0000000000000000000000000000000000000000') {
          setIsRegistered(true)
        }
      }
    } catch (error) {
      console.error('检查用户绑定状态失败:', error)
    }
  }

  const handleGoStaking = async (e) => {
    e.preventDefault()
    
    // 检查是否已绑定上级
    if (!isRegistered) {
      showJoinTeamDialog({
        t,
        onSuccess: (address) => {
          console.log('绑定成功，上级地址:', address)
          setIsRegistered(true)
          // 绑定成功后跳转到理财页面
          props.navigate('/staking')
        }
      })
      return
    }
    
    // 已绑定，直接跳转
    props.navigate('/staking')
  }

  const nextSwitch = () => {
    if (tab === 3) {
      return setTab(1)
    }
    setTab(tab + 1)
  }

  return (
    <>
      <div className="home-page">
        <div className="banner">
          <video
            className="banner-video"
            autoPlay
            muted
            loop
            playsInline
            webkit-playsinline="true"
          >
            <source src={bannerVideo} type="video/mp4" />
          </video>
          {/* <img src={bannerText} className="banner-text" /> */}
          <div className="banner-text">
            <h3>{t('One Surface')}<br />{t('One Boundary')}</h3>
            <h2>{t('Infinite Loop')}</h2>
            <p>{t('Mobius Strip is built for an ecosystem that never stops')}.</p>
          </div>
        </div>

        <FireVideo />

        <a href="#" className="go-staking-btn" onClick={handleGoStaking}>
            <div className="go-staking-btn-text">开始理财</div>
        </a>

        <NoticeScroll {...props} />
        {/* <div className="notice-box">
          <div className="notice-title"><svg width="16px" height="16px" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#FFF"><path d="M1 13.8571V10.1429C1 9.03829 1.89543 8.14286 3 8.14286H5.9C6.09569 8.14286 6.28708 8.08544 6.45046 7.97772L12.4495 4.02228C13.1144 3.5839 14 4.06075 14 4.85714V19.1429C14 19.9392 13.1144 20.4161 12.4495 19.9777L6.45046 16.0223C6.28708 15.9146 6.09569 15.8571 5.9 15.8571H3C1.89543 15.8571 1 14.9617 1 13.8571Z" stroke="#FFF" strokeWidth="1.5"></path><path d="M17.5 7.5C17.5 7.5 19 9 19 11.5C19 14 17.5 15.5 17.5 15.5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M20.5 4.5C20.5 4.5 23 7 23 11.5C23 16 20.5 18.5 20.5 18.5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg></div>
          <div className="notice">
            <div className="notice-content">
              {t('The truly open-source large-scale card-based blockchain game project')}, {t('the MS Ecosystem')}, {t('will officially launch in April 2026')}! {t('It introduces six globally pioneering security protocols to ensure user interests and the safety of pooled funds. Stay tuned')}!
            </div>
          </div>
        </div> */}

        <div className="scroll-more"><MoreArrowIcon />{t('Scroll up to learn more')}</div>
        <div className="page-title title-1">
          <h3>{t('Built on BNB Chain')}</h3>
          <p>{t('Deployed on BSC (BNB Chain) for speed, scalability, and global accessibility. Fast transactions and low fees allow the ecosystem to support gaming, DeFi mechanics, and large-scale participation')}.</p>
        </div>
        <div className="video-1">
          <video
            className="video-content-1"
            autoPlay
            muted
            loop
            playsInline
            webkit-playsinline="true"
            poster={videoImage1}
          >
            <source src={video1} type="video/mp4" />
          </video>
        </div>
        <div className="page-title title-2">
          <h3>{t('GameFi')} + {t('DeFi Ecosystem')}</h3>
          <p>{t('Mobius Strip is an open blockchain ecosystem combining an on-chain card game with decentralized finance. Players, investors, and nodes interact in one continuous economic loop powered by the $MS token')}.</p>
        </div>
        <div className="page-list list-1">
          <div className="subtitle-1">{t('Security Protocols')}</div>
          <div className="security-protocol-item">
            <div className="protocol-header">
              <span className="protocol-label">A</span>
              <h3>{t('理财控进协议')}:</h3>
            </div>
            <p>{t('每天理财订单7天后释放')}</p>
          </div>

          <div className="security-protocol-item">
            <div className="protocol-header">
              <span className="protocol-label">B</span>
              <h3>{t('代币防暴跌协议')}:</h3>
            </div>
            <ul className="protocol-list">
              <li>
                <p>{'MS代币自由交易后价格累计下跌15%, 增加35%的滑点, 用于回购MS代币并打入黑洞'}</p>
              </li>
              <li>
                <p>{'MS代币自由交易后价格累计下跌30%, 增加50%的滑点, 用于回购MS代币并打入黑洞'}</p>
              </li>
              <li>
                <p>{'一:防暴跌启动以后13%盈利税取消'}</p>
                <p>{'二:新订单每日提U,手续费和盈利税正常,防暴跌结束每日提币'}</p>
                <p>{'三:动态奖励100%对冲盈利宝'}</p>
              </li>
            </ul>
          </div>

          <div className="about-list">
            <div className="about-list-item">
              <AboutListIcon1 />
              <p>{t('Reference price for price crash prevention')}</p>
              <p>${priceA}</p>
            </div>
            <div className="about-list-item">
              <AboutListIcon3 />
              <p>{t('Total number of black hole tokens')}</p>
              <p>{balance}</p>
            </div>
          </div>
        </div>
        <div className="footer-logo"></div>
      </div>
    </>
  )
}

export default Home;