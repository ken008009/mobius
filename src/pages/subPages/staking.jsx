import React, {useState, useEffect, useRef} from 'react'
import { useLocation } from 'react-router-dom'
import { ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Button, Input, Dialog, Toast, Tag, InfiniteScroll } from 'antd-mobile'
import classnames from 'classnames'
import dayjs from 'dayjs'
import { Contract, ETH } from '@tools/contract'
import Big from 'big.js';
import FireVideo from '@components/FireVideo'
import { showJoinTeamDialog } from '@components/JoinTeamDialog'
import './styles/staking.less'

// const USDT = new Contract(import.meta.env.VITE_USDT, "ERC20"); // TODO: ABI 未定义
// const BUY = new Contract(import.meta.env.VITE_ZYSQ, "BUY"); // TODO: ABI 未定义

const AddressForm = (props) => {
  const [parentAddress, setParentAddress] = useState('')
  const { t } = props

  return (
    <>
      <div className="address-form">
        <p className="address-title">{t('Input Team Address')}</p>
        <Input className="address-input" placeholder={t('Enter team address')} onChange={(value) => {
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
        }}>{t('Confirm')}</Button></p>
      </div>
    </>
  )
}

const Staking = (props) => {
  const location = useLocation()
  const [active, setActive] = useState('0')
  const [amount, setAmount] = useState('')
  const [orders, setOrders] = useState([])
  const [ordersPage, setOrdersPage] = useState(1)      // 当前页码
  const ordersPageSize = 10                            // 每页条数（固定）
  const [ordersTotal, setOrdersTotal] = useState(0)    // 总条数
  const [hasMore, setHasMore] = useState(true)         // 是否还有更多数据
  const [ordersLoading, setOrdersLoading] = useState(false) // 加载中状态
  const [usdtApprove, setUsdtApprove] = useState(false)
  // 拆分 loading：stake 与 claim 互不干扰，避免各自按钮在另一个流程进行时错误变成 loading 状态
  const [stakeLoading, setStakeLoading] = useState(false)
  const [claimLoading, setClaimLoading] = useState(false)
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
  
  // 从路由状态中获取 needAmount（从 community 页面传递过来）
  const routeNeedAmount = location.state?.needAmount

  // 路由参数只回填一次，避免 stake 成功后 getPlansMinAmount() 被再次调用时覆盖刚被清空的输入框
  // 类比 Vue：相当于一个非响应式的实例字段，仅用于跨渲染记忆一个 flag
  const hasFilledRouteAmountRef = useRef(false)

  // 卸载标记：阻止异步回调在组件卸载后调用 setState
  // 用 useRef 而非 useState，因为它不需要触发重渲染（类比 Vue 的非响应式实例字段）
  const cancelledRef = useRef(false)

  // 实时加载标记：防止重复加载竞态（React setState 是异步的）
  // 与 ordersLoading state 同步使用，但 ref 能立即读取最新值
  const loadingRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    loadingRef.current = false
    // 四个 RPC 请求互不依赖，并行触发可显著缩短首屏数据加载时间
    Promise.all([
      getPlansMinAmount(),
      getUserCapLeftTotal(),
      getUserOrders(1),
      checkUserRegistered()
    ]).catch(error => {
      console.error('❌ 初始化数据加载失败:', error)
    })
    
    // 检查是否有从 community 页面传递过来的需补足金额
    if (routeNeedAmount) {
      console.log('📥 从社区页面接收到需补足金额:', routeNeedAmount)
      // 回填金额会在 getPlansMinAmount 完成后处理
    }

    return () => {
      cancelledRef.current = true
    }
    // 依赖 ETH.account：账户切换时重新加载数据
  }, [ETH.account])

  const checkUserRegistered = async () => {
    try {
      if (!ETH.signer) {
        await ETH.getAccount()
      }
      
      const userData = await ETH.userView()
      // 卸载后放弃 setState
      if (cancelledRef.current) return
      
      if (userData) {
        // 优先使用 bound 字段
        if (userData.bound !== undefined) {
          setIsRegistered(userData.bound)
        } else if (userData.parent && userData.parent !== '0x0000000000000000000000000000000000000000') {
          setIsRegistered(true)
        } else {
          // 明确设为 false，防止旧状态残留
          setIsRegistered(false)
        }
      }
    } catch (error) {
      console.error('检查用户绑定状态失败:', error)
    }
  }

  // 获取用户订单列表（触底加载模式）
  const getUserOrders = async (page, pageSize = ordersPageSize, isLoadMore = false) => {
    // 防止重复加载：使用 ref 实时检查（避免 setState 异步延迟问题）
    if (loadingRef.current) return
    loadingRef.current = true
    setOrdersLoading(true)
    
    try {
      // 先连接钱包，确保 signer 存在
      if (!ETH.signer) {
        await ETH.getAccount()
      }
      
      console.log('📡 正在调用 ETH.getUserOrders()...', { page, pageSize, isLoadMore })
      // 合约方法参数: (address, page, pageSize)，page 从 0 开始
      const result = await ETH.getUserOrders(ETH.account, page - 1, pageSize)
      console.log('✅ 获取到 orders 数据:', result)
      
      // 卸载后放弃 setState
      if (cancelledRef.current) return
      
      // 解析返回结果
      let newOrders = []
      let total = 0
      
      if (result && Array.isArray(result.list)) {
        newOrders = result.list || []
        total = Number(result.total) || 0
      } else if (Array.isArray(result)) {
        newOrders = result || []
        total = result.length
      }
      
      // 更新总条数
      setOrdersTotal(total)
      
      // 追加或替换数据，同时判断是否还有更多
      // 使用函数式更新避免 React 闭包陷阱（类比 Vue 的响应式代理）
      if (isLoadMore) {
        // 触底加载：追加数据
        setOrders(prev => {
          const newList = [...prev, ...newOrders]
          setHasMore(newList.length < total)
          return newList
        })
      } else {
        // 首次加载或刷新：替换数据
        setHasMore(newOrders.length < total)
        setOrders(newOrders)
      }
      
    } catch (error) {
      console.error('❌ 获取 orders 失败:', error)
      if (!isLoadMore) {
        setOrders([])
        setOrdersTotal(0)
      }
      setHasMore(false)
    } finally {
      loadingRef.current = false
      setOrdersLoading(false)
    }
  }

  // 触底加载更多
  const loadMoreOrders = async () => {
    if (!hasMore || loadingRef.current) return
    
    // 使用函数式更新页码，确保获取最新值（避免 React 闭包陷阱）
    setOrdersPage(prev => {
      const nextPage = prev + 1
      // 立即执行加载，不等待 setState 完成
      getUserOrders(nextPage, ordersPageSize, true)
      return nextPage
    })
  }

  // 刷新订单列表（重置到第一页）
  const refreshOrders = async () => {
    setOrdersPage(1)
    setHasMore(true)
    await getUserOrders(1, ordersPageSize, false)
  }

  // 一键领取所有奖励
  const handleClaimAll = async () => {
    // 提前检查订单数量，避免不必要的 loading 状态
    if (orderCount === 0) {
      Toast.show(t('No orders to claim'))
      return
    }
    
    try {
      setClaimLoading(true)
      
      // 确保钱包已连接
      if (!ETH.signer) {
        await ETH.getAccount()
      }
      
      console.log('📡 调用 claimLineAll，参数:', { orderCount })
      
      const result = await ETH.claimLineAll(orderCount)
      console.log('✅ claimLineAll 成功:', result)
      
      Toast.show(t('Claim successful'))
      
      // 刷新订单列表和额度
      await refreshOrders()
      await getUserCapLeftTotal()
    } catch (error) {
      console.error('❌ claimLineAll 失败:', error)
      Toast.show(error.message || t('Claim failed, please try again'))
    } finally {
      if (!cancelledRef.current) {
        setClaimLoading(false)
      }
    }
  }

  const getUserCapLeftTotal = async () => {
    try {
      const userData = await ETH.userView()
      console.log('✅ 获取到 userView 数据:', userData)
      
      // 卸载后放弃 setState
      if (cancelledRef.current) return
      
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
        
        // 卸载检查放在 setState 之前
        if (cancelledRef.current) return

        const minValue = Number(min).toFixed(0)
        setMinAmount(minValue)
        console.log('✅ minAmount 状态已更新为:', minValue)
        
        // 检查是否有从 community 页面传递的 needAmount，回填到输入框
        // 仅首次加载时执行，避免 stake 成功后重新获取 plans 时再次覆盖输入框
        if (
          !hasFilledRouteAmountRef.current &&
          routeNeedAmount !== undefined &&
          routeNeedAmount !== null
        ) {
          hasFilledRouteAmountRef.current = true
          const needVal = Number(routeNeedAmount)
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
        content: <AddressForm t={t} onChange={value => {
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
    // 检查是否已绑定上级
    if (!isRegistered) {
      showJoinTeamDialog({
        t,
        onSuccess: (address) => {
          console.log('绑定成功，上级地址:', address)
          setIsRegistered(true)
          Toast.show(t('Binding successful! You can now start staking'))
        }
      })
      return
    }

    // 校验输入
    if (!amount) return Toast.show(t('Please enter an amount'))
    if (new Big(amount).lt(minAmount)) return Toast.show(t('Minimum staking amount is {{amount}} USDT', { amount: minAmount }))
    
    try {
      setStakeLoading(true)
      
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
        Toast.show(t('USDT approving...'))
        const approveTx = await ETH.approveUsdt()
        await approveTx.wait()
        console.log('✅ USDT 授权成功')
      }
      
      console.log('📡 调用 stake，参数：', { amount, plan: 0 })
      
      // 调用合约 stake 方法，plan 默认为 0
      const result = await ETH.stake(amount, 0)
      
      console.log('✅ stake 成功:', result)
      Toast.show(t('Staking successful'))
      
      // 清空输入框
      setAmount('')
      
      // 刷新订单列表（必须 await 保证数据一致性）
      await refreshOrders()
      // 其他数据后台刷新，不阻塞 UI
      getUserCapLeftTotal()
      getPlansMinAmount()
      
    } catch (error) {
      console.error('❌ stake 失败:', error)
      Toast.show(error.message || t('Staking failed, please try again'))
    } finally {
      if (!cancelledRef.current) {
        setStakeLoading(false)
      }
    }
  }

  // 旧的理财方法已弃用，使用新的 handleStake
  const handleStaking = () => {
    Toast.show(t('Please use the new staking button'))
  }

  const handleSelectMax = () => {
    let maxAmount = new Big(maxStakeAmountNow).toString()

    maxAmount = maxAmount > 1000 ? 1000 : maxAmount

    if (usdtBalance > maxAmount) {
      setAmount(maxAmount)
    } else {
      setAmount(usdtBalance > 0 ? usdtBalance.toString() : '')
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
          <h3>{t('STAKING')}</h3>
          <FireVideo />
        </div>
        <div className="staking-amount">
          <div className="staking-amount-title">
            <span>{t('Staking Amount (USDT)')}</span>
            <span className="staking-amount-hint">{t('Minimum {{amount}} USDT', { amount: minAmount })}</span>
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
              placeholder={t('Enter staking amount')} 
              className="amount-input" 
            />
          </div>
        </div>
        <Button loading={stakeLoading} className="staking-btn" onClick={() => handleStake()}>{t('Start Staking')}</Button>


        <div className="profit-treasure">
          <div className="profit-treasure-title">{t('Profit Treasure')}</div>
          <div className="profit-treasure-content">
            <div className="profit-treasure-item">
              <div className="profit-treasure-label">{t('Remaining Cap')}</div>
              <div className="profit-treasure-value">{capLeftTotal} USDT</div>
            </div>
            <div className="profit-treasure-item">
              <div className="profit-treasure-label">{t('Claimable Reward')}</div>
              <div className="profit-treasure-value">{lineClaimableTotal} USDT</div>
            </div>
            <Button className="profit-treasure-btn" onClick={handleClaimAll} loading={claimLoading}>{t('Claim All')}</Button>
          </div>
        </div>
       
       {/* 序号  剩余额度  可领额度  操作 */}
        <div className="staking-log">
          <div className="staking-log-title">{t('Order Records')}</div>
          <div className="staking-table">
            <div className="staking-table-head">
              <div className="staking-table-row">
                <div className="staking-table-cell col-index">{t('No.')}</div>
                <div className="staking-table-cell col-amount">{t('Remaining Cap')}</div>
                <div className="staking-table-cell col-daily">{t('Daily Release')}</div>
                <div className="staking-table-cell col-days">{t('Remaining Days')}</div>
              </div>
            </div>
            <div className="staking-table-main">
              {orders.length === 0 && !ordersLoading && <div className="no-data">{t('No order records')}</div>}
              {
                orders.map((item, index) => {
                  // 格式化字段
                  const capNow = item.capNow ? Number(ETH.formatUnits(item.capNow, 18)) : 0
                  const linePaid = item.linePaid ? Number(ETH.formatUnits(item.linePaid, 18)) : 0
                  const daysCount = item.daysCount ? Number(item.daysCount) : 0
                  
                  // 计算每日释放 = capNow / daysCount
                  const dailyRelease = daysCount > 0 ? (capNow / daysCount) : 0
                  
                  // 计算剩余天数 = (capNow - linePaid) / (capNow / daysCount)，确保不为负数
                  const remainingDays = dailyRelease > 0 ? Math.max(0, (capNow - linePaid) / dailyRelease) : 0
                  
                  return (
                    <div className="staking-table-row" key={item.id || index}>
                      <div className="staking-table-cell col-index">{index + 1}</div>
                      <div className="staking-table-cell col-amount">{capNow.toFixed(2)}</div>
                      <div className="staking-table-cell col-daily">{dailyRelease.toFixed(2)}</div>
                      <div className="staking-table-cell col-days">{remainingDays.toFixed(0)}</div>
                    </div>
                  )
                })
              }
            </div>
          </div>
          {/* 触底加载指示器 */}
          <InfiniteScroll
            loadMore={loadMoreOrders}
            hasMore={hasMore}
            threshold={50}
          >
            {ordersLoading && hasMore && (
              <div className="loading-more">{t('Loading...')}</div>
            )}
          </InfiniteScroll>
        </div>
      </div>
    </>
  )
}

export default Staking;