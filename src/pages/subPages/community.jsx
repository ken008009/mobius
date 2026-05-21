import React, {useState, useEffect} from 'react'
import CommunityBanner from '@images/m/community-banner.png'
import { Contract, ETH } from '@tools/contract'
import { Input, Button, Dialog, Toast } from 'antd-mobile'
import { X } from 'lucide-react'
import './styles/community.less'

const JoinTeamForm = (props) => {
  const [address, setAddress] = useState('')

  return (
    <>
      <div className="address-form">
        <X className="close-btn" onClick={() => props.onChange && props.onChange()} />
        <p className="address-title">Input Team Address</p>
        <Input className="address-input" placeholder="Enter team address" onChange={(value) => {
          setAddress(value)
        }} />
        <p><Button className="address-btn" onClick={() => {
          if (!address) {
            Toast.show({
              content: t('Please enter the Team address')
            })
            return
          }

          props.onChange && props.onChange(address)
        }}>JOIN</Button></p>
      </div>
    </>
  )
}

const Community = (props) => {
  const [basePerf, setBasePerf] = useState('0')
  const [level, setLevel] = useState('0')
  const [teamCount, setTeamCount] = useState('0')
  const [teamU, setTeamU] = useState('0') // 可领取奖励
  const [levelRewardTotal, setLevelRewardTotal] = useState('0') // 手续费分红
  const [teamNeedCap, setTeamNeedCap] = useState('0') // 需补足金额
  const [needAmount, setNeedAmount] = useState('0') // 需补足金额（计算公式结果）
  const [childrenList, setChildrenList] = useState([]) // 团队用户列表（来自合约 children()）
  const [baseStakedAmount, setBaseStakedAmount] = useState('0')
  const [isRegistered, setIsRegistered] = useState(false)
  const [parent, setParent] = useState('')
  const [loading, setLoading] = useState(false)

  const { t } = props

  useEffect(() => {
    getChildrenPage()
    getUserView() // 获取 userView 数据
  }, [])

  const getChildrenPage = async () => {
    try {
      // 先连接钱包，确保 signer 存在
      if (!ETH.signer) {
        await ETH.getAccount()
      }
      
      console.log('📡 正在调用 ETH.children()...')
      const children = await ETH.children()
      console.log('✅ 获取到 children 数据:', children)
      
      // 格式化数据：地址、金额、业绩
      const formattedChildren = (children || []).map(item => ({
        account: item.account,
        baseStake: item.baseStake ? Number(ETH.formatUnits(item.baseStake, 18)).toFixed(2) : '0',
        perf: item.perf ? Number(ETH.formatUnits(item.perf, 18)).toFixed(2) : '0'
      }))
      
      setChildrenList(formattedChildren)
    } catch (error) {
      console.error('❌ 获取 children 失败:', error)
    }
  }

  // 领取团队奖励
  const handleClaimTeam = async () => {
    try {
      setLoading(true)
      
      // 确保钱包已连接
      if (!ETH.signer) {
        await ETH.getAccount()
      }
      
      // 检查可领取金额
      if (!teamU || Number(teamU) <= 0) {
        Toast.show('暂无团队奖励可领取')
        return
      }
      
      console.log('📡 调用 claimTeam，参数:', { amount: teamU })
      
      const result = await ETH.claimTeam(teamU)
      console.log('✅ claimTeam 成功:', result)
      
      Toast.show('领取成功！')
      
      // 更新 teamU 为 0
      setTeamU('0')
      
      // 刷新用户数据
      getUserView()
    } catch (error) {
      console.error('❌ claimTeam 失败:', error)
      Toast.show(error.message || '领取失败，请重试')
    } finally {
      setLoading(false)
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
        }
        if (userData.baseStake) {
          const baseStake = ETH.formatUnits(userData.baseStake, 18)
          setBaseStakedAmount(baseStake)
        }
      
        // 获取 plans 计算需补足金额
        try {
          const plans = await ETH.plans()
          console.log('✅ 获取到 plans 数据:', plans)
          if (plans && plans.length > 0 && plans[0].outAmount && plans[0].maxAmount) {
            const outAmount = Number(ETH.formatUnits(plans[0].outAmount, 18))
            const maxAmount = Number(ETH.formatUnits(plans[0].maxAmount, 18))
            const teamNeedCapValue = Number(parsedTeamNeedCap)
            
            // 计算公式：teamNeedCap/(outAmount/maxAmount)
            if (outAmount > 0 && maxAmount > 0) {
              const need = teamNeedCapValue / (outAmount / maxAmount)
              console.log('需补足金额计算:', teamNeedCapValue, '/', '(', outAmount, '/', maxAmount, ')', '=', need)
              setNeedAmount(need.toFixed(0))
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
    let dialog = Dialog.show({
      header: null,
      title: null,
      content: <JoinTeamForm onChange={async (value) => {
        if (value) {
          try {
            const toast = Toast.show({
              icon: 'loading',
              maskClickable: false,
              content: t('Joining...'),
            })
            // 调用 userContract 的 bind 方法绑定上级
            await ETH.bind(value)
            setParent(value)
            setIsRegistered(true)
            toast.close()
            Toast.show({
              icon: 'success',
              content: t('Operation Success'),
            })
          } catch (error) {
            console.log(error)
            Toast.show({
              icon: 'fail',
              content: t('Operation Failed'),
            })
            return
          }
        }
        dialog.close()
      }} />,
      actions: [],
      className: 'no-footer-dialog'
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
          {
            isRegistered && (
              <div className="community-info-item full-width">
                <h3>{t('My Top')}</h3>
                <p>{props.formatAddress(parent)}</p>
              </div>
            )
          }
          <div className="community-info-item full-width">
            <h3>{t('My Level')}</h3>
            <p>{level}</p>
          </div>
          <div className="community-info-item">
            <h3>{t('Team Performance')}</h3>
            <p>{basePerf} US$</p>
          </div>
          <div className="community-info-item">
            <h3>已领取团队奖励</h3>
            <p>{teamCount} US$</p>
          </div>
        </div>

        <div className="community-reward">
          <div className="reward-content">
            <div className="reward-item">
              <span className="reward-label">可领取奖励</span>
              <span className="reward-value">{teamU} USDT</span>
              <button className="reward-buy-btn" onClick={handleClaimTeam} disabled={loading || Number(teamU) <= 0}>
                {loading ? '领取中...' : '一键领取'}
              </button>
            </div>
            <div className="reward-item highlight">
              <span className="reward-label">需补足金额</span>
              <span className="reward-value">{needAmount} USDT</span>
              <button className="reward-buy-btn" onClick={() => {
                // 需补足金额大于0时才跳转
                const amount = Number(needAmount)
                if (amount <= 0) {
                  Toast.show('暂无需要补足的金额')
                  return
                }
                // 跳转到理财页面，传递需补足金额
                props.navigate('/staking', { state: { needAmount: amount } })
              }}>一键购买额度</button>
            </div>
            <div className="reward-notice">
              <span>⏰ 7天内领取，否则奖励不再计算</span>
            </div>
          </div>
        </div>


        {/* 手续费分红 */}
        <div className="community-reward">
          <div className="reward-content">
            <div className="reward-item">
              <span className="reward-label">手续费分红</span>
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
                <div className="community-table-cell col-index">序号</div>
                <div className="community-table-cell col-address">{t('Wallet Addresses')}</div>
                <div className="community-table-cell col-amount">金额</div>
                <div className="community-table-cell col-perf">业绩</div>
              </div>
            </div>
            <div className="community-table-main">
              {
                childrenList.length === 0 && <div className="no-data">暂无团队数据</div>
              }
              {
                childrenList.map((item, index) => (
                  <div className="community-table-row" key={index}>
                    <div className="community-table-cell col-index">{index + 1}</div>
                    <div className="community-table-cell col-address">{props.formatAddress(item.account)}</div>
                    <div className="community-table-cell col-amount">{item.baseStake} USDT</div>
                    <div className="community-table-cell col-perf">{item.perf} USDT</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Community;