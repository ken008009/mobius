import React, {useState, useEffect} from 'react'
import SubHeader from './components/subHeader'
import { Button } from 'antd-mobile'
import { fetchWithdrawDeposit, fetchRewardList } from '@services/api'
import './styles/withdraw.less'
import Empty from '@components/empty';
import getSign from '@tools/sign'
import { Toast, Pagination } from 'react-vant'

const Withdraw = (props) => {
  const [inputAmount, setInputAmount] = useState('')
  const [recordList, setRecordList] = useState([])
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { amount, withdrawRate } = props.state

  const { t } = props

  useEffect(() => {
    console.log(props.state)
    getRewardList()
  }, [page])

  const setAmount = (value) => {
    if (Number(value) > Number(amount)) {
      setInputAmount(amount)
      return
    }
    setInputAmount(value)
  }

  const getRewardList = () => {
    fetchRewardList({
      page,
      reqType: 2
    }).then(res => {
      setTotal(res.count)
      setRecordList(res.list)
    })
  }

  const submit = async () => {
    if (!inputAmount.trim()) return Toast.fail(t('请输入金额'))

    try {
      const sign = await getSign()

      fetchWithdrawDeposit({
        sign,
        amount: inputAmount
      }).then(res => {
        if (res.status === 'ok') {
          Toast.success(t('提现成功'))
          props.resetUserInfo()
          setInputAmount('')

          if (page === 1) {
            getRewardList()
          } else {
            setPage(1)
          }
        } else {
          Toast.success(res.status)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <SubHeader title="提币" {...props} />
      <div className="withdraw-page">
        <div className="withdraw-form">
          {/* <div className="withdraw-item">
            <div className="withdraw-title">发送到</div>
            <div className="withdraw-input">
              <input type="text" placeholder="请输入收款地址" />
            </div>
          </div> */}
          <div className="withdraw-item">
            <div className="withdraw-title">{t('提现金额')}</div>
            <div className="withdraw-input">
              <input type="text" value={inputAmount} onChange={(e) => setAmount(e.target.value)} placeholder={t('请输入提现金额')} />
              <i className="input-sign">USDT</i>
            </div>
            <div className="withdraw-info">
              <span>{t('可用提现')}: {amount} USDT</span>
              <span onClick={() => setInputAmount(amount)}>Max</span>
            </div>
          </div>
        </div>
        <div className="withdraw-footer">
          <ul className="withdraw-rate-list">
            <li>
              <span>手续费</span>
              <span>{Number(inputAmount * withdrawRate).toFixed(2)} USDT</span>
            </li>
            <li>
              <span>实际到账</span>
              <span>{Number(inputAmount - (inputAmount * withdrawRate)).toFixed(2)} USDT</span>
            </li>
          </ul>
          <Button className="withdraw-btn" onClick={() => submit()}>提现</Button>
        </div>
        <div className="recharge-record">
          <div className="recharge-record-title">{t('提现记录')}</div>
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
        </div>
      </div>
    </>
  )
}

export default Withdraw;