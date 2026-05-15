import React, {useState, useEffect} from 'react'
import TagIcon from '@images/m/tag-icon.svg?react'
import GiftIcon from '@images/m/gift-icon.svg?react'
import TrendIcon from '@images/m/trend-icon.svg?react'
import { Toast } from 'antd-mobile'
import { Contract, ETH } from '@tools/contract'
import './styles/nodes.less'

const USDT = new Contract(import.meta.env.VITE_USDT, "ERC20");
const BUY = new Contract(import.meta.env.VITE_FH, "BUY");

const Nodes = (props) => {
  const [dividend, setDividend] = useState('0')
  const [airdrop, setAirdrop] = useState('0')
  const [usdtApprove, setUsdtApprove] = useState(false)
  const [fhApprove, setFhApprove] = useState(false)

  const { t } = props

  useEffect(() => {
    getData()
    getUsdtAllowance()
  }, [])

  const handleUsdtApprove = (callback) => {
    USDT.send("approve", [
        BUY.address,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    ]).then(res => {
      getUsdtAllowance(callback)
    })
  }

  const getUsdtAllowance = async (callback) => {
    let res = await USDT.call("allowance", [ETH.account, BUY.address]);

    setUsdtApprove(Number(res) > 0)

    if (Number(res) > 0) callback && callback(Number(res) > 0)
  }

  const getData = async () => {
    let airdrop = null
    const globalView = await ETH.getGlobalView()
    const claimableOf = await ETH.claimableOf()
    try {
      const previewClaim = await ETH.kongTouPreviewClaim()
      airdrop = previewClaim[previewClaim.length - 1].toString()
    } catch (error) {
      airdrop = 0
    }

    setAirdrop(airdrop)
    setDividend(claimableOf)
  }

  const handleZhiYa = async () => {
    const toast = Toast.show({
      icon: 'loading',
      maskClickable: false,
      content: t('Subscribing'),
    })

    try {
      const fhContract = await ETH.fhContract()
      await fhContract.claim()
      toast.close()
      Toast.show({
        icon: 'success',
        content: t('Subscription successful'),
      })
    } catch (error) {
      console.log('error', error)
      toast.close()
      Toast.show({
        icon: 'fail',
        content: t('Subscription failed'),
      })
    }
  }

  const checkUsdtAllowance = async (callback) => {
    if (usdtApprove) return callback && callback()

    handleUsdtApprove(callback)
  }

  const handleClaim = async () => {
    const toast = Toast.show({
      icon: 'loading',
      maskClickable: false,
      content: t('loading'),
    })

    try {
      await ETH.kongTouClaim()

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

  return (
    <>
      <div className="nodes-page">
        <div className="nodes-info">
          <TagIcon />
          <div className="nodes-info-title">{t('Genesis')}<br />{t('Node')}<br />{t('Benefits')}</div>
          <div className="nodes-info-content">{t('Congratulations on becoming a Global Genesis Node')}. {t('Let’s build the future of the MS ecosystem together and enjoy the wealth it brings us')}.</div>
        </div>
        <div className="nodes-shop">
          <div className="nodes-list-title"><TagIcon />{t('Your Node Benefits')}</div>
          <div className="nodes-list-item">
            <div className="item-data">
              <span>{t('Airdrop Claim')}:</span>
              <i>{airdrop} MS</i>
            </div>
            <button onClick={() => handleClaim()}>{t('Claim Airdrop')}</button>
          </div>
          <div className="nodes-list-item">
            <div className="item-data">
              <span>{t('Dividend Claim')}:</span>
              <i>{dividend} USDT</i>
            </div>
            <button onClick={() => handleZhiYa()}>{t('Claim Dividend')}</button>
          </div>
        </div>
        <div className="nodes-list">
          <div className="nodes-list-item">
            <TagIcon />
            <p>{t('Genesis Status')}</p>
            <p>{t('Permanent node benefits')}</p>
          </div>
          <div className="nodes-list-item">
            <GiftIcon />
            <p>{t('Airdrop Rewards')}</p>
            <p>{t('Regular token distributions')}</p>
          </div>
          <div className="nodes-list-item">
            <TrendIcon />
            <p>{t('Dividend Income')}</p>
            <p>{t('Share in protocol revenue')}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Nodes;