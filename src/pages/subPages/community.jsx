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
  const [perf, setPerf] = useState('0')
  const [level, setLevel] = useState('0')
  const [teamCount, setTeamCount] = useState('0')
  const [teamList, setTeamList] = useState([])
  const [baseStakedAmount, setBaseStakedAmount] = useState('0')
  const [isRegistered, setIsRegistered] = useState(false)
  const [parent, setParent] = useState('')

  const { t } = props

  useEffect(() => {
    getGlobalView()
    getChildrenPage()
  }, [])

  const getChildrenPage = async () => {
    const childrenPage = await ETH.getChildrenPage()

    setTeamList(childrenPage)
  }

  const getGlobalView = async () => {
    const globalView = await ETH.getGlobalView()

    const { perf, level, teamCount, isRegistered, parent, baseStakedAmount } = globalView

    setBaseStakedAmount(baseStakedAmount)
    setTeamCount(teamCount)
    setParent(parent)
    setIsRegistered(isRegistered)
    setLevel(level === '-1' ? '0' : level)
    setPerf(perf)
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
            await ETH.register(value)
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
        <div className="community-info">
          {
            isRegistered && (
              <>
                <p>{t('My Top')}</p>
                <h3>{props.formatAddress(parent)}</h3>
              </>
            )
          }
          <p>{t('Team Performance')}</p>
          <h3>{perf} US$</h3>
          <p>{t('My Level')}</p>
          <h3>{level}</h3>
          <p>{t('My Performance')}</p>
          <h3>{teamCount} US$</h3>
          <p>{t('My Stake Amount')}</p>
          <h3>{baseStakedAmount} US$</h3>
        </div>
        {/* <div className="community-data">
          <div className="community-data-item">
            <span>My Performance：</span>{teamCount}
          </div>
          <div className="community-data-item">
            <span>Team size</span>
          </div>
          <div className="community-data-item">
            <span>Cumulative income</span>
          </div>
        </div> */}
        <div className="community-list">
          <div className="community-list-title">{t('Team List')}</div>
          <div className="community-table">
            <div className="community-table-head">
              <div className="community-table-row">
                <div className="community-table-cell">{t('Wallet Addresses')}</div>
                <div className="community-table-cell">{t('Level')}</div>
                <div className="community-table-cell">{t('Staking')}</div>
                <div className="community-table-cell">{t('Performance')}</div>
              </div>
            </div>
            <div className="community-table-main">
              {
                teamList.map(item => (
                  <div className="community-table-row">
                    <div className="community-table-cell">{props.formatAddress(item.account)}</div>
                    <div className="community-table-cell">{item.level === -1 ? 0 : item.level}</div>
                    <div className="community-table-cell">{ETH.formatToken(item.baseStakedAmount)}</div>
                    <div className="community-table-cell">{ETH.formatToken(item.perf) - ETH.formatToken(item.extraTeamPerf)}</div>
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