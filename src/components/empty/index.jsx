import React, {useState, useEffect} from 'react'
import './index.less'

const Empty = (props) => {
  useEffect(() => {
  }, [])

  return (
    <>
      <div className="empty" style={props.style}>
        <i className="empty-icon"></i>
        {props.content || props.t('No data available')}
      </div>
    </>
  )
}

export default Empty;