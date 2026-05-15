import React, {useState, useEffect} from 'react'
import { ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Button, Input, Dialog, Toast, Tag } from 'antd-mobile'
import classnames from 'classnames'
import dayjs from 'dayjs'
import { Contract, ETH } from '@tools/contract'
import Big from 'big.js';
import './styles/staking.less'

const USDT = new Contract(import.meta.env.VITE_USDT, "ERC20");
const BUY = new Contract(import.meta.env.VITE_ZYSQ, "BUY");

const AddressForm = (props) => {
  const [parentAddress, setParentAddress] = useState('')

  return (
    <>
      <div className="address-form">
        <p className="address-title">Input Invitation Address</p>
        <Input className="address-input" placeholder="Enter invite address" onChange={(value) => {
          setParentAddress(value)
        }} />
        <p><Button className="address-btn" onClick={() => {
          if (!parentAddress) {
            Toast.show({
              content: t('Please enter the invitation address')
            })
            return
          }

          props.onChange && props.onChange(parentAddress)
        }}>Confirm</Button></p>
      </div>
    </>
  )
}

const Staking = (props) => {
  const [active, setActive] = useState('0')
  const [amount, setAmount] = useState('')
  const [count, setCount] = useState(1)
  const [orders, setOrders] = useState([])
  const [usdtApprove, setUsdtApprove] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [maxStakeAmountNow, setMaxStakeAmountNow] = useState(0)
  const [usdtBalance, setUsdtBalance] = useState(0)
  const [queueLength, setQueueLength] = useState(null)
  const [queueCursor, setQueueCursor] = useState(null)
  const [originMaxStakeAmountNow, setOriginMaxStakeAmountNow] = useState('')
  const [firstWaitingPosition, setFirstWaitingPosition] = useState(null)
  const [waitingCount, setWaitingCount] = useState(null)

  const { t } = props

  useEffect(() => {
    getMaxStakeAmountNow()
    getUsdtAllowance()
    getUsdtBalance()
    window.Big = Big
  }, [])

  const getMaxStakeAmountNow = async () => {
    const globalView = await ETH.getGlobalView()
    const userQueueInfo = await ETH.getUserQueueInfo()

    const { maxStakeAmountNow, originMaxStakeAmountNow, isRegistered, queueLength, queueCursor } = globalView
    const { firstWaitingPosition, waitingCount, orders } = userQueueInfo

    setOrders(orders)
    setWaitingCount(waitingCount.toString())
    setFirstWaitingPosition(firstWaitingPosition.toString())
    setQueueLength(queueLength)
    setQueueCursor(queueCursor)
    setIsRegistered(isRegistered)
    setOriginMaxStakeAmountNow(originMaxStakeAmountNow)
    setMaxStakeAmountNow(maxStakeAmountNow)
  }

  const getUsdtBalance = async () => {
    const balance = await ETH.getUSDTBalance()
    setUsdtBalance(balance)
  }


  const getUsdtAllowance = async (callback) => {
    let res = await USDT.call("allowance", [ETH.account, BUY.address]);
    setUsdtApprove(Number(res) > 0)
    console.log(Number(res))
    callback && callback(Number(res) > 0)
  }

  const handleUsdtApprove = (parentAddress) => {
    USDT.send("approve", [
        BUY.address,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    ]).then(res => {
      getUsdtAllowance((status) => {
        if (status) {
          handleStaking(status, parentAddress)
        } else {
          setLoading(false)
        }
      })
    }).catch(e => {
      console.log(e)
      setLoading(false)
    });
  }

  const handleRegistered = async (status) => {
    if (!amount) return Toast.show(t('Please enter an amount'))
    if (new Big(amount).lt('200') || new Big(amount).gt('1000')) return Toast.show(`${t('Staking amount per order')}200～1000USDT`)
    if (!isRegistered) {
      let dialog = Dialog.show({
        header: null,
        title: null,
        content: <AddressForm onChange={value => {
          dialog.close()
          handleStaking(status, value)
        }} />,
        actions: [],
        className: 'no-footer-dialog'
      })
    } else {
      handleStaking(status)
    }
  }

  const handleStaking = async (status, parentAddress) => {
    setLoading(true)
    const approve = status || usdtApprove
    if (!approve) return handleUsdtApprove(parentAddress)
    const amountNum = new Big(amount).times('1e18').toFixed(0)
    try {
      if (count > 1) {
        if (parentAddress) {
          await ETH.batchStakeWithInviter(amountNum, '0', active, parentAddress, count)
          setIsRegistered(true)
        } else {
          await ETH.batchStake(amountNum, '0', active, count)
        }
      } else {
        if (parentAddress) {
          await ETH.stakeWithInviter(amountNum, '0', active, parentAddress)
          setIsRegistered(true)
        } else {
          await ETH.stake(amountNum, '0', active)
        }
      }

      setAmount('')
      setLoading(false)
      setIsRegistered(true)
      Toast.show(t('Transaction successful'))
    } catch (error) {
      console.log(error)
      setLoading(false)
      Toast.show(t('Transaction failed'))
    }
  }

  const handleSelectMax = () => {
    let maxAmount = new Big(maxStakeAmountNow).toString()

    maxAmount = maxAmount > 1000 ? 1000 : maxAmount

    if (usdtBalance > maxAmount) {
      setAmount(maxAmount)
    } else {
      setAmount(parseInt(usdtBalance) || '')
    }
  }

  const calcInterest = (orderCount, amount, rate = 1.012, days = 30) => {
    return orderCount * amount * (rate ** days)
  }

  return (
    <>
      <div className="staking-page">
        <div className="staking-info">
          <div className="staking-info-item">
            <h3>{t('Total Pending Orders')}</h3>
            <p>{queueLength === null ? '-' : queueLength}</p>
          </div>
          {/* <div className="staking-info-item">
            <h3>{t('Current Progress')}</h3>
            <p>{queueCursor === null ? '-' : queueCursor}</p>
          </div> */}
          <div className="staking-info-item">
            <h3>{t('Total Queued Orders')}</h3>
            <p>{waitingCount === null ? '-' : waitingCount}</p>
          </div>
          <div className="staking-info-item">
            <h3>{t('Position in Queue')}</h3>
            <p>{firstWaitingPosition === null ? '-' : firstWaitingPosition}</p>
          </div>
        </div>
        <div className="staking-banner">
          <h3>{t('Staking')}</h3>
          <p>{t('Mobius Strip')}, {t('a blockchain gaming ecosystem based on the 19th-century German mathematician August Ferdinand Möbius')}, {t('features a fully integrated')}, {t('infinitely circulating financial protocol')}.</p>
        </div>
        <div className="staking-tab">
          <div className={classnames('staking-tab-item', {active: active === '0'})} onClick={() => setActive('0')}>
            <h3><ClockCircleOutlined />30 {t('Days')}</h3>
            <p>
              <span>{t('Daily Rate')}</span>
              <span>1.2%</span>
            </p>
            <p>
              <span>{t('Total Return')}</span>
              <span>143%</span>
            </p>
          </div>
          <div className={classnames('staking-tab-item', {active: active === '1'})} onClick={() => setActive('1')}>
            <h3><ClockCircleOutlined />180 {t('Days')}</h3>
            <p>
              <span>{t('Daily Rate')}</span>
              <span>1.3%</span>
            </p>
            <p>
              <span>{t('Total Return')}</span>
              <span>1022%</span>
            </p>
          </div>
        </div>
        <div className="staking-amount">
          <div className="staking-amount-hint"><InfoCircleOutlined />{t('Staking amount per order')}200～1000USDT</div>
          <div className="staking-amount-title">{t('Staking Amount')}（USDT）</div>
          <div className="staking-amount-form" style={{marginBottom: 20}}>
            <input type="number" value={amount} onChange={e => {
              const maxAmount = new Big(maxStakeAmountNow).toString()

              if (Number(e.target.value) > Number(maxAmount)) {
                return setAmount(maxAmount)
              }

              setAmount(e.target.value)
            }} placeholder={t('Enter staking amount')} className="amount-input" />
            <button className="amount-max-btn" onClick={() => handleSelectMax()}>{t('MAX')}</button>
          </div>
          <div className="staking-amount-title">{t('Purchase Quantity')}</div>
          <div className="staking-amount-form">
            <input type="number" value={count} onChange={e => {
              setCount(e.target.value)
            }} onBlur={e => {
              if (e.target.value < 1) return setCount(1)
            }} placeholder={t('Enter Purchase Quantity')} className="amount-input" />
          </div>
          <div className="staking-hint">{t('maturityAmount')}：{calcInterest(count, amount, active === '0' ? 1.012 : 1.013, active === '0' ? 30 : 180).toFixed(3)} USDT</div>
        </div>
        <Button loading={loading} className="staking-btn" onClick={() => handleRegistered()}>{t('Start Liquidity Staking')}</Button>
        <div className="staking-log">
          <div className="staking-log-title">{t('Waiting list')}</div>
          <div className="staking-log-list">
            {orders.length === 0 && <div className="no-data">{t('No pending orders')}</div>}
            {
              orders.map((item, index) => (
                <div className="staking-log-item" key={index}>
                  <div className="queue-row">
                    <span className="queue-label">{t('Amount')}：</span>
                    <span className="queue-value">{item.amount.toString()} USDT</span>
                  </div>
                  <div className="queue-row">
                    <span className="queue-label">{t('Position in Queue')}：</span>
                    <span className="queue-value">{item.index.toString()}</span>
                  </div>
                  <div className="queue-row">
                    <span className="queue-label">{t('Queue Time')}：</span>
                    <span className="queue-value">{dayjs(item.queuedAt.toString() * 1000).format('YYYY-MM-DD hh:mm:ss')}</span>
                  </div>
                  <div className="queue-row">
                    <span className="queue-label">{t('Staking Cycle')}：</span>
                    <span className="queue-value">{item.stakeIndex.toString() === '0' ? '30' : '180'}</span>
                  </div>
                  <div className="queue-row">
                    <span className="queue-label">{t('Status')}：</span>
                    <span className="queue-value">
                      <Tag round color={!item.status ? "warning" : "success"}>
                        {!item.status ? t('Pending') : t('Completed')}
                      </Tag>
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default Staking;