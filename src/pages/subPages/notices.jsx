import React, { useMemo } from 'react'
import { Bell } from 'lucide-react'
import { getNotices } from '@config/notices'
import './styles/notices.less'

const Notices = (props) => {
  const { t } = props

  const notices = useMemo(() => getNotices(t), [t])

  return (
    <>
      <div className="notices-page">
        <div className="notices-banner">
          <Bell size={48} color="#15FAA3" />
          <h3>{t('Announcements')}</h3>
          <p>{t('Stay updated with the latest news and system updates')}</p>
        </div>
        <div className="notices-list">
          <div className="notices-list-title">
            <Bell style={{color: '#15FAA3'}} />
            {t('System Notices')}
          </div>
          {notices.map((notice, index) => (
            <div className="notices-list-item" key={`${notice.title}-${index}`}>
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
