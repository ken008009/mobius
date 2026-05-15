import React, {useState, useEffect, useContext} from 'react'
import StoreContext from '@store/context';
import bannerVideo from '@images/m/57a7bbbfe4a006fcf7e9e40af6230fb522625f0a.mp4'
import video1 from '@images/m/89be22823b99beac83496e29ae0da873e0799c85.mp4'
import video2 from '@images/m/cde96ae1fc733be6f4d295218a4d1626ae6dc94d.mp4'
import MoreArrowIcon from '@images/m/more-arrow-icon.svg?react'
import videoImage1 from '@images/m/m7.png'
import videoImage2 from '@images/m/m14.png'
import classnames from 'classnames'
import NoticeScroll from './components/noticeScroll'
import './index.less'

const Home = (props) => {
  const [tab, setTab] = useState(1)
  const { state, dispatch } = useContext(StoreContext)

  const { t } = props
  // const { state } = props
  // console.log('state', state)

  useEffect(() => {
  }, [])

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
          <ul>
            <li>
              <p>{t('Controlled Entry')}</p>
              <p>{t('Mechanisms designed to regulate how liquidity and capital enter the ecosystem')}, {t('helping maintain stability and sustainable growth')}.</p>
            </li>
            <li>
              <p>{t('Controlled Exit')}</p>
              <p>{t('Exit controls are designed to reduce sudden liquidity shocks and maintain long-term ecosystem balance')}.</p>
            </li>
            <li>
              <p>{t('Anti-Plunge System')}</p>
              <p>{t('An anti-dump architecture designed to reduce panic selling and prevent large holders from dramatically crashing the liquidity pool')}.</p>
            </li>
          </ul>
        </div>
        <div className="page-list list-2">
          <div className="subtitle-2">{t('Decentralized by Design')}</div>
          <div className="video-2">
            <video
              className="video-content-1"
              autoPlay
              muted
              loop
              playsInline
              webkit-playsinline="true"
              poster={videoImage2}
            >
              <source src={video2} type="video/mp4" />
            </video>
          </div>
          <div className="subtitle-3">{t('Genesis Node Rewards')}</div>
          <div className="switch-box">
            <div className="switch-main">
              <div className={classnames('switch-item', {active: tab === 1})}>
                <p>{t('Transaction Tax Dividends')}</p>
                <p>{t('Genesis nodes participate in revenue generated from transaction taxes within the ecosystem')}.</p>
              </div>
              <div className={classnames('switch-item', {active: tab === 2})}>
                <p>{t('Profit-Tax Bonus')}</p>
                <p>{t('Additional ecosystem profits may generate bonus rewards distributed to node participants')}.</p>
              </div>
              <div className={classnames('switch-item', {active: tab === 3})}>
                <p>{t('Node Rewards')}</p>
                <p>{t('Genesis nodes will receive slippage rewards provided by the system')}, {t('as well as daily airdrop rewards')}.</p>
              </div>
            </div>
            <div className="switch-footer">
              <ul>
                <li className={classnames({active: tab === 1})} onClick={() => setTab(1)}></li>
                <li className={classnames({active: tab === 2})} onClick={() => setTab(2)}></li>
                <li className={classnames({active: tab === 3})} onClick={() => setTab(3)}></li>
              </ul>
              <i className="switch-arrow" onClick={() => nextSwitch()}></i>
            </div>
          </div>
        </div>
        <div className="subtitle-4">{t('Genesis Nodes')}</div>
        <ul className="nodes-list">
          <li>
            <p>{t('Limited Supply')}</p>
            <p>{t('Only')} <span>500 {t('Genesis Nodes')}</span> {t('exist in the system, creating scarcity within the ecosystem')}.</p>
          </li>
          <li>
            <p>{t('Node Advantages')}</p>
            <p>{t('Each node will receive tax-based dividend distributions and earn MS token rewards from the reward pool')}.</p>
          </li>
          <li>
            <p>{t('LP Transparency')}</p>
            <p>{t('Node contributions strengthen the LP pool and support the overall stability of the Mobius Strip economy')}.</p>
          </li>
        </ul>
        <div className="footer-logo"></div>
      </div>
    </>
  )
}

export default Home;