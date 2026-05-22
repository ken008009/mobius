import React, {useState, useEffect, useRef} from 'react'
import CommunityBanner from '@images/m/community-banner.png'
import { Contract, ETH } from '@tools/contract'
import { Input, Button, Dialog, Toast, InfiniteScroll } from 'antd-mobile'
import { X } from 'lucide-react'
import { showJoinTeamDialog } from '@components/JoinTeamDialog'
import './styles/community.less'

const Community = (props) => {
  const [basePerf, setBasePerf] = useState('0')
  const [level, setLevel] = useState('0')
  const [teamCount, setTeamCount] = useState('0')
  const [teamU, setTeamU] = useState('0') // 可领取奖励
  const [levelRewardTotal, setLevelRewardTotal] = useState('0') // 手续费分红
  const [teamNeedCap, setTeamNeedCap] = useState('0') // 需补足金额
  const [needAmount, setNeedAmount] = useState('0') // 需补足金额（计算公式结果）
  const [childrenList, setChildrenList] = useState([]) // 团队用户列表（来自合约 children()）
  const [childrenPage, setChildrenPage] = useState(1)      // 当前页码
  const childrenPageSize = 10                            // 每页条数（固定）
  const [childrenTotal, setChildrenTotal] = useState(0)    // 总条数
  const [hasMore, setHasMore] = useState(true)             // 是否还有更多数据
  const [childrenLoading, setChildrenLoading] = useState(false) // 加载中状态
  const [baseStakedAmount, setBaseStakedAmount] = useState('0')
  const [isRegistered, setIsRegistered] = useState(false)
  const [parent, setParent] = useState('')
  // 仅用于 handleClaimTeam，独立 loading 状态
  const [claimLoading, setClaimLoading] = useState(false)

  const { t } = props

  // 卸载标记：阻止异步回调在组件卸载后调用 setState
  // 用 useRef 而非 useState，因为它不需要触发重渲染（类比 Vue 的非响应式实例字段）
  const cancelledRef = useRef(false)

  // 实时加载标记：防止重复加载竞态（React setState 是异步的）
  // 与 childrenLoading state 同步使用，但 ref 能立即读取最新值
  const loadingRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    loadingRef.current = false
    // 两个 RPC 请求互不依赖，并行触发可显著缩短首屏数据加载时间
    Promise.all([getChildrenPage(1), getUserView()])
    return () => {
      cancelledRef.current = true
    }
    // 依赖 ETH.account：账户切换时重新加载数据
  }, [ETH.account])

  // 获取团队列表（触底加载模式）
  const getChildrenPage = async (page, pageSize = childrenPageSize, isLoadMore = false) => {
    // 防止重复加载：使用 ref 实时检查（避免 setState 异步延迟问题）
    if (loadingRef.current) return
    loadingRef.current = true
    setChildrenLoading(true)
    
    try {
      // 先连接钱包，确保 signer 存在
      if (!ETH.signer) {
        await ETH.getAccount()
      }
      
      console.log('📡 正在调用 ETH.children()...', { page, pageSize, isLoadMore })
      // 合约方法参数: (address, page, pageSize)，page 从 0 开始
      const result = await ETH.children(ETH.account, (page - 1) * pageSize, pageSize)
      console.log('✅ 获取到 children 数据:', result)
      
      // 卸载后不再 setState
      if (cancelledRef.current) return
      
      // 解析返回结果：可能是数组或包含列表+总数的对象
      let newChildren = []
      let total = 0
      
      if (result && Array.isArray(result.list)) {
        newChildren = result.list || []
        total = Number(result.total) || 0
      } else if (Array.isArray(result)) {
        newChildren = result || []
        total = result.length
      }
      
      // 格式化数据
      const formattedChildren = newChildren.map(item => ({
        account: item.account,
        baseStake: item.baseStake ? Number(ETH.formatUnits(item.baseStake, 18)).toFixed(2) : '0',
        perf: item.perf ? Number(ETH.formatUnits(item.perf, 18)).toFixed(2) : '0'
      }))
      
      // 更新总条数
      setChildrenTotal(total)
      
      // 追加或替换数据，同时判断是否还有更多
      // 使用函数式更新避免 React 闭包陷阱（类比 Vue 的响应式代理）
      if (isLoadMore) {
        // 触底加载：追加数据
        setChildrenList(prev => {
          const newList = [...prev, ...formattedChildren]
          setHasMore(newList.length < total)
          return newList
        })
      } else {
        // 首次加载或刷新：替换数据
        setHasMore(formattedChildren.length < total)
        setChildrenList(formattedChildren)
      }
      
    } catch (error) {
      console.error('❌ 获取 children 失败:', error)
      if (!isLoadMore) {
        setChildrenList([])
        setChildrenTotal(0)
      }
      setHasMore(false)
    } finally {
      loadingRef.current = false
      setChildrenLoading(false)
    }
  }

  // 触底加载更多
  const loadMoreChildren = async () => {
    if (!hasMore || loadingRef.current) return
    
    // 使用函数式更新页码，确保获取最新值（避免 React 闭包陷阱）
    setChildrenPage(prev => {
      const nextPage = prev + 1
      // 立即执行加载，不等待 setState 完成
      getChildrenPage(nextPage, childrenPageSize, true)
      return nextPage
    })
  }

  // 刷新团队列表（重置到第一页）
  const refreshChildren = async () => {
    setChildrenPage(1)
    setHasMore(true)
    await getChildrenPage(1, childrenPageSize, false)
  }

  // 领取团队奖励
  const handleClaimTeam = async () => {
    try {
      setClaimLoading(true)
      
      // 确保钱包已连接（ETH.getAccount 有 Promise 锁，并发调用只触发一次）
      if (!ETH.signer) {
        await ETH.getAccount()
      }
      
      console.log('📡 调用 claimTeam，参数:', { amount: teamU })
      
      const result = await ETH.claimTeam(teamU)
      console.log('✅ claimTeam 成功:', result)
      
      Toast.show(t('Claim successful'))
      
      // 刷新用户数据（不手动设置 teamU，完全依赖 getUserView 刷新）
      await getUserView()
    } catch (error) {
      console.error('❌ claimTeam 失败:', error)
      Toast.show(error.message || t('Claim failed, please try again'))
    } finally {
      if (!cancelledRef.current) setClaimLoading(false)
    }
  }

  const getUserView = async () => {
    try {
      // 先连接钱包，确保 signer 存在
      if (!ETH.signer) {
        await ETH.getAccount()
      }
      
      const userData = await ETH.userView()
      console.log('✅ community.jsx 获取到 userView 数据:', userData)
      
      // 卸载后立即放弃，避免后续一连串 setState
      if (cancelledRef.current) return
      
      if (userData) {
        // 从 userView 获取所有字段
        if (userData.basePerf) {
          const basePerfValue = ETH.formatUnits(userData.basePerf, 18)
          console.log('basePerf:', basePerfValue)
          setBasePerf(basePerfValue)
        }
        if (userData.level !== undefined) {
          const levelValue = userData.level.toString() === '-1' ? '0' : userData.level.toString()
          console.log('level:', levelValue)
          setLevel(levelValue)
        }
        if (userData.parent) {
          setParent(userData.parent)
        }
        if (userData.teamClaimed) {
          const teamClaimed = ETH.formatUnits(userData.teamClaimed, 18)
          console.log('teamClaimed:', teamClaimed)
          setTeamCount(teamClaimed)
        }
        if (userData.teamU) {
          const teamUValue = ETH.formatUnits(userData.teamU, 18)
          console.log('teamU:', teamUValue)
          setTeamU(teamUValue)
        }
        if (userData.levelRewardTotal) {
          const levelRewardTotalValue = ETH.formatUnits(userData.levelRewardTotal, 18)
          console.log('levelRewardTotal:', levelRewardTotalValue)
          setLevelRewardTotal(levelRewardTotalValue)
        }
        let parsedTeamNeedCap = '0'
        if (userData.teamNeedCap) {
          parsedTeamNeedCap = ETH.formatUnits(userData.teamNeedCap, 18)
          console.log('teamNeedCap:', parsedTeamNeedCap)
          setTeamNeedCap(parsedTeamNeedCap)
        }
        // 优先使用合约的 bound 字段判断是否已绑定
        if (userData.bound !== undefined) {
          setIsRegistered(userData.bound)
        } else if (userData.parent && userData.parent !== '0x0000000000000000000000000000000000000000') {
          // 如果 bound 字段不存在，则通过 parent 地址判断
          setIsRegistered(true)
        } else {
          // 明确设为 false，防止旧状态残留
          setIsRegistered(false)
        }
        if (userData.baseStake) {
          const baseStake = ETH.formatUnits(userData.baseStake, 18)
          setBaseStakedAmount(baseStake)
        }
      
        // 获取 plans 计算需补足金额
        try {
          const plans = await ETH.plans()
          console.log('✅ 获取到 plans 数据:', plans)
          // 卸载后放弃 setState
          if (cancelledRef.current) return
          if (plans && plans.length > 0 && plans[0].outAmount && plans[0].maxAmount) {
            const outAmount = Number(ETH.formatUnits(plans[0].outAmount, 18))
            const maxAmount = Number(ETH.formatUnits(plans[0].maxAmount, 18))
            const teamNeedCapValue = Number(parsedTeamNeedCap)
            
            // 计算公式：teamNeedCap/(outAmount/maxAmount)
            if (outAmount > 0 && maxAmount > 0) {
              const need = teamNeedCapValue / (outAmount / maxAmount)
              console.log('需补足金额计算:', teamNeedCapValue, '/', '(', outAmount, '/', maxAmount, ')', '=', need)
              setNeedAmount(Math.ceil(need).toString())
            }
          }
        } catch (plansError) {
          console.error('❌ 获取 plans 失败:', plansError)
        }
      }
    } catch (error) {
      console.error('❌ 获取 userView 失败:', error)
    }
  }

  const handleJoinTeam = () => {
    showJoinTeamDialog({
      t,
      onSuccess: (address) => {
        setParent(address)
        setIsRegistered(true)
        // 刷新用户数据
        getUserView()
      }
    })
  }

  return (
    <>
      <div className="community-page">
        <div className="community-banner"><img src={CommunityBanner} /></div>
        {
          !isRegistered && <button className="join-team-btn" onClick={() => handleJoinTeam()}>{t('Join Team')}</button>
        }
        <div className="community-info full-width">
          {/* {
            isRegistered && (
              <div className="community-info-item full-width">
                <h3>{t('My Top')}</h3>
                <p>{props.formatAddress(parent)}</p>
              </div>
            )
          } */}
          <div className="community-info-item full-width">
            <h3>{t('My Level')}</h3>
            <p>{level}</p>
          </div>
          <div className="community-info-item">
            <h3>{t('Team Performance')}</h3>
            <p>{basePerf} US$</p>
          </div>
          <div className="community-info-item">
            <h3>{t('Claimed Team Rewards')}</h3>
            <p>{teamCount} US$</p>
          </div>
        </div>

        <div className="community-reward">
          <div className="reward-content">
            <div className="reward-item">
              <span className="reward-label">{t('Claimable Reward')}</span>
              <span className="reward-value">{teamU} USDT</span>
              <button className="reward-buy-btn" onClick={handleClaimTeam} disabled={Number(teamU) < 0}>
                {t('Claim All')}
              </button>
            </div>
            <div className="reward-item highlight">
              <span className="reward-label">{t('Amount to Replenish')}</span>
              <span className="reward-value">{needAmount} USDT</span>
              <button className="reward-buy-btn" onClick={() => {
                // 需补足金额大于0时才跳转
                const amount = Number(needAmount)
                if (amount <= 0) {
                  Toast.show(t('No amount to replenish'))
                  return
                }
                // 跳转到理财页面，传递需补足金额
                props.navigate('/staking', { state: { needAmount: amount } })
              }}>{t('Buy Cap')}</button>
            </div>
            <div className="reward-notice">
              <span>{t('⏰ Claim within 7 days, or rewards will not be counted')}</span>
            </div>
          </div>
        </div>


        {/* 手续费分红 */}
        <div className="community-reward">
          <div className="reward-content">
            <div className="reward-item">
              <span className="reward-label">{t('Fee Dividend')}</span>
              <span className="reward-value">{levelRewardTotal} USDT</span>
            </div>
          </div>
        </div>


        {/* {<div className="community-data">
          <div className="community-data-item">
            <span>My Performance：</span>{teamCount}
          </div>
          <div className="community-data-item">
            <span>Team size</span>
          </div>
          <div className="community-data-item">
            <span>Cumulative income</span>
          </div>
        </div> } */}
        {/* 团队明细  序号 地址 盈利宝额度  业绩  团队奖励 */}
        <div className="community-list">
          <div className="community-list-title">{t('Team List')}</div>
          <div className="community-table">
            <div className="community-table-head">
              <div className="community-table-row">
                <div className="community-table-cell col-index">{t('No.')}</div>
                <div className="community-table-cell col-address">{t('Wallet Addresses')}</div>
                <div className="community-table-cell col-amount">{t('Amount')}</div>
                <div className="community-table-cell col-perf">{t('Performance')}</div>
              </div>
            </div>
            <div className="community-table-main">
              {
                childrenList.length === 0 && !childrenLoading && <div className="no-data">{t('No team data')}</div>
              }
              {
                childrenList.map((item, index) => (
                  <div className="community-table-row" key={`${item.account}-${index}`}>
                    <div className="community-table-cell col-index">{index + 1}</div>
                    <div className="community-table-cell col-address">{props.formatAddress(item.account)}</div>
                    <div className="community-table-cell col-amount">{item.baseStake} USDT</div>
                    <div className="community-table-cell col-perf">{item.perf} USDT</div>
                  </div>
                ))
              }
            </div>
          </div>
          {/* 触底加载指示器 */}
          <InfiniteScroll
            loadMore={loadMoreChildren}
            hasMore={hasMore}
            threshold={50}
          >
            {childrenLoading && hasMore && (
              <div className="loading-more">{t('Loading...')}</div>
            )}
          </InfiniteScroll>
        </div>
      </div>
    </>
  )
}

export default Community;