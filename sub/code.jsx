import React, {useState, useEffect, useRef} from 'react'
import { Button, Toast, Uploader } from 'react-vant'
import SubHeader from './components/subHeader'
import request from '@services/request'
import getSign from '@tools/sign'
import './styles/code.less'

const Code = (props) => {
  const signRef = useRef(null)
  const {t} = props

  useEffect(() => {
  }, [])

  const {address, pic, picTwo} = props.state

  const handleFileChange = async (name, fileList) => {
    if (fileList.length > 0) {
      const file = fileList[fileList.length - 1].file

      // 检查文件大小，限制10MB
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        Toast.fail(t('文件大小不能超过10MB'));
        return fileList.slice(0, -1); // 移除超过大小限制的文件
      }
      // 确定num参数值
      const num = name === 'idCardFront' ? 'one' : 'two'

      // 创建FormData对象
      const formData = new FormData()
      formData.append('num', num)
      formData.append('file', file)
      formData.append('sign', signRef.current)
      formData.append('address', address)

      try {
        // 调用上传接口，使用项目中的request实例
        // 注意：request.js已经配置了baseURL和拦截器，不需要手动设置Authorization和完整URL
        const resultData = await request.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data' // 确保设置正确的内容类型
          }
        })

        signRef.current = null
        // if (resultData.status === 'ok') {

        // } else {
        //   Toast.fail(resultData.message || t('文件上传失败'))
        // }
      } catch (error) {
        console.error('文件上传失败:', error)
      }
    }
    return fileList
  }

  const beforeRead = async (e) => {
    if (signRef.current) return
    e.preventDefault()
    try {
      signRef.current = await getSign()
      e.target?.click()
    } catch (error) {
    }
  }
  // const sign = await getSign()
  console.log('pic', pic, 'picTwo', picTwo)
  return (
    <>
      <SubHeader title={t('身份证上传')} {...props} />
      <div className="code-page">
        {
          pic !== 'no' ? (
            <Uploader
                name='idCardFront'
                maxCount={1}
                defaultValue={[{ url: pic }]}
                onClickUpload={beforeRead}
                uploadText={t('点击上传身份证正面')}
                accept='image/*'
                onChange={(fileList) => handleFileChange('idCardFront', fileList)}
            />
          ) : (
            <Uploader
                name='idCardFront'
                maxCount={1}
                onClickUpload={beforeRead}
                uploadText={t('点击上传身份证正面')}
                accept='image/*'
                onChange={(fileList) => handleFileChange('idCardFront', fileList)}
            />
          )
        }
        {
          picTwo !== 'no' ? (
            <Uploader
                name='idCardBack'
                maxCount={1}
                defaultValue={[{ url: picTwo }]}
                onClickUpload={beforeRead}
                uploadText={t('点击上传身份反面')}
                accept='image/*'
                onChange={(fileList) => handleFileChange('idCardBack', fileList)}
            />
          ) : (
            <Uploader
                name='idCardBack'
                maxCount={1}
                onClickUpload={beforeRead}
                uploadText={t('点击上传身份反面')}
                accept='image/*'
                onChange={(fileList) => handleFileChange('idCardBack', fileList)}
            />
          )
        }
      </div>
    </>
  )
}

export default Code;