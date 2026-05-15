import React, { useEffect, useRef, useState } from 'react'

const NoticeScroll = (props) => {
  const { t } = props

  const notices = [
    t('Considering the queue cycle of the MS financial project across multiple markets and its impact on team income and motivation, it has been decided to comprehensively upgrade the MS system. The upgraded MS 2.0 system will fully resolve the impact of queue cycles on earnings, while team rewards will also be comprehensively optimized.'),
    t('For investors who have already joined the queue or have already entered the financial program under the original system, the queue control coefficient will be adjusted from the date of this announcement. Interest for users who have already entered the earning stage will continue to be calculated normally, and additional compensation will be provided after the upgrade.'),
    t('The upgrade is expected to be fully completed within two to three weeks from the date of this announcement. During the upgrade period, all financial interest earnings will continue to be calculated normally. Partners who are still in the queue on the upgrade date may simply set up a fund migration.'),
    t('During this system upgrade, there will be no risk of asset loss for any investors or team funds. Please do not worry.')
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  // 存储每一项真实高度
  const itemHeightsRef = useRef([])
  const itemsRef = useRef([])
  // 当前显示项的高度（用来给外层容器定高）
  const [currentItemHeight, setCurrentItemHeight] = useState(0)

  // 渲染后测量所有公告高度
  useEffect(() => {
    itemHeightsRef.current = itemsRef.current.map(
      (item) => item?.offsetHeight || 0
    )
    // 同步设置容器高度 = 当前显示项的高度（只显示一条，不撑开）
    setCurrentItemHeight(itemHeightsRef.current[currentIndex] || 0)
  }, [notices, currentIndex])

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % notices.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [notices.length])

  // 计算精准滚动偏移量（累加前面所有项高度）
  const getScrollY = () => {
    let offset = 0
    for (let i = 0; i < currentIndex; i++) {
      offset += itemHeightsRef.current[i] || 0
    }
    return offset
  }

  return (
    <>
      <div className="notice-box">
        <div className="notice-title">
          <svg width="16px" height="16px" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#FFF">
            <path d="M1 13.8571V10.1429C1 9.03829 1.89543 8.14286 3 8.14286H5.9C6.09569 8.14286 6.28708 8.08544 6.45046 7.97772L12.4495 4.02228C13.1144 3.5839 14 4.06075 14 4.85714V19.1429C14 19.9392 13.1144 20.4161 12.4495 19.9777L6.45046 16.0223C6.28708 15.9146 6.09569 15.8571 5.9 15.8571H3C1.89543 15.8571 1 14.9617 1 13.8571Z" stroke="#FFF" strokeWidth="1.5"></path>
            <path d="M17.5 7.5C17.5 7.5 19 9 19 11.5C19 14 17.5 15.5 17.5 15.5" stroke="#FFF" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M20.5 4.5C20.5 4.5 23 7 23 11.5C23 16 20.5 18.5 20.5 18.5" stroke="#FFF" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </div>

        {/* 外层容器：高度 = 当前显示项高度，只显示一条 */}
        <div className="notice" style={{ height: currentItemHeight }}>
          <div
            className="notice-wrapper"
            style={{
              transform: `translateY(-${getScrollY()}px)`,
              transition: 'transform 0.5s ease-in-out'
            }}
          >
            {notices.map((item, i) => (
              <div
                className="notice-item"
                key={i}
                ref={(el) => (itemsRef.current[i] = el)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .notice-box {
          width: 70%;
          margin: 20px auto;
          display: flex;
          align-items: center;
          background: #222;
          padding: 0 15px;
          border-radius: 6px;
          overflow: hidden;
        }
        .notice-title {
          margin-right: 8px;
          flex-shrink: 0;
        }
        .notice {
          flex: 1;
          overflow: hidden;
        }
        .notice-wrapper {
          display: flex;
          flex-direction: column;
        }
        .notice-item {
          color: #fff;
          font-size: 12px;
          line-height: 1.5;
          padding: 4px 0;
          width: 100%;
          box-sizing: border-box;
        }
      `}</style>
    </>
  )
}

export default NoticeScroll