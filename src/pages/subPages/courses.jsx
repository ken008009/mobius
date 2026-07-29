import React, {useState, useEffect} from 'react'
import { BookOpen, ExternalLink, Download } from 'lucide-react';
import FileIcon from '@images/m/file-icon.svg?react'
import whitepaperZh from '@assets/MS 匿名全域生态公链白皮书.pdf'
import whitepaperEn from '@assets/MS 匿名全域生态公链白皮书英文版.pdf'
import './styles/courses.less'

const Courses = (props) => {
  const { t } = props

  useEffect(() => {
  }, [])

  return (
    <>
      <div className="courses-page">
        <div className="courses-banner">
          <FileIcon />
          <h3>{t('Learning Courses')}</h3>
          <p>{t('Access educational materials')}, {t('official documents')}, {t('and protocol updates')}</p>
        </div>
        <div className="courses-list">
          <div className="courses-list-title"><BookOpen style={{color: '#15FAA3'}} />{t('Business School')}</div>
          <div className="courses-list-item">
            <h3>{t('Introduction to DeFi Protocols')}</h3>
            <p>{t('Learn the fundamentals of decentralized finance and how omnichain protocols work')}</p>
            <p>2026-03-10</p>
            <a
              href="https://www.moblus.net/course.MP4"
              target="_blank"
              rel="noopener noreferrer"
            >
              View<ExternalLink style={{color: '#15FAA3'}} />
            </a>
          </div>
          <div className="courses-list-item">
            <h3>{t('Möbius Strip Technical Whitepaper')}</h3>
            <i>PDF</i>
            <p>{t('Complete technical documentation of the protocol architecture and mechanics')}</p>
            <p>2026-01-15</p>
            <div className="courses-download-btns">
              <a href={whitepaperZh} download="MS 匿名全域生态公链白皮书.pdf">
                {t('中文版')}<Download style={{color: '#15FAA3'}} />
              </a>
              <a href={whitepaperEn} download="MS 匿名全域生态公链白皮书英文版.pdf">
                {t('English')}<Download style={{color: '#15FAA3'}} />
              </a>
            </div>
          </div>
          <div className="courses-list-item">
            <h3>{t('Protocol Mainnet Launch')}</h3>
            <p>{t('The Möbius Strip Protocol is now live on mainnet')}! {t('Start staking and earning rewards today')}.</p>
            <p>2026-03-16</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Courses;