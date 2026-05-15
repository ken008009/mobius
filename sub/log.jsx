import React, {useState, useEffect} from 'react'
import SubHeader from './components/subHeader'
import { Button, Tabs } from 'react-vant'
import { fetchCodeList } from '@services/api'
import './styles/log.less'
import Empty from '@components/empty';
import { Toast, Pagination } from 'react-vant'

const Log = (props) => {
  const [list, setList] = useState([])
  const [currentTab, setCurrentTab] = useState(1);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { amount } = props.state

  const { t } = props

  useEffect(() => {
    setPage(1)
    getLogList(1)
  }, [currentTab])

  const getLogList = (pageNum) => {
      fetchCodeList({
        page: pageNum || page,
        num: currentTab
      }).then(res => {
        setTotal(res.count)
        setList(res.list)
      })
  }

  return (
    <>
      <SubHeader title={t('验证码列表')} {...props} />
      <div className="log-page">
        <div className="log-list">
          <Tabs defaultActive={1} border animated type='capsule' onChange={(value) => {
            setCurrentTab(value)
          }}>
              <Tabs.TabPane key={1} name={1} title={t('虚拟卡')}>

              </Tabs.TabPane>
              <Tabs.TabPane key={2} name={2} title={t('实体卡')}>

              </Tabs.TabPane>
          </Tabs>
          <div className="log-item" style={{borderBottom: '1px solid #eee'}}>
            <div className="log-item-date">{t('时间')}</div>
            <div className="log-item-remark">{t('验证码')}</div>
          </div>
          {
            list.map(item => (
              <div className="log-item">
                <div className="log-item-date">{item.createdAt}</div>
                <div className="log-item-remark">{item.code}</div>
              </div>
            ))
          }
          {
            list.length === 0 && <Empty style={{ margin: '60px 0' }} />
          }
        </div>
        {
          list.length / 20 > 1 && <Pagination value={page} mode="simple" onChange={value => {
            setPage(value)
            getLogList()
          }} pageCount={Math.ceil(total / 20)} />
        }
      </div>
    </>
  )
}

export default Log;