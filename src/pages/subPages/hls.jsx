import React, {useState, useEffect} from 'react'
import HlsIcon1 from '@images/m/hls-icon-1.svg?react'
import HlsIcon2 from '@images/m/hls-icon-2.svg?react'
import HlsIcon3 from '@images/m/hls-icon-3.svg?react'
import HlsIcon4 from '@images/m/hls-icon-4.svg?react'
import { ChevronDown } from 'lucide-react'
import { Toast, Picker, Checkbox } from 'antd-mobile'
import { Contract, ETH } from '@tools/contract'
import dayjs from 'dayjs'
import './styles/hls.less'
import classNames from 'classnames'

const USDT = new Contract(import.meta.env.VITE_USDT, "ERC20");
const BUY = new Contract(import.meta.env.VITE_ZYSQ, "BUY");

const Hls = (props) => {
  const [userOrders, setUserOrders] = useState([])
  const [visible, setVisible] = useState(false)
  const [usdtApprove, setUsdtApprove] = useState(false)
  const [pickerFilter, setPickerFilter] = useState('')
  const [infoList, setInfoList] = useState({})
  const [selectedOrder, setSelectedOrder] = useState([])

  const { t } = props

  useEffect(() => {
    setSelectedOrder([])
  }, [pickerFilter])

  const basicColumns = [
    [
      { label: t('All'), value: '' },
      { label: t('Unstakable'), value: 'canUnstake' },
      { label: t('Reinvestable'), value: 'canRestake' },
      { label: t('Withdrawable Earnings'), value: 'canClaim' }
    ]
  ]

  useEffect(() => {
    getUserOrders()
    getGlobalView()
    getUsdtAllowance()
  }, [])

  const getGlobalView = async () => {
    const globalView = await ETH.getGlobalView()

    const { baseStakedAmount, stakeOrderCount, canUnstakeCount, canRestakeCount, claimableOrderCount, nextUnlockTime, nextTtlDeadline, circuitBreakerTime } = globalView

    setInfoList({
      baseStakedAmount, stakeOrderCount, canUnstakeCount, canRestakeCount, claimableOrderCount, nextUnlockTime, nextTtlDeadline, circuitBreakerTime
    })
  }

  const getUsdtAllowance = async (callback) => {
    let res = await USDT.call("allowance", [ETH.account, BUY.address]);

    setUsdtApprove(Number(res) > 0)

    callback && callback(Number(res) > 0)
  }

  const getUserOrders = async () => {
    const userOrders = await ETH.getUserOrders()
    userOrders.forEach(item => {
      console.log(item.ttlDeadline)
    })

    setUserOrders(userOrders)
  }

  const handleUsdtApprove = (callback) => {
    USDT.send("approve", [
        BUY.address,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    ]).then(res => {
      getUsdtAllowance(callback)
    })
  }

  const checkUsdtAllowance = async (callback) => {
    if (usdtApprove) return callback && callback()

    handleUsdtApprove(callback)
  }

  const handleUnStake = async (index) => {
    const toast = Toast.show({
      icon: 'loading',
      maskClickable: false,
      content: t('Subscribing'),
    })
    try {
      await ETH.unstake(index)
      getUserOrders()
      toast.close()
      Toast.show({
        icon: 'success',
        content: t('Operation Success'),
      })
    } catch (error) {
      console.log('error', error)
      toast.close()
      Toast.show({
        icon: 'fail',
        content: t('Operation Failed'),
      })
    }
  }

  const handleReStake = async (...params) => {
    const toast = Toast.show({
      icon: 'loading',
      maskClickable: false,
      content: t('Subscribing'),
    })
    try {
      checkUsdtAllowance(async () => {
        await ETH.restake(...params)
        getUserOrders()
        toast.close()
        Toast.show({
          icon: 'success',
          content: t('Operation Success'),
        })
      })
    } catch (error) {
      console.log('error', error)
      toast.close()
      Toast.show({
        icon: 'fail',
        content: t('Operation Failed'),
      })
    }
  }

  const handleClaim = async (index) => {
    const toast = Toast.show({
      icon: 'loading',
      maskClickable: false,
      content: t('Subscribing'),
    })
    try {
      await ETH.claim(index)
      getUserOrders()
      toast.close()
      Toast.show({
        icon: 'success',
        content: t('Operation Success'),
      })
    } catch (error) {
      console.log('error', error)
      toast.close()
      Toast.show({
        icon: 'fail',
        content: t('Operation Failed'),
      })
    }
  }

  const getFilterText = () => {
    return basicColumns[0].find(item => item.value === pickerFilter)?.label
  }

  const handleAllSelected = () => {
    const data = userOrders.filter(item => {
      if (pickerFilter === '') return item
      if (pickerFilter === 'canUnstake') return item.canUnstake
      if (pickerFilter === 'canRestake') return item.canRestake
      if (pickerFilter === 'canClaim') return item.canClaim
    })
    if (data.length === selectedOrder.length) {
      setSelectedOrder([])
      return
    }
    setSelectedOrder(data.map((item) => item.index.toString()))
  }

  const handleAllData = async () => {
    if (pickerFilter === 'canUnstake') {
      const toast = Toast.show({
        icon: 'loading',
        maskClickable: false,
        content: t('Subscribing'),
      })
      try {
        await ETH.batchUnstake(selectedOrder)
        toast.close()
        Toast.show({
          icon: 'success',
          content: t('Operation Success'),
        })
      } catch (error) {
        console.log('error', error)
        toast.close()
        Toast.show({
          icon: 'fail',
          content: t('Operation Failed'),
        })
      }
    }
    if (pickerFilter === 'canRestake') {
      const stakeIndexArr = userOrders.filter(item => selectedOrder.includes(item.index.toString())).map(item => item.stakeIndex)
      const amountArr = userOrders.filter(item => selectedOrder.includes(item.index.toString())).map(item => item.amount)
      const countArr = userOrders.filter(item => selectedOrder.includes(item.index.toString())).map(item => '0')
      console.log(selectedOrder, amountArr, countArr, stakeIndexArr)
      const toast = Toast.show({
        icon: 'loading',
        maskClickable: false,
        content: t('Subscribing'),
      })
      try {
        checkUsdtAllowance(async () => {
          await ETH.batchRestake(selectedOrder, amountArr, countArr, stakeIndexArr)
          toast.close()
          Toast.show({
            icon: 'success',
            content: t('Operation Success'),
          })
        })
      } catch (error) {
        console.log('error', error)
        toast.close()
        Toast.show({
          icon: 'fail',
          content: t('Operation Failed'),
        })
      }
    }
    if (pickerFilter === 'canClaim') {
      const toast = Toast.show({
        icon: 'loading',
        maskClickable: false,
        content: t('Subscribing'),
      })
      try {
        await ETH.batchClaim(selectedOrder)
        toast.close()
        Toast.show({
          icon: 'success',
          content: t('Operation Success'),
        })
      } catch (error) {
        console.log('error', error)
        toast.close()
        Toast.show({
          icon: 'fail',
          content: t('Operation Failed'),
        })
      }
    }
    setSelectedOrder([])
    getUserOrders()
  }

  return (
    <>
      <div className="hls-page">
        <div className="hls-banner">
          <h3>{t('Quick Operation')}<br />{t('Panel')}</h3>
          <p>{t('The main operation combines the pledge and unledged')}. {t('It can be executed directly with one click')}</p>
        </div>
        <div className="hls-list">
          {/* <div className="hls-list-item">
            <HlsIcon1 />
            <p>{t('Join the ecosystem in batches')}</p>
          </div>
          <div className="hls-list-item">
            <HlsIcon2 />
            <p>{t('Batch Redemption')}</p>
          </div>
          <div className="hls-list-item">
            <HlsIcon3 />
            <p>{t('Automatically interval to receive rewards')}</p>
          </div> */}
          <div className="hls-list-item" onClick={() => {
            setUserOrders([])
            getUserOrders()
          }}>
            <HlsIcon4 />
            <p>{t('Refresh order status')}</p>
          </div>
        </div>
        <div className="hls-status">
          <div className="hls-status-title">{t('Order Status')}</div>
          <div className="hls-status-item">
            <p>{t('Orders in Collaboration')}</p>
            <p>{props.formatAddress(ETH.account)}</p>
          </div>
          <div className="hls-status-item">
            <p>{t('My Stake Amount')}</p>
            <p>{infoList.baseStakedAmount} US$</p>
          </div>
          <div className="hls-status-item">
            <p>{t('My Staking Orders')}</p>
            <p>{infoList.stakeOrderCount}</p>
          </div>
          <div className="hls-status-item">
            <p>{t('My Unlockable Orders')}</p>
            <p>{infoList.canUnstakeCount}</p>
          </div>
          <div className="hls-status-item">
            <p>{t('My Reinvestable Orders')}</p>
            <p>{infoList.canRestakeCount}</p>
          </div>
          <div className="hls-status-item">
            <p>{t('My Withdrawable Reward Orders')}</p>
            <p>{infoList.claimableOrderCount}</p>
          </div>
          <div className="hls-status-item">
            <p>{t('Next Unlock Time')}</p>
            <p>{infoList.nextUnlockTime === '0' ? t('None') : dayjs(infoList.nextUnlockTime * 1000).format('YYYY-MM-DD hh:mm:ss')}</p>
          </div>
          <div className="hls-status-item">
            <p>{t('Next Expiry Time')}</p>
            <p>{infoList.nextTtlDeadline === '0' ? t('None') : dayjs(infoList.nextTtlDeadline * 1000).format('YYYY-MM-DD hh:mm:ss')}</p>
          </div>
          <div className="hls-status-item">
            <p>{t('Circuit Breaker Activation Time')}</p>
            <p>{infoList.circuitBreakerTime === '0' ? t('Not Enabled') : dayjs(infoList.circuitBreakerTime * 1000).format('YYYY-MM-DD hh:mm:ss')}</p>
          </div>
          <div className="hls-status-item">
            <p><span>{t('Pending Redemption Orders')}</span>  <button className="filter-btn" onClick={() => setVisible(true)}>{getFilterText()}<ChevronDown style={{width: 14}} /></button></p>
            <p className="operation-bar">{userOrders.filter(item => {
              if (pickerFilter === '') return item
              if (pickerFilter === 'canUnstake') return item.canUnstake
              if (pickerFilter === 'canRestake') return item.canRestake
              if (pickerFilter === 'canClaim') return item.canClaim
            }).length > 0 && (pickerFilter === 'canUnstake' || pickerFilter === 'canRestake' || pickerFilter === 'canClaim') && (
              <button onClick={() => handleAllSelected()}>
                {
                  userOrders.filter(item => {
                    if (pickerFilter === '') return item
                    if (pickerFilter === 'canUnstake') return item.canUnstake
                    if (pickerFilter === 'canRestake') return item.canRestake
                    if (pickerFilter === 'canClaim') return item.canClaim
                  }).length === selectedOrder.length ? t('Deselect All') : t('Select All')}
              </button>
            )}</p>
            {
              userOrders.filter(item => {
                if (pickerFilter === '') return item
                if (pickerFilter === 'canUnstake') return item.canUnstake
                if (pickerFilter === 'canRestake') return item.canRestake
                if (pickerFilter === 'canClaim') return item.canClaim
              }).length === 0 && <p>{t('None Orders')}</p>
            }
            <Checkbox.Group
              value={selectedOrder}
              onChange={v => {
                setSelectedOrder(v)
              }}
            >
              {
                userOrders.filter(item => {
                  if (pickerFilter === '') return item
                  if (pickerFilter === 'canUnstake') return item.canUnstake
                  if (pickerFilter === 'canRestake') return item.canRestake
                  if (pickerFilter === 'canClaim') return item.canClaim
                }).map((item, index) => {
                  return (
                    <label className="order-card" key={index}>
                      <div className="card-header">
                        <div className="period">
                          {
                            (pickerFilter === 'canUnstake' || pickerFilter === 'canRestake' || pickerFilter === 'canClaim') && (
                              <Checkbox key={item.index.toString()} value={item.index.toString()} style={{marginRight: 5}}></Checkbox>
                            )
                          }
                          {item.stakeIndex === 1 ? '180' : '30'} {t('Days Staked')}
                        </div>
                        <div className="amount">${ETH.formatToken(item.amount)}</div>
                      </div>
                      <div className="profit-group">
                        <div className="info-row">
                          <span className="info-label">{t('Net Profit')}</span>
                          <span className="info-value">${ETH.formatToken(item.grossValue)}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">{t('Profit')}</span>
                          <span className="info-value">${ETH.formatToken(item.profitValue)}</span>
                        </div>
                      </div>
                      <div className="info-row">
                        <span className="info-label">{t('Restake Deadline')}</span>
                        <span className="info-value">{item.ttlDeadline.toString() === '0' ? 'N/A' : dayjs(item.ttlDeadline.toString() * 1000).format('YYYY-MM-DD hh:mm:ss')}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">{t('Paused Seconds')}</span>
                        <span className="info-value">{item.pausedSeconds}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">{t('Effective Stake Seconds')}</span>
                        <span className="info-value">{item.effectiveStakeSeconds}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">{t('New Order During Circuit Breaker')}</span>
                        <span className="info-value">{item.cbNewOrder ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="btn-group">
                        <button className={classNames('btn', 'btn-unstake', {forbid: !item.canUnstake})} onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          handleUnStake(item.index.toString())
                        }}>{t('Unstake')}</button>
                        <button className={classNames('btn', 'btn-restake', {forbid: !item.canRestake})} onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          handleReStake(item.index.toString(), item.amount, '0', item.stakeIndex)
                        }}>{t('Restake')}</button>
                        <button className={classNames('btn', 'btn-claim', {forbid: !item.canClaim})} onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          handleClaim(item.index.toString())
                        }}>{t('Claim Profit')}</button>
                      </div>
                    </label>
                  )
                })
              }
            </Checkbox.Group>
          </div>
          {/* <div className="hls-status-item">
            <p>Waiting for investment to receive profit</p>
            <p>None</p>
          </div> */}
        </div>
      </div>
      {
        (pickerFilter === 'canUnstake' || pickerFilter === 'canRestake' || pickerFilter === 'canClaim') && selectedOrder.length > 0 && (
          <div className="footer-bar">
            <div className="selected-total"><span>{selectedOrder.length}</span> {t('Orders')}</div>
            <button className="all-operation-btn" onClick={() => handleAllData()}>{pickerFilter === 'canUnstake' ? t('All Unstake') : pickerFilter === 'canRestake' ? t('All Restake') : t('All Claim')}</button>
          </div>
        )
      }
      <Picker
        columns={basicColumns}
        visible={visible}
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        onClose={() => {
          setVisible(false)
        }}
        value={[pickerFilter]}
        onConfirm={v => {
          setPickerFilter(v[0])
        }}
      />
    </>
  )
}

export default Hls;