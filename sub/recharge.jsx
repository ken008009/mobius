import React, {useState, useEffect, useLayoutEffect} from 'react'
import SubHeader from './components/subHeader'
import { Button, Toast, Pagination, Dialog } from 'react-vant'
import { Contract, ETH } from '@tools/contract'
import { fetchRewardList } from '@services/api'
import Empty from '@components/empty';
import './styles/recharge.less'

const USDT = new Contract(import.meta.env.VITE_USDT, "ERC20");
const BUY = new Contract(import.meta.env.VITE_BUY, "BUY");

const Recharge = (props) => {
  const [value, setValue] = useState('')
  const [usdt, setUsdt] = useState('-')
  const [rwbApproved, setRwbApproved] = useState(false)
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [recordList, setRecordList] = useState([])
  const { amount } = props.state

  const { t } = props

  useLayoutEffect(() => {
    getRewardList()
  }, [page])

  useEffect(() => {
    getUsdtBalance()
    getRwbApproved()
  }, [])

  const getRwbApproved = async () => {
    let res = await USDT.call("allowance", [ETH.account, BUY.address]);
    setRwbApproved(Number(res) > 0)
  }

  const usdtApprove = () => {
    USDT.send("approve", [
        BUY.address,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    ]).then(getRwbApproved).catch(e => {
      console.log(e)
    });
  }

  const getUsdtBalance = async () => {
    const balance = await ETH.getUSDTBalance()
    setUsdt(balance)
  }

  const getRewardList = () => {
    fetchRewardList({
      page,
      reqType: 1
    }).then(res => {
      setTotal(res.count)
      setRecordList(res.list)
    })
  }

  const handleAmount = (e) => {
    setValue(e.target.value)
  }

  const confirm = () => {
    if (!Number.isInteger(Number(value))) {
      Toast.info(t('请输入整数的数字'))
    } else {
      if (Number(value) < 10) return Toast.info(t('充值金额不能小于10USDT'))

      Toast.loading({
        forbidClick: true,
        message: t('正在提交'),
        duration: 0
      })

      BUY.send("buy", [Number(value)]).then(() => {
        Toast.clear()
        Dialog.alert({
          title: t('提示'),
          message: t('交易成功'),
          onConfirm: async () => {
            const res = await request.get("/user_info");
            props.setState(res);
          },
        })
      }).catch(() => {
        Toast.clear()
        Toast.info(t('交易失败'))
      });
    }
  }

  const handleMaxAmount = () => {
    setValue(Math.floor(usdt))
  }


  return (
    <>
      <SubHeader title={t('充值')} {...props} />
      <div className="recharge-page">
        <div className="recharge-form">
          <div className="recharge-item">
            <div className="recharge-title">{t('充值')}</div>
            <div className="recharge-input">
              <input type="text" value={value} onChange={handleAmount} placeholder={t('请输入充值金额')} />
              <i className="max-amount-btn" onClick={handleMaxAmount}>Max</i>
              <i className="input-sign">USD</i>
            </div>
            <p className="input-tips">{t('仅支持整数的充值')}</p>
            <p className="balance-tips">{t('可用')}: {usdt} USDT</p>
          </div>
          {/* <div className="recharge-item">
            <div className="recharge-title">手续费</div>
            <div className="recharge-input">
              <input type="text" value={0.00} disabled />
              <i className="input-sign">USD</i>
            </div>
            <p className="balance-tips">扣除: 0.0 USDT</p>
          </div> */}
          <Button className="confirm-btn" onClick={() => rwbApproved ? confirm() : usdtApprove() }>{t('确认')}</Button>
        </div>
        <div className="recharge-record">
          <div className="recharge-record-title">{t('充值明细')}</div>
          <div className="recharge-record-list">
            {
              recordList.length > 0 ? recordList.map((item, index) => (
                <div className="record-item" key={index}>
                  <div className="record-item-left">
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

export default Recharge;