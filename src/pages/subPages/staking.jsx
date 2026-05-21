import React, {useState, useEffect} from 'react'
import { ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Button, Input, Dialog, Toast, Tag } from 'antd-mobile'
import classnames from 'classnames'
import dayjs from 'dayjs'
import { Contract, ETH } from '@tools/contract'
import Big from 'big.js';
import FireVideo from '@components/FireVideo'
import './styles/staking.less'

// const USDT = new Contract(import.meta.env.VITE_USDT, "ERC20"); // TODO: ABI 未定义
// const BUY = new Contract(import.meta.env.VITE_ZYSQ, "BUY"); // TODO: ABI 未定义

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
  const [minAmount, setMinAmount] = useState(0) // 默认 0，从合约获取后更新
  const [capLeftTotal, setCapLeftTotal] = useState(0) // 剩余额度
  const [lineClaimableTotal, setLineClaimableTotal] = useState(0) // 可领取奖励

  const { t } = props

  useEffect(() => {
    getPlansMinAmount() // 获取最小理财金额
    getUserCapLeftTotal() // 获取剩余额度
    getUserOrders() // 获取订单列表
    window.Big = Big
  }, [])

  const getUserOrders = async () => {
    try {
      // 先连接钱包，确保 signer 存在
      if (!ETH.signer) {
        await ETH.getAccount()
      }
      
      console.log('📡 正在调用 ETH.orders()...')
      const orders = await ETH.orders()
      console.log('✅ 获取到 orders 数据:', orders)
      setOrders(orders || [])
    } catch (error) {
      console.error('❌ 获取 orders 失败:', error)
    }
  }

  const getUserCapLeftTotal = async () => {
    try {
      const userData = await ETH.userView()
      console.log('✅ 获取到 userView 数据:', userData)
      
      if (userData) {
        if (userData.capLeftTotal) {
          const capLeft = ETH.formatUnits(userData.capLeftTotal, 18)
          console.log('剩余额度:', capLeft)
          setCapLeftTotal(Number(capLeft))
        }
        if (userData.lineClaimableTotal) {
          const claimable = ETH.formatUnits(userData.lineClaimableTotal, 18)
          console.log('可领取奖励:', claimable)
          setLineClaimableTotal(Number(claimable))
        }
      }
    } catch (error) {
      console.error('❌ 获取 userView 失败:', error)
    }
  }

  const getPlansMinAmount = async () => {
    try {
      console.log('📡 正在调用 ETH.plans()...')
      const plans = await ETH.plans()
      console.log('✅ 获取到 plans 原始数据:', plans)
      
      if (plans && plans.length > 0) {
        console.log('plans[0] 完整数据:', plans[0])
        console.log('plans[0].minAmount (原始 wei):', plans[0].minAmount.toString())
        
        // plans[0].minAmount 是 wei 单位，转换为 USDT（18 位小数）
        const min = ETH.formatUnits(plans[0].minAmount, 18)
        console.log('转换后的 minAmount:', min)
        
        setMinAmount(Number(min).toFixed(0))
        console.log('✅ minAmount 状态已更新为:', Number(min).toFixed(0))
      } else {
        console.warn('⚠️ plans 返回空数组，使用默认值 0')
      }
    } catch (error) {
      console.error('❌ 获取 plans 失败:', error)
    }
  }

  // TODO: 新 ABI 字段与旧代码不匹配，需要重新适配
  // const getMaxStakeAmountNow = async () => {
  //   const globalView = await ETH.globalView()
  //   // 注意：新 ABI 返回的字段名不同
  //   console.log('globalView', globalView)
  // }

  // const getUsdtBalance = async () => {
  //   // 方法已移除
  // }

  // const getUsdtAllowance = async (callback) => {
  //   // USDT 合约 ABI 未定义
  // }

  // const handleUsdtApprove = (parentAddress) => {
  //   // 暂时禁用
  // }

  const handleRegistered = async (status) => {
    if (!amount) return Toast.show(t('Please enter an amount'))
    if (new Big(amount).lt(minAmount) || new Big(amount).gt('1000')) return Toast.show(`${t('Staking amount per order')}${minAmount}～1000USDT`)
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
    // TODO: ETH.stake / ETH.stakeWithInviter 方法已移除，需要重新实现
    Toast.show(t('Staking temporarily unavailable'))
    // setLoading(true)
    // const approve = status || usdtApprove
    // if (!approve) return handleUsdtApprove(parentAddress)
    // const amountNum = new Big(amount).times('1e18').toFixed(0)
    // try {
    //   if (parentAddress) {
    //     await ETH.stakeWithInviter(amountNum, '0', active, parentAddress)
    //     setIsRegistered(true)
    //   } else {
    //     await ETH.stake(amountNum, '0', active)
    //   }
    //   setAmount('')
    //   setLoading(false)
    //   setIsRegistered(true)
    //   Toast.show(t('Transaction successful'))
    // } catch (error) {
    //   console.log(error)
    //   setLoading(false)
    //   Toast.show(t('Transaction failed'))
    // }
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
        {/* <div className="staking-join-team">
          加入团队
        </div> */}

  
        <div className="staking-banner">
          <h3>理财</h3>
          <FireVideo />
        </div>
        <div className="staking-amount">
          <div className="staking-amount-title">
            <span>理财金额（USDT）</span>
            <span className="staking-amount-hint">最低 {minAmount} USDT</span>
          </div>
          <div className="staking-amount-form" style={{marginBottom: 20}}>
            <input type="number" value={amount} onChange={e => {
              const maxAmount = new Big(maxStakeAmountNow).toString()

              if (Number(e.target.value) > Number(maxAmount)) {
                return setAmount(maxAmount)
              }

              setAmount(e.target.value)
            }} placeholder="请输入理财金额" className="amount-input" />
          </div>
        </div>
        <Button loading={loading} className="staking-btn" onClick={() => handleRegistered()}>开始理财</Button>


        <div className="profit-treasure">
          <div className="profit-treasure-title">盈利宝</div>
          <div className="profit-treasure-content">
            <div className="profit-treasure-item">
              <div className="profit-treasure-label">剩余额度</div>
              <div className="profit-treasure-value">{capLeftTotal} USDT</div>
            </div>
            <div className="profit-treasure-item">
              <div className="profit-treasure-label">可领取奖励</div>
              <div className="profit-treasure-value">{lineClaimableTotal} USDT</div>
            </div>
            <Button className="profit-treasure-btn">一键领取</Button>
          </div>
        </div>
       
       {/* 订单  额度  每日释放额度  剩余天数  已领取额度 */}
        <div className="staking-log">
          <div className="staking-log-title">订单记录</div>
          <div className="staking-table">
            <div className="staking-table-head">
              <div className="staking-table-row">
                <div className="staking-table-cell col-index">序号</div>
                <div className="staking-table-cell col-amount">额度</div>
                <div className="staking-table-cell col-daily">每日释放</div>
                <div className="staking-table-cell col-days">剩余天数</div>
                <div className="staking-table-cell col-used">已领取</div>
              </div>
            </div>
            <div className="staking-table-main">
              {orders.length === 0 && <div className="no-data">暂无订单记录</div>}
              {
                orders.map((item, index) => {
                  // 格式化字段
                  const capNow = item.capNow ? Number(ETH.formatUnits(item.capNow, 18)) : 0
                  const used = item.used ? Number(ETH.formatUnits(item.used, 18)) : 0
                  const daysCount = item.daysCount ? Number(item.daysCount) : 0
                  
                  // 计算每日释放 = capNow / daysCount
                  const dailyRelease = daysCount > 0 ? (capNow / daysCount) : 0
                  
                  // 计算剩余天数 = (capNow - used) / (capNow / daysCount)
                  const remainingDays = dailyRelease > 0 ? ((capNow - used) / dailyRelease) : 0
                  
                  return (
                    <div className="staking-table-row" key={index}>
                      <div className="staking-table-cell col-index">{index + 1}</div>
                      <div className="staking-table-cell col-amount">{capNow.toFixed(2)}</div>
                      <div className="staking-table-cell col-daily">{dailyRelease.toFixed(2)}</div>
                      <div className="staking-table-cell col-days">{remainingDays.toFixed(1)}天</div>
                      <div className="staking-table-cell col-used">{used.toFixed(2)}</div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Staking;