import React, {useState, useEffect, useRef} from 'react'
import { ConfigProvider, Button, Toast, Form, Input, Picker, Radio, Uploader } from 'react-vant'
import countries from 'i18n-iso-countries';
import SubHeader from './components/subHeader'
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { fetchOpenCardTwo } from '@services/api'
import request from '@services/request'
import getSign from '@tools/sign'
import dayjs from 'dayjs';
import { ArrowDown } from '@react-vant/icons'
import zh from 'i18n-iso-countries/langs/zh.json';
import en from 'i18n-iso-countries/langs/en.json';
import phoneColumns from '../../tools/phoneCode'
import './styles/createCard.less'

const CreateCard = (props) => {
  const [countryMap, setCountryMap] = useState([])
  const [cityName, setCityName] = useState('')
  const [showCode, setShowCode] = useState(false)
  const formRef = useRef(null)
  
  const { address } = props.state
  // 处理文件选择，调用上传接口并设置结果到表单
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
      const num = name === 'idCardFront' ? 1 : 2
      
      const sign = localStorage.getItem('sign')
      // 创建FormData对象
      const formData = new FormData()
      formData.append('num', num)
      formData.append('file', file)
      formData.append('sign', sign)
      formData.append('address', address)
      
      try {
        // 调用上传接口，使用项目中的request实例
        // 注意：request.js已经配置了baseURL和拦截器，不需要手动设置Authorization和完整URL
        const resultData = await request.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data' // 确保设置正确的内容类型
          }
        })
        
        console.log('uploadResult', resultData)
        if (resultData.status === 'ok') {
          // 将上传结果设置到表单中
          if (formRef.current) {
            const currentValues = formRef.current.getFieldsValue()
            formRef.current.setFieldsValue({
              ...currentValues,
              [name]: resultData.data // 根据后端返回结构调整
            })
          }
        } else {
          Toast.fail(resultData.message || t('文件上传失败'))
        }
      } catch (error) {
        console.error('文件上传失败:', error)
        Toast.fail(t('文件上传失败'))
      }
    } else {
      // 清除表单值
      if (formRef.current) {
        const currentValues = formRef.current.getFieldsValue()
        formRef.current.setFieldsValue({
          ...currentValues,
          [name]: null
        })
      }
    }
    return fileList
  }

  const { t } = props

  useEffect(() => {
    const language = localStorage.getItem('language') || 'en'

    if (language === 'zh') {
      countries.registerLocale(zh);
    } else {
      countries.registerLocale(en);
    }

    const currentLocale = language === 'zh' ? 'zh' : 'en';

    setCountryMap(countries.getNames(currentLocale, { select: 'official' }))
    // formRef.current.addEventListener('submit', handleFormSubmit)
  }, [])

  const getCountryCodeByName = (name) => {
    const entry = Object.entries(countryMap).find(([code, label]) => label === name);
    return entry ? entry[0] : null;
  }

  const onFinish = async (values) => {
    if (values.country) {
      values.countryCode = getCountryCodeByName(values.country)
    }
    if (values.birthDate) {
      values.birthDate = dayjs(values.birthDate).format('YYYY-MM-DD')
    }
    if (values.phonecountryCode) {
      values.phonecountryCode = values.phonecountryCode.slice(1)
    }
    
    // console.log(values)
    // return
    Toast.loading({
      forbidClick: true,
      message: t('正在激活卡片'),
      duration: 0
    })

    try {
      const sign = await getSign()

      fetchOpenCardTwo({
        ...values,
        sign
      }).then(res => {
        if (res.status === 'ok') {
          setTimeout(() => {
            Toast.success(t('开卡成功'))
          }, 40)
          props.resetUserInfo()
          props.navigate('/')
        } else {
          setTimeout(() => {
            Toast.fail(res.status)
          }, 40)
        }
      }).finally(() => {
        Toast.clear()
      });
    } catch (error) {
      console.log(error)
      Toast.clear()
    }
  }

  const sortByDialCodeFirstDigit = (list) => {
    const sorted = [...list].sort((a, b) => {
      const numA = Number((a.dial_code || '').replace('+', '')) || 0;
      const numB = Number((b.dial_code || '').replace('+', '')) || 0;
      return numA - numB;
    });

    const seen = new Set();
    return sorted.filter(item => {
      const num = item.dial_code;
      if (seen.has(num)) return false;
      seen.add(num);
      return true;
    });
  }

  console.log(3233, sortByDialCodeFirstDigit(phoneColumns)[0].dial_code)

  return (
    <>
      <SubHeader title={t('激活实体卡')} {...props} />
      <div className="create-card-page" style={{marginTop: 10}}>
        <Form
          onFinish={onFinish}
          footer={
            <div style={{ margin: '16px 16px 0' }}>
              <Button round nativeType='submit' type='primary' block>
                {t('确定')}
              </Button>
            </div>
          }
        >
          <Form.Item
            name='email'
            label={t('邮箱')}
            normalize={(val) => val?.trim()}
            rules={[
              { required: true, message: t('请填写邮箱') },
              {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t('邮箱格式不正确'),
              }
            ]}
          >
            <Input placeholder={t('请输入邮箱')} />
          </Form.Item>
          <Form.Item
            name='firstName'
            label={t('名字')}
            normalize={(val) => val?.trim()}
            rules={[
              { required: true, message: t('请填写名字') }
            ]}
          >
            <Input placeholder={t('请输入名字')} />
          </Form.Item>
          <Form.Item
            name='lastName'
            label={t('姓氏')}
            normalize={(val) => val?.trim()}
            rules={[
              { required: true, message: t('请填写姓氏') }
            ]}
          >
            <Input placeholder={t('请输入姓氏')} />
          </Form.Item>
          <Form.Item
            name='gender'
            label={t('性别')}
            initialValue="g"
            rules={[
              { required: true, message: t('请填写性别') }
            ]}
          >
            <Radio.Group defaultValue="g" direction="horizontal">
              <Radio name="g">{t('男')}</Radio>
              <Radio name="m">{t('女')}</Radio>
            </Radio.Group>
          </Form.Item>
          {/* <Form.Item
            name='countryCode'
            label={t('国家代码')}
            rules={[{ pattern: /^\d{1,44}$/, message: t('请输入国家代码') }]}
          >
            <Input placeholder={t('请输入国家代码')} />
          </Form.Item> */}
          <div className="form-item">
            <div className="form-label">手机号</div>
            <div className="form-value">
              <div style={{ width: 80 }}>
                <Form.Item
                  name='phonecountryCode'
                  initialValue={sortByDialCodeFirstDigit(phoneColumns)[0].dial_code}
                  label={null}
                >
                  <Picker
                    popup
                    defaultValue={[sortByDialCodeFirstDigit(phoneColumns)[0].dial_code]}
                    placeholder={null}
                    columnsFieldNames={{
                      text: 'dial_code',
                      value: 'dial_code'
                    }}
                    columns={sortByDialCodeFirstDigit(phoneColumns)}
                  >
                    {(val, _, actions) => {
                      return (
                        <div className="country-block">
                          <div className="country-code" onClick={() => actions.open()}>{val || sortByDialCodeFirstDigit(phoneColumns)[0].dial_code}</div>
                          <ArrowDown style={{ display: 'block' }} />
                        </div>
                      )
                    }}
                  </Picker>
                </Form.Item>
              </div>
              <Form.Item
                name='phone'
                label={null}
                normalize={(val) => val?.trim()}
                rules={[
                  { required: true, message: t('请填写手机号') },
                  {
                    pattern: /^\d+$/,
                    message: t('手机号格式错误'),
                  }
                ]}
              >
                <Input placeholder={t('请输入手机号')} />
              </Form.Item>
            </div>
          </div>
          {/* <Form.Item
            isLink
            name='birthDate'
            label={t('出生日期')}
            trigger='onConfirm'
            rules={[{ required: true, message: t('请选择出生日期') }]}
            onClick={(_, action) => {
              action.current?.open()
            }}
          >
            <DatetimePicker popup type='date' minDate={new Date(1900, 0, 1)}>
              {(val) => (val ? dayjs(val).format('YYYY-MM-DD') : t('请选择出生日期'))}
            </DatetimePicker>
          </Form.Item> */}
          <Form.Item
            label={t('身份证号码')}
            name='idCard'
            normalize={(val) => val?.trim()}
            rules={[
              { required: true, message: t('请填写身份证号码') }
            ]}
          >
            <Input placeholder={t('请输入身份证号码')} />
          </Form.Item>
          {/* <Form.Item
            label={t('身份证正面')}
            name='idCardFront'
            rules={[
              { required: true, message: t('请上传身份证正面') }
            ]}
          >
            <Uploader
              name='idCardFront'
              maxCount={1}
              uploadText={t('点击上传身份证正面')}
              accept='image/*'
              onChange={(fileList) => handleFileChange('idCardFront', fileList)}
            />
          </Form.Item>
          <Form.Item
            label={t('身份证反面')}
            name='idCardBack'
            rules={[
              { required: true, message: t('请上传身份证反面') }
            ]}
          >
            <Uploader
              name='idCardBack'
              maxCount={1}
              uploadText={t('点击上传身份证反面')}
              accept='image/*'
              onChange={(fileList) => handleFileChange('idCardBack', fileList)}
            />
          </Form.Item> */}
          <Form.Item
            isLink
            name='country'
            label={t('国家')}
            trigger='onConfirm'
            rules={[{ required: true, message: t('请选择国家') }]}
            onClick={(_, action) => {
              action.current?.open()
            }}
          >
            <Picker
              title={(
                <Input
                  value={cityName}
                  style={{textAlign: 'center', border: '1px solid #EEE', height: 32}}
                  onChange={text => setCityName(text)}
                  placeholder={t('输入名称进行筛选')}
                />
              )}
              onConfirm={(value) => {
                const code = Object.keys(countryMap).find(item => countryMap[item] === value)

                if (code === 'US' || code === 'CA') {
                  setShowCode(true)
                } else {
                  setShowCode(false)
                }
              }}
              popup
              columns={Object.values(countryMap).filter(item => item.indexOf(cityName) > -1)}
            >
              {val => val || t('请选择国家')}
            </Picker>
          </Form.Item>
          {
            showCode && (
              <Form.Item
                name='state'
                label={t('城市代码')}
                normalize={(val) => val?.trim()}
                rules={[
                  { required: true, message: t('请填写城市代码') }
                ]}
              >
                <Input placeholder={t('请输入城市代码')} />
              </Form.Item>
            )
          }
          <Form.Item
            name='city'
            label={t('城市')}
            normalize={(val) => val?.trim()}
            rules={[
              { required: true, message: t('请填写城市') }
            ]}
          >
            <Input placeholder={t('请输入城市')} />
          </Form.Item>
          <Form.Item
            name='street'
            label={t('街道')}
            normalize={(val) => val?.trim()}
            rules={[
              { required: true, message: t('请填写街道') }
            ]}
          >
            <Input placeholder={t('请输入街道')} />
          </Form.Item>
          <Form.Item
            name='postalCode'
            label={t('邮编')}
            normalize={(val) => val?.trim()}
            rules={[
              { required: true, message: t('请填写邮编') }
            ]}
          >
            <Input placeholder={t('请输入邮编')} />
          </Form.Item>
          <p style={{textAlign: 'center', padding: '20px 0 5px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px'}}><AiOutlineExclamationCircle size={16} />{t('实体卡')}：199U</p>
        </Form>
      </div>
    </>
  )
}

export default CreateCard;