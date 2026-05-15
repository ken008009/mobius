import React, {useState, useEffect} from 'react'
import classnames from 'classnames'
import { Input, SpinLoading } from 'antd-mobile'
import { fetchSetVip } from '@services/api'
import { Dialog, Toast } from 'react-vant'
import copy from 'copy-to-clipboard';
import getSign from '@tools/sign'
import '../styles/treeMenu.less'

const TreeItem = (props) => {
  const [childData, setChildData] = useState(props.data.children || [])
  const [unfold, setUnfold] = useState(props.unfold || false)
  const [currentAddress, setCurrentAddress] = useState('')
  const [hasChild, setHasChild] = useState(true)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  // const { canVip } = props.state
  const { t, canVip } = props

  const handelUnfold = async () => {
    if (!hasChild) return
    if (loading) return
    if (!unfold && !childData.length) {
      try {
        setLoading(true)
        const data = await props.onLoad({
          ...props.data,
          unfold: !unfold
        })

        if (data && data.length > 0) {
          setUnfold(true)
          setChildData(data)
        } else {
          setHasChild(false)
        }
      } catch (error) {
        console.log(error)
      }
      setLoading(false)
    }

    props.onExpand({
      ...props.data,
      unfold: !unfold
    })
    if (!unfold && childData.length > 0) {
      setUnfold(true)
    }
    if (unfold) {
      setUnfold(false)
    }
  }

  const setLevel = async () => {
    const levelNumber = document.querySelector('.vip-input').value
    try {
      const sign = await getSign()

      fetchSetVip({
        sign,
        address: currentAddress,
        vip: levelNumber
      }).then(res => {
        if (res.status === 'ok') {
          Toast.success(t('操作成功'))
          setVisible(false)
          props.getRecommendList()
        } else {
          return Toast.info(res.status)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  const setOpen = async (e, data) => {
    e.stopPropagation()
    setCurrentAddress(data.address)
    setVisible(true)
  }

  const dialogClose = () => {
    setCurrentAddress('')
    setVisible(false)
  }

  const copyAddress = (e) => {
    e.preventDefault()
    e.stopPropagation()
    copy(props.data.address)

    Toast.success(t('复制链接成功'))
  }

  return (
    <ul className="tree-list">
      <li onClick={() => handelUnfold()}>
        {
          loading ? (
            <SpinLoading style={{ '--size': '14px', position: 'relative', top: '-4px' }} />
          ) : (
            <i className={classnames({
              'arrow': true,
              'unfold': unfold,
              'empty-unfold': !hasChild
            })}></i>
          )
        }
        <div className="tree-info">
          <p>{props.formatAddress(props.data.address)}<a href="#" onClick={e => copyAddress(e)} style={{marginLeft: 4}}>{t('复制')}</a></p>
          <p>
            <span>{t('业绩')}:{props.data.amount} USD</span>
            <span>{t('级别')}:v{props.data.vip}</span>
            <span>{t('状态')}:{props.data.cardOpen > 0 ? t('已开通') : t('未开通')}</span>
          </p>
        </div>
        {
          (canVip === '1' || !props.isChild) && <button className="set-btn" onClick={(e) => setOpen(e, props.data)}>{t('设置')}</button>
        }
        {
          visible && (
            <Dialog
              visible={visible}
              title={t('设置级别')}
              closeable={true}
              theme='round-button'
              showConfirmButton={false}
              onCancel={() => dialogClose()}
              onClose={() => dialogClose()}
            >
              <div style={{ textAlign: 'center', padding: '15px 20px' }}>
                <input className="vip-input" min={1} max={10} placeholder={t('请输入设置级别')} type="number" />
                <button className="set-confirm-btn" onClick={() => setLevel()}>{t('确定')}</button>
              </div>
            </Dialog>
          )
        }
      </li>
      {
        unfold && childData.map(item => (
          <TreeItem key={item.address} data={item} canVip={canVip} isChild={true} t={props.t} formatAddress={props.formatAddress} onLoad={props.onLoad} onExpand={props.onExpand} />
        ))
      }
    </ul>
  )
}

const TreeMenu = (props) => {
  useEffect(() => {
    console.log('TreeMenu props', props)
  }, [])

  return (
    <>
      <div className="tree-menu">
        {
          props.data.map(item => (
            <TreeItem key={item.address} canVip={props.canVip} data={item} t={props.t} getRecommendList={props.getRecommendList} isChild={false} onLoad={props.onLoad} formatAddress={props.formatAddress} onExpand={props.onExpand} />
          ))
        }
      </div>
    </>
  )
}

export default TreeMenu;