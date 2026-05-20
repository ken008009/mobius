import React from 'react'
import fireVideo from '@images/300fire.mp4'
import './FireVideo.less'

const FireVideo = () => {
  return (
    <video
      className="fire-video"
      autoPlay
      muted
      loop
      playsInline
      webkit-playsinline="true"
    >
      <source src={fireVideo} type="video/mp4" />
    </video>
  )
}

export default FireVideo
