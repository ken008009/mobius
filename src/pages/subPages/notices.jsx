import React, { useEffect } from 'react'
import { Bell } from 'lucide-react'
import FileIcon from '@images/m/file-icon.svg?react'
import './styles/notices.less'

const Notices = (props) => {
  const { t } = props

  const notices = [
    {
      title: t('OKX Wallet Domain Notice'),
      content: t('The official MS domain has been maliciously reported on OKX Wallet, causing OKX Wallet users to be unable to log in normally. MS users can log in via TP Wallet or Binance Wallet. To facilitate OKX Wallet MS users, the official team will reapply for a new domain. (Official recommendation: MS users are advised to use TP Wallet going forward.)')
    },
    // {
    //   title: t('MS System Upgrade Announcement'),
    //   content: t('Considering the queue cycle of the MS financial project across multiple markets and its impact on team income and motivation, it has been decided to comprehensively upgrade the MS system. The upgraded MS 2.0 system will fully resolve the impact of queue cycles on earnings, while team rewards will also be comprehensively optimized.')
    // },
    // {
    //   title: t('Queue Control Coefficient Adjustment'),
    //   content: t('For investors who have already joined the queue or have already entered the financial program under the original system, the queue control coefficient will be adjusted from the date of this announcement. Interest for users who have already entered the earning stage will continue to be calculated normally, and additional compensation will be provided after the upgrade.')
    // },
    // {
    //   title: t('Upgrade Timeline Notice'),
    //   content: t('The upgrade is expected to be fully completed within two to three weeks from the date of this announcement. During the upgrade period, all financial interest earnings will continue to be calculated normally. Partners who are still in the queue on the upgrade date may simply set up a fund migration.')
    // },
    // {
    //   title: t('Asset Security Guarantee'),
    //   content: t('During this system upgrade, there will be no risk of asset loss for any investors or team funds. Please do not worry.')
    // }
  ]

  useEffect(() => {
  }, [])

  return (
    <>
      <div className="notices-page">
        <div className="notices-list">
          <div className="notices-list-title">
            <Bell style={{color: '#15FAA3'}} />
            {t('All Notices')}
          </div>
          {notices.map((notice, index) => (
            <div className="notices-list-item" key={index}>
              <h3>{notice.title}</h3>
              <p>{notice.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Notices
