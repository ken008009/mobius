import React, {useState, useEffect} from 'react'
import { MdArrowBackIosNew } from "react-icons/md";
import '../styles/subHeader.less'

const SubHeader = (props) => {
  useEffect(() => {
  }, [])

  return (
    <>
      <div className="sub-header">
        <div className="back-icon" onClick={() => props.onConfirm ? props.onConfirm() : props.navigate(-1)}><MdArrowBackIosNew /></div>
        <div className="sub-header-title">{props.title || ''}</div>
      </div>
    </>
  )
}

export default SubHeader;