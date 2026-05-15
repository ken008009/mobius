import React, { useState, useEffect } from "react";
import SubHeader from "./components/subHeader";
import { fetchCardInfo } from "@services/api";
import { useSearchParams } from "react-router-dom";
import { Toast, Button } from "react-vant";
import { fetchLookCard, fetchChangeCard } from "@services/api";
import getSign from '@tools/sign'
import "./styles/cardInfo.less";

const CardInfo = (props) => {
  const [cardInfo, setCardInfo] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [accessToken, setAccessToken] = useState(null)

  const { t } = props;

  useEffect(() => {
    getCardInfo();
  }, []);

  const getCardInfo = async () => {
    try {
      fetchCardInfo({
        cardType: searchParams.get("type")
      }).then((res) => {
        setCardInfo(res);
        setAccessToken(res.accessToken);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const initCardInfo = (clientAccessToken) => {
    widget.bootstrap({
      clientAccessToken,
      component: {
        showPan: {
          cardPan: {
            domId: "card-pan",
            format: true,
            styles: {
              span: {
                background: "green",
                color: "white",
                "font-family": "monospace",
                "letter-spacing": "2px",
                "font-weight": "bold",
              },
            }, // A custom styles object
          },
          copyCardPan: {
            domId: "copy-card-pan",
            onCopySuccess: () => alert("Copied PAN!"),
            onCopyFailure: (error) => console.error(error),
          },
        },
      },
      callbackEvents: {
        onSuccess: () => console.log("Success!"),
        onFailure: (error) => console.error(error),
      },
    });
  };

  const {
    status,
    cardNumber,
    pin,
    expire,
    cvv,
    email,
    phone,
    country,
    countryCode,
  } = cardInfo || {};

  const handleLookCard = async() => {
    const sign = await getSign()

    fetchLookCard({
      sign,
      cardType: searchParams.get("type"),
    }).then((res) => {
      if (res.status === 'ok') {
        Toast.success(t('冻结卡片成功') + ',' + t('等待管理员处理'))
      } else {
        Toast.fail(t('冻结卡片失败'))
      }
    })
  }

  const handleChangeCard = async () => {
    const sign = await getSign()

    fetchChangeCard({
      sign,
      cardType: searchParams.get("type"),
    }).then((res) => {
      if (res.status === 'ok') {
        Toast.success(t('补卡成功') + ',' + t('等待管理员处理'))
      } else {
        Toast.fail(t('补卡失败'))
      }
    })
  }

  return (
    <>
      <SubHeader title={t("卡片信息")} {...props} />
      <div style={{padding: '20px'}}>
        {
          accessToken && <iframe
            style={{
              border: 'none',
              boxShadow: 'none',
              width: '100%',
              height: '200px',
            }}
            src={`/form.html?clientAccessToken=${accessToken}`}
          />
        }
      </div>
      <div className="card-footer" style={{padding: '0 20px', display: 'flex', justifyContent: 'space-between'}}>
        <Button type="primary" onClick={handleLookCard} style={{width: '48%', borderRadius: '8px', border: 0, background: '#D23166'}}>{t('冻结')}</Button>
        <Button type="primary" onClick={handleChangeCard} style={{width: '48%', borderRadius: '8px', border: 0, background: '#0085A8'}}>{t('补卡')}</Button>
      </div>
    </>
  );
};

export default CardInfo;
