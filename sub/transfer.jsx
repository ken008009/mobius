import React, {useState, useEffect} from 'react'
import SubHeader from './components/subHeader'
import { Button } from 'antd-mobile'
import { Toast, Pagination, Tabs } from 'react-vant';
import Empty from '@components/empty';
import { fetchAmountToCard, fetchRewardList } from '@services/api'
import getSign from '@tools/sign'
import './styles/transfer.less'

const Transfer = (props) => {
  const [inputAmount, setInputAmount] = useState('')
  const [recordList, setRecordList] = useState([])
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [toType, setToType] = useState(0)
  const { amount, amountToRate } = props.state

  const { t } = props

  useEffect(() => {
    setPage(1)
    getRewardList(1)
  }, [currentTab])

  const setAmount = (value) => {
    if (Number(value) > Number(amount)) {
      setInputAmount(amount)
      return
    }
    setInputAmount(value)
  }

  const getRewardList = (pageNum) => {
    fetchRewardList({
      page: pageNum || page,
      reqType: 4,
      cardType: currentTab
    }).then(res => {
      setTotal(res.count)
      setRecordList(res.list)
    })
  }

  const submit = async () => {
    if (!inputAmount.trim()) return Toast.fail(t('请输入金额'))

    Toast.loading({
      message: t('划转中...'),
      forbidClick: true,
      loadingType: 'spinner',
      duration: 0
    })

    try {
      const sign = await getSign()

      fetchAmountToCard({
        sign,
        amount: inputAmount,
        toType
      }).then(res => {
        Toast.clear()
        if (res.status === 'ok') {
          setTimeout(() => {
            Toast.success(t('划转成功'))
          }, 40)
          props.resetUserInfo()
          setInputAmount('')

          if (page === 1) {
            getRewardList()
          } else {
            setPage(1)
            getRewardList()
          }
        } else {
          setTimeout(() => {
            Toast.success(res.status)
          }, 40)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  const dzje = () => {
    return Number(inputAmount - (inputAmount * amountToRate)).toFixed(2)
  }

  const recordTab = [t('虚拟卡'), t('实体卡')]

  return (
    <>
      <SubHeader title={t('划转')} {...props} />
      <div className="transfer-page">
        <div className="transfer-item">
          <div className="transfer-item-title">{t('划转方向')}</div>
          <div className="transfer-item-box">
            <div className="transfer-from">
              <span>{t('从')}</span>
              <span>{t('钱包')}</span>
            </div>
            <div className="transfer-to">
              <span>{t('至')}</span>
              <span>{toType === 0 ? t('虚拟卡银行账户') : t('实体卡银行账户')}</span>
            </div>
            <svg onClick={() => {
              if (toType === 0) {
                setToType(1)
              } else {
                setToType(0)
              }
            }} width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40.7873 9.05002C33.6873 12.05 27.3123 16.35 21.8373 21.825C16.3623 27.3 12.0623 33.675 9.0623 40.775C5.9373 48.1375 4.3623 55.95 4.3623 64C4.3623 72.05 5.9373 79.8625 9.0498 87.2125C12.0498 94.3125 16.3498 100.688 21.8248 106.163C27.2998 111.638 33.6748 115.938 40.7748 118.938C48.1373 122.063 55.9498 123.638 63.9998 123.638C72.0498 123.638 79.8623 122.063 87.2123 118.95C94.3123 115.95 100.687 111.65 106.162 106.175C111.637 100.7 115.937 94.325 118.937 87.225C122.05 79.875 123.625 72.0625 123.625 64.0125C123.625 55.9625 122.05 48.15 118.937 40.8C115.937 33.7 111.637 27.325 106.162 21.85C100.687 16.375 94.3123 12.075 87.2123 9.07501C79.8623 5.96251 72.0498 4.38751 63.9998 4.38751C55.9498 4.38751 48.1373 5.93752 40.7873 9.05002ZM83.8123 17.0875C89.8748 19.65 95.3248 23.325 99.9998 28C104.675 32.675 108.35 38.125 110.912 44.1875C113.562 50.4625 114.912 57.125 114.912 64C114.912 70.875 113.562 77.5375 110.912 83.8125C108.35 89.875 104.675 95.325 99.9998 100C95.3248 104.675 89.8748 108.35 83.8123 110.913C77.5373 113.563 70.8748 114.913 63.9998 114.913C57.1248 114.913 50.4623 113.563 44.1873 110.913C38.1248 108.35 32.6748 104.675 27.9998 100C23.3248 95.325 19.6498 89.875 17.0873 83.8125C14.4373 77.5375 13.0873 70.875 13.0873 64C13.0873 57.125 14.4373 50.4625 17.0873 44.1875C19.6498 38.125 23.3248 32.675 27.9998 28C32.6748 23.325 38.1248 19.65 44.1873 17.0875C50.4623 14.4375 57.1248 13.0875 63.9998 13.0875C70.8748 13.0875 77.5373 14.4375 83.8123 17.0875Z" fill="#999999"/>
              <path d="M61.1501 94.7625V33.8375C61.1626 33.6375 61.1626 33.425 61.1501 33.225C61.1501 30.95 59.2876 29.0875 57.0001 29.0875H56.5626C55.1126 29.0875 53.8251 29.85 53.0751 30.9875L39.0751 45.0125C37.4626 46.625 37.4626 49.2625 39.0751 50.875L39.3876 51.1875C41.0001 52.8 43.6376 52.8 45.2501 51.1875L52.4251 44.0125V94.7625C52.4251 97.0375 54.2876 98.9125 56.5751 98.9125H57.0126C59.2876 98.9125 61.1501 97.0375 61.1501 94.7625ZM66.9751 33.225V94.1625C66.9626 94.375 66.9626 94.575 66.9751 94.7875C67.0001 96.975 68.7376 98.775 70.9001 98.8875C71.3501 98.9375 71.8126 98.925 72.2626 98.8375C73.4001 98.6375 74.3751 97.9875 75.0001 97.0625L89.0501 83C90.6626 81.3875 90.6626 78.75 89.0501 77.1375L88.7376 76.825C87.1251 75.2125 84.4876 75.2125 82.8751 76.825L75.7001 84V33.2125C75.7001 30.9375 73.8376 29.0625 71.5501 29.0625H71.1126C68.8376 29.075 66.9751 30.9375 66.9751 33.225Z" fill="#999999"/>
            </svg>
          </div>
        </div>
        <div className="transfer-item">
          <div className="transfer-item-title">{t('划转金额')}</div>
          <div className="transfer-input">
            <input type="text" value={inputAmount} onChange={e => setAmount(e.target.value)} placeholder={t('请输入划转金额')} />
            <i className="max-amount-btn" onClick={() => setInputAmount(amount)}>Max</i>
          </div>
          <div className="transfer-tips">{t('钱包账户余额')}: {amount} USD</div>
          <div className="transfer-tips">{t('到账金额')}: {dzje()} USD</div>
        </div>
        <Button className="confirm-btn" onClick={() => submit()}>{t('确认')}</Button>
      </div>
      <div className="recharge-record">
        <div className="recharge-record-title">{t('划转记录')}</div>
        <Tabs defaultActive={0} onChange={(value) => {
          setCurrentTab(value)
        }}>
          {recordTab.map(item => (
            <Tabs.TabPane key={item} title={`${item + t('划转记录')}`}>
              <div className="recharge-record-list">
                {
                  recordList.length > 0 ? recordList.map((item, index) => (
                    <div className="record-item" key={index}>
                      <div className="record-item-left">
                        <p>{props.formatAddress(item.address)}</p>
                        <p>{item.createdAt}</p>
                      </div>
                      <div className="record-item-right">{item.amount} USD</div>
                    </div>
                  )) : <Empty />
                }
              </div>
              {
                recordList.length / 20 > 1 && <Pagination value={page} mode="simple" onChange={setPage} pageCount={Math.ceil(total / 20)} />
              }
            </Tabs.TabPane>
          ))}
        </Tabs>
      </div>
    </>
  )
}

export default Transfer;