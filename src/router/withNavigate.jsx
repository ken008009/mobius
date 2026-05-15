import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import request from "@services/request";
import NoLogin from '@components/noLogin';
import Header from '@pages/common/header';
import { useTranslation } from 'react-i18next';

const withNavigate = (Component) => {
  return (props) => {
    const [searchParams] = useSearchParams();
    const footer = props.footer
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const { t } = useTranslation();

    useEffect(() => {

    }, [])

    const formatAddress = (value) => {
      const frontSix = value.slice(0, 6);
      const backSix = value.slice(-4);
      const middle = '...';
      return frontSix + middle + backSix;
    }

    const resetUserInfo = async () => {
      const res = await request.get("/user");
      props.setState(res);
    }
    const formatDecimal = (num) => {
      if (typeof num !== 'number' || isNaN(num)) {
        num = Number(num)
      }
      // 将数字转换为字符串
      const numStr = num.toString();

      // 判断是否包含小数点
      if (numStr.includes('.')) {
          // 使用 toFixed(2) 保留两位小数
          return parseFloat(num.toFixed(2));
      } else {
          // 如果没有小数点，直接返回原数字
          return num;
      }
    }

    const method = {
      navigate,
      formatAddress,
      match: location,
      params,
      searchParams,
      resetUserInfo,
      formatDecimal
    }

    // if (props.isLogin === false) return <NoLogin {...props} />

    return (
      <>
        <Header {...props} {...method} t={t}  />
        <Component {...props} {...method} t={t} />
      </>
    );
  };
};

export default withNavigate;