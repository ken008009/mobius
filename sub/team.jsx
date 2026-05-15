import React, {useState, useEffect} from 'react'
import SubHeader from './components/subHeader'
import TreeMenu from "./components/treeMenu";
import { Tabs } from 'react-vant'
import { fetchRecommendList } from '@services/api'
import EarningsList from './components/earningsList';
import CardEarningsList from './components/cardEarningsList';
import './styles/team.less'

const Team = (props) => {
  const [data, setData] = useState([])

  const { address, myTotalAmount, vip, recommendAddress, canVip } = props.state

  const { t } = props

  useEffect(() => {
    getRecommendList()
  }, [])

  const onExpand = (item) => {
    console.log('onExpand', item)
  }

  const getRecommendList = async (value) => {
    value = value || address
    const res = await fetchRecommendList({address: value})
    setData(res.recommends.map(item => {
      item.children = []
      return item
    }))
  }

  const onLoad = (value) => {
    return new Promise(async(resolve, reject) => {
      const res = await fetchRecommendList({address: value.address})

      resolve(res.recommends)
      // setTimeout(() => {
      //   resolve([
      //     {
      //       vip: 15,
      //       address: '0x6A6CEF73CA35aA2194912D8564CBb6aB1f632334',
      //       amount: '1000',
      //       cardOpen: 0,
      //       children: []
      //     },
      //     {
      //       vip: 16,
      //       address: '0x6A6CEF73CA35aA2194912D8564CBb6aB1f632334',
      //       amount: '2000',
      //       cardOpen: 0,
      //       children: []
      //     }
      //   ])
      // }, 2000)
    })
  }
  console.log('v', canVip)
  return (
    <>
      <SubHeader title={t('我的团队')} {...props} />
      <div className="team-page">
        <div className="team-info">
          <div className="team-info-item">
            <p>{t('我的业绩')}</p>
            <p>{myTotalAmount}</p>
          </div>
          <div className="team-info-item">
            <p>{t('我的级别')}</p>
            <p>v{vip}</p>
          </div>
          <div className="team-info-item">
            <p>{t('我的推荐人')}</p>
            <p>{props.formatAddress(recommendAddress)}</p>
          </div>
        </div>
        <div className="team-list">
          <Tabs active="a">
              <Tabs.TabPane name="a" title={t('团队成员')}>
                <br />
                <div className="team-list-content">
                  <TreeMenu data={data} {...props} canVip={canVip} getRecommendList={getRecommendList} onExpand={onExpand} onLoad={onLoad} />
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane name="b" title={t('收益列表')}>
                <br />
                <EarningsList {...props} />
              </Tabs.TabPane>
              <Tabs.TabPane name="c" title={t('实体卡收益列表')}>
                <br />
                <CardEarningsList {...props} />
              </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </>
  )
}

export default Team;