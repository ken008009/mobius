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
  const [orderCount, setOrderCount] = useState(0) // 订单数量（用于 claimLineAll）

  const { t } = props

  useEffect(() => {
    getPlansMinAmount() // 获取最小理财金额
    getUserCapLeftTotal() // 获取剩余额度
    getUserOrders() // 获取订单列表
    window.Big = Big
    
    // 检查是否有从 community 页面传递过来的需补足金额
    const stateNeedAmount = props.match?.state?.needAmount
    if (stateNeedAmount) {
      console.log('📥 从社区页面接收到需补足金额:', stateNeedAmount)
      // 回填金额会在 getPlansMinAmount 完成后处理
    }
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

  // 一键领取所有奖励
  const handleClaimAll = async () => {
    try {
      setLoading(true)
      
      // 确保钱包已连接
      if (!ETH.signer) {
        await ETH.getAccount()
      }
      
      // 使用 userView.orderCount 作为参数
      if (orderCount === 0) {
        Toast.show('暂无订单可领取')
        return
      }
      
      console.log('📡 调用 claimLineAll，参数:', { orderCount })
      
      const result = await ETH.claimLineAll(orderCount)
      console.log('✅ claimLineAll 成功:', result)
      
      Toast.show('领取成功！')
      
      // 刷新订单列表和额度
      getUserOrders()
      getUserCapLeftTotal()
    } catch (error) {
      console.error('❌ claimLineAll 失败:', error)
      Toast.show(error.message || '领取失败，请重试')
    } finally {
      setLoading(false)
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
        if (userData.orderCount !== undefined) {
          const count = Number(userData.orderCount)
          console.log('订单数量:', count)
          setOrderCount(count)
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
        
        const minValue = Number(min).toFixed(0)
        setMinAmount(minValue)
        console.log('✅ minAmount 状态已更新为:', minValue)
        
        // 检查是否有从 community 页面传递的 needAmount，回填到输入框
        const stateNeedAmount = props.match?.state?.needAmount
        if (stateNeedAmount !== undefined && stateNeedAmount !== null) {
          const needVal = Number(stateNeedAmount)
          const minVal = Number(minValue)
          // 如果 needAmount < minAmount，使用 minAmount，否则使用 needAmount
          const fillAmount = needVal < minVal ? minVal : needVal
          setAmount(fillAmount.toString())
          console.log('📤 回填金额到输入框:', fillAmount, '(needAmount:', needVal, ', minAmount:', minVal, ')')
        }
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

  // 新的理财方法：调用合约 stake(amount, plan)
  const handleStake = async () => {
    // 校验输入
    if (!amount) return Toast.show(t('Please enter an amount'))
    if (new Big(amount).lt(minAmount)) return Toast.show(`最低理财金额为 ${minAmount} USDT`)
    
    try {
      setLoading(true)
      
      // 确保钱包已连接
      if (!ETH.signer) {
        await ETH.getAccount()
      }
      
      // 检查 USDT 授权额度
      const allowance = await ETH.checkUsdtAllowance()
      const amountWei = ETH.parseUnits(amount, 18)
      console.log('amountWei', amountWei, 'allowance', allowance)
      
      // 如果授权额度不足，先授权
      if (allowance.lt(amountWei)) {
        console.log('🔐 USDT 授权额度不足，正在授权...')
        Toast.show('USDT 授权中...')
        const approveTx = await ETH.approveUsdt()
        await approveTx.wait()
        console.log('✅ USDT 授权成功')
      }
      
      console.log('📡 调用 stake，参数：', { amount, plan: 0 })
      
      // 调用合约 stake 方法，plan 默认为 0
      const result = await ETH.stake(amount, 0)
      
      console.log('✅ stake 成功:', result)
      Toast.show('理财成功！')
      
      // 清空输入框
      setAmount('')
      
      // 刷新所有页面数据
      getUserOrders()      // 刷新订单列表
      getUserCapLeftTotal() // 刷新剩余额度
      getPlansMinAmount()   // 刷新理财计划数据
      
    } catch (error) {
      console.error('❌ stake 失败:', error)
      Toast.show(error.message || '理财失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleStaking = async (status, parentAddress) => {
    // 旧的理财方法已弃用，使用新的 handleStake
    Toast.show(t('请使用新的理财按钮'))
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
            <input 
              type="number" 
              value={amount} 
              onChange={e => {
                // 只允许数字和小数点
                let val = e.target.value.replace(/[^0-9.]/g, '')
                
                // 防止多个小数点
                const parts = val.split('.')
                if (parts.length > 2) {
                  val = parts[0] + '.' + parts.slice(1).join('')
                }

                setAmount(val)
              }} 
              placeholder="请输入理财金额" 
              className="amount-input" 
            />
          </div>
        </div>
        <Button loading={loading} className="staking-btn" onClick={() => handleStake()}>开始理财</Button>


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
            <Button className="profit-treasure-btn" onClick={handleClaimAll} loading={loading}>一键领取</Button>
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
                  const linePaid = item.linePaid ? Number(ETH.formatUnits(item.linePaid, 18)) : 0
                  const daysCount = item.daysCount ? Number(item.daysCount) : 0
                  
                  // 计算每日释放 = capNow / daysCount
                  const dailyRelease = daysCount > 0 ? (capNow / daysCount) : 0
                  
                  // 计算剩余天数 = (capNow - linePaid) / (capNow / daysCount)
                  const remainingDays = dailyRelease > 0 ? ((capNow - linePaid) / dailyRelease) : 0
                  
                  return (
                    <div className="staking-table-row" key={index}>
                      <div className="staking-table-cell col-index">{index + 1}</div>
                      <div className="staking-table-cell col-amount">{capNow.toFixed(2)}</div>
                      <div className="staking-table-cell col-daily">{dailyRelease.toFixed(2)}</div>
                      <div className="staking-table-cell col-days">{remainingDays.toFixed(0)}天</div>
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