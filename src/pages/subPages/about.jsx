import React, {useState, useEffect} from 'react'
import AboutListIcon1 from '@images/m/about-list-icon-1.svg?react'
import AboutListIcon2 from '@images/m/about-list-icon-2.svg?react'
import AboutListIcon3 from '@images/m/about-list-icon-3.svg?react'
import AboutListIcon4 from '@images/m/about-list-icon-4.svg?react'
import AboutImage from '@images/m/about-image-1.png'
import { ETH } from '@tools/contract'
import './styles/about.less'

const About = (props) => {
  const [priceA, setPriceA] = useState(0)
  const [reserveUCurrent, setReserveUCurrent] = useState(0)
  const [perf, setPerf] = useState(0)
  const [balance, setBalance] = useState('0.0')

  const { t } = props

  useEffect(() => {
    getGlobalView()
  }, [])

  const getGlobalView = async () => {
    const globalView = await ETH.getGlobalView()
    const balance = await ETH.getTOKENBalance()

    const { priceA, reserveUCurrent, perf } = globalView

    setPriceA(priceA)
    setReserveUCurrent(reserveUCurrent)
    setPerf(perf)
    setBalance(balance)
  }

  return (
    <>
      <div className="about-page">
        <div className="about-banner">
          <p>{t('MS Card Game Ecosystem')}</p>
          <h2>{t('Omni Chain')}<br />{t('Infinite Loop')}<br />{t('Financial Protocol')}</h2>
          <p>{t('Inspired by 19th-century mathematician August Ferdinand Möbius')}, {t("we're building the next generation of decentralized finance with revolutionary security and sustainability")}.</p>
          <a href="#" className="go-staking-btn" onClick={e => {
            e.preventDefault()
            props.navigate('/staking')
          }}>{t('Participate in Liquidity Staking')}</a>
        </div>
        <div className="about-list">
          <div className="about-list-item">
            <AboutListIcon1 />
            <p>{t('Reference price for price crash prevention')}</p>
            <p>${priceA}</p>
          </div>
          <div className="about-list-item">
            <AboutListIcon2 />
            <p>{t('USDT Reserves')}</p>
            <p>${reserveUCurrent}</p>
          </div>
          <div className="about-list-item">
            <AboutListIcon3 />
            <p>{t('Total number of black hole tokens')}</p>
            <p>{balance}</p>
          </div>
          <div className="about-list-item">
            <AboutListIcon4 />
            <p>{t('Team Staked Total')}</p>
            <p>{perf}</p>
          </div>
        </div>
        <div className="about-info">
          <div className="about-info-title">{t('About the MS')}<br />{t('Protocol')}</div>
          <div className="about-info-content">{t('The MS Protocol')}, {t('based on the theories of 19th-century German mathematician August Ferdinand Möbius')}, {t('leverages the decentralized advantages of blockchain technology')}. {t('It pioneered seven protocols for controlling entry and exit')}, {t('preventing price crashes')}, {t('circuit breakers')}, {t('preventing large investors from exploiting the system')}, {t('preventing insider trading')}, {t('and preventing front-running')}. {t('These protocols avoid human intervention and emotional panic')}, {t('binding liquidity')}, {t('security')}, {t('and the interests of card-based blockchain games together to ensure safety while creating a super profit flywheel')}.</div>
        </div>
        <div className="about-info">
          <div className="about-info-title">
            {t('Seven Major Security')}<br />{t('Protocols')}
          </div>
          <div className="about-info-content">
            {t('The MS Protocol pioneered seven major security protocols to safeguard your assets, including controlled entry/exit, anti-market crash, circuit breaker, anti-large investor, anti-fraud, and anti-insider trading')}.
            {t('The controlled entry and exit protocols ensure ecosystem security, the anti-market crash protocol effectively prevents market manipulation and panic, and the circuit breaker protocol effectively guarantees the absolute safety of LP pool funds and the principal of all investors, while ensuring the normal operation of all new deposits')}.
            {t('The MS Protocol is the world\'s first ever-lasting, infinitely circulating ecosystem')}.
          </div>
        </div>

        <div className="about-image"><img src={AboutImage} /></div>

        <div className="about-list-2">
          <div className="about-list-item">
            <h3>
              {t("World's First Card")}<br />{t('GAME-FI')}
            </h3>
            <p>
              {t("The world's first card game FI blockchain pool will be used for projects of the world's most popular card games, supporting prize money and promotion for various competitions")}.
              {t('20% of the profits from blockchain games will be used to repurchase MS tokens')}.
            </p>
          </div>

          <div className="about-list-item">
            <h3>
              {t('Omnichain Decentralized')}<br />{t('Execution')}
            </h3>
            <p>
              {t('Fully decentralized and automated execution')}.
              {t('MS has no backend, no NTF voting DAO governance (the project team does not have 51% voting rights), no sub-tokens, no insider trading, and assets can be redeemed on the public chain, truly achieving a decentralized financial ecosystem')}.
            </p>
          </div>
        </div>
        <div className="about-link">
          <div className="about-link-title">{t('Partner Institutions')}</div>
          <ul>
            <li><a href="#">TP</a></li>
            <li><a href="#">OKX</a></li>
            <li><a href="#">BNB</a></li>
            <li><a href="#">ETC</a></li>
            <li><a href="#">Dubai Royal Fund</a></li>
          </ul>
        </div>
        <div className="footer-logo"></div>
      </div>
    </>
  )
}

export default About;