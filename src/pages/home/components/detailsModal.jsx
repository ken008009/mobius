import React, {forwardRef, useState, useEffect, useImperativeHandle} from 'react'
import { Popup } from 'react-vant'
import SubHeader from '../../subPages/components/subHeader'

const DetailsModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
  }, [])

  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true)
    },
    close: () => {
      setVisible(false)
    }
  }))

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Popup
      visible={visible}
      position="bottom"
      round
      onClose={handleClose}
      style={{ height: '90%' }}
    >
      <div className="details-modal">
        <SubHeader title="明细账单" onConfirm={handleClose} {...props} />
      </div>
    </Popup>
  )
})

export default DetailsModal;