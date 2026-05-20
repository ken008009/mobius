import React, {useState, useEffect} from 'react'
import AboutListIcon2 from '@images/m/about-list-icon-2.svg?react'
import AboutListIcon4 from '@images/m/about-list-icon-4.svg?react'
import AboutImage from '@images/m/about-image-1.png'
import './styles/about.less'

const About = (props) => {
  const { t } = props

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
          }}>开始理财</a>
        </div>
        <div className="footer-logo"></div>
      </div>
    </>
  )
}

export default About;