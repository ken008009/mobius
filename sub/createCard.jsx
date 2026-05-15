import React, {useState, useEffect, useRef} from 'react'
import { Button, Toast, Form, Input, Picker, DatetimePicker } from 'react-vant'
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import SubHeader from './components/subHeader'
import { fetchOpenCard } from '@services/api'
import getSign from '@tools/sign'
import dayjs from 'dayjs';
import './styles/createCard.less'

countries.registerLocale(en);

const countryMap = countries.getNames('en', { select: 'official' });

countryMap.CN = 'China'
const CreateCard = (props) => {
  const formRef = useRef(null)

  const { t } = props

  useEffect(() => {
    console.log('countryMap', countryMap)
    // formRef.current.addEventListener('submit', handleFormSubmit)
  }, [])

  const getCountryCodeByName = (name) => {
    const entry = Object.entries(countryMap).find(([code, label]) => label === name);
    return entry ? entry[0] : null;
}

  const onFinish = async (values) => {
    values.countryCode = getCountryCodeByName(values.country)
    values.birthDate = dayjs(values.birthDate).format('YYYY-MM-DD')
    // console.log(values)
    // return
    Toast.loading({
      forbidClick: true,
      message: t('正在激活卡片'),
      duration: 0
    })

    try {
      const sign = await getSign()

      fetchOpenCard({
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

  return (
    <>
      <SubHeader title={t('激活虚拟卡')} {...props} />
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
          {/* <Form.Item
            name='firstName'
            label={t('名字')}
            normalize={(val) => val?.trim()}
            rules={[
              { required: true, message: t('请填写名字') },
              {
                pattern: /^[A-Za-z ]+$/,
                message: t('只能包含英文字母，不能包含特殊符号'),
              }
            ]}
          >
            <Input placeholder={t('请输入名字')} />
          </Form.Item>
          <Form.Item
            name='lastName'
            label={t('姓氏')}
            normalize={(val) => val?.trim()}
            rules={[
              { required: true, message: t('请填写姓氏') },
              {
                pattern: /^[A-Za-z ]+$/,
                message: t('只能包含英文字母，不能包含特殊符号'),
              }
            ]}
          >
            <Input placeholder={t('请输入姓氏')} />
          </Form.Item> */}
          {/* <Form.Item
            name='countryCode'
            label=t('国家代码')
            rules={[{ pattern: /^\d{1,44}$/, message: t('请输入国家代码') }]}
          >
            <Input placeholder=t('请输入国家代码') />
          </Form.Item> */}
          {/* <Form.Item
            name='phone'
            label={t('手机号')}
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
          </Form.Item> */}
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
          {/* <Form.Item
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
              popup
              columns={Object.values(countryMap)}
            >
              {val => val || t('请选择国家')}
            </Picker>
          </Form.Item>
          <Form.Item
            name='city'
            label={t('城市')}
            normalize={(val) => val?.trim()}
            rules={[
              { required: true, message: t('请填写城市') },
              {
                pattern: /^[A-Za-z0-9 ]+$/,
                message: t('只能包含英文字母数字，不能包含特殊符号'),
              }
            ]}
          >
            <Input placeholder={t('请输入城市')} />
          </Form.Item>
          <Form.Item
            name='street'
            label={t('街道')}
            normalize={(val) => val?.trim()}
            rules={[
              { required: true, message: t('请填写街道') },
              {
                pattern: /^[A-Za-z0-9 ]+$/,
                message: t('只能包含英文字母数字，不能包含特殊符号'),
              }
            ]}
          >
            <Input placeholder={t('请输入街道')} />
          </Form.Item>
          <Form.Item
            name='postalCode'
            label={t('邮编')}
            normalize={(val) => val?.trim()}
            rules={[
              { required: true, message: t('请填写邮编') },
              {
                pattern: /^[A-Za-z0-9 ]+$/,
                message: '只能包含英文字母数字，不能包含特殊符号',
              }
            ]}
          >
            <Input placeholder={t('请输入邮编')} />
          </Form.Item> */}
        </Form>
      </div>
    </>
  )
}

export default CreateCard;