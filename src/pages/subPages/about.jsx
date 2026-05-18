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
            <AboutListIcon3 />
            <p>{t('Total number of black hole tokens')}</p>
            <p>{balance}</p>
          </div>
        </div>
        <div className="footer-logo"></div>
      </div>
    </>
  )
}

export default About;