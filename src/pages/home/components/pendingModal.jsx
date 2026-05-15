import React, {forwardRef, useState, useEffect, useImperativeHandle} from 'react'
import { Popup } from 'react-vant'
import SubHeader from '../../subPages/components/subHeader'

const PendingModal = forwardRef((props, ref) => {
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
      <div className="pending-modal">
        <SubHeader title="待出账单" onConfirm={handleClose} {...props} />
      </div>
    </Popup>
  )
})

export default PendingModal;