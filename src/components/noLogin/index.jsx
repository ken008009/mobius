import React, {useState, useEffect, useRef} from 'react'
import { Loading, Dialog } from 'react-vant';
import { Toast } from 'antd-mobile'
import { ETH } from "@tools/contract";
import { useTranslation } from 'react-i18next';
// import BiwMeta from '@services/index'
import request from "@services/request";
import './index.less'

let timeSwitch = null
const NoLogin = (props) => {
  const [loadAccount, setLoadAccount] = useState(false)
  const { t } = useTranslation();

  const biwSign = useRef({})

  useEffect(() => {
    init()
  }, [])

  const recommend_update = async () => {
    if (
      props.urlCode &&
      props.urlCode !== props.state.inviteUserAddress
    ) {
      const res = await request.post("app_server/recommend_update", {
        code: this.urlCode,
        sign
      });

      props.setState({
        ...props.state,
        inviteUserAddress: res.inviteUserAddress,
      })
    }
  }

  const getUser = async () => {
    const getData = async () => {
      const res = await request.get("/user");
      props.setState(res);
    };

    await getData();
  }

  const loginSuccess = async (token, sign) => {
    if (token) {
      localStorage.setItem("account", ETH.account);
      localStorage.setItem("token", token);
      localStorage.setItem("sign", sign);
    }
    await getUser();
    // await recommend_update();
    props.dispatch.setUrlCode('')
    location.hash = "";
    // console.log('登录成功')
    props.dispatch.setIsLogin(true)
  }

  const login = async (params) => {
    const res = await request.post("/eth_authorize", params);
    return res;
  };

  const openCodeInput = (account, sign) => {
    const url = new URL(window.location.href);
    const urlCode = url.searchParams.get('code');

    const confirm = async () => {
      const code = document.getElementById('codeInput').value

      if (!code) {
        Toast.show("Enter Invite Code")
        setTimeout(() => {
          openCodeInput(account, sign)
        }, 1000)
        return
      }

      const res = await login({ address: account, code, sign, noMsg: true })
      // 判断是否直接进入系统
      if (res.token) {
        loginSuccess(res.token, sign);
      } else {
        Toast.show(res.status)
        setTimeout(() => {
          openCodeInput(account, sign)
        }, 1000)
      }
    }

    Dialog.alert({
      title: 'Enter Invite Code',
      closeable: false,
      theme: 'round-button',
      overlay: false,
      className: 'code-dialog',
      showConfirmButton: true,
      message: (
        <div className="code-input-dialog">
          <input type="text" defaultValue={urlCode} id="codeInput" placeholder="Enter Invite Code" />
          {/* <button onClick={() => confirm()}>确认</button> */}
        </div>
      )
    }).then(res => {
      console.log(res)
      confirm()
    })
  }

  const init = async () => {
    // props.dispatch.setIsLogin(true)
    // return

    const account = await ETH.getAccount();

    let sign = null

    const accountLac = localStorage.getItem("account");

    if (accountLac && accountLac === ETH.account) {
      sign = localStorage.getItem('sign')
      if (sign === 'null') {
        sign = await ETH.signMessage(false)
      }
    } else {
      sign = await ETH.signMessage(false)
      console.log(sign)
    }

    // /* 判断是否本地token */
    // return
    if (accountLac && accountLac === ETH.account) {
      localStorage.setItem("sign", sign);
      loginSuccess();
      return;
    }

    localStorage.removeItem("account")
    localStorage.removeItem("token")
    localStorage.removeItem("sign")

    // this.loadAccount = true;
    setLoadAccount(true)

    const res = await login({ address: account, code: "", sign, noMsg: true })

    // 判断是否直接进入系统
    if (res.token) {
      loginSuccess(res.token, sign);
    } else {
      openCodeInput(account, sign)
    }
  }

  return (
    <>
      <div className="no-login">
        <div className="no-login-content">
          <Loading type="spinner" />
          <span>{!loadAccount ? t('Connecting wallet') : t('Contract verification in progress')}</span>
        </div>
      </div>
    </>
  )
}

export default NoLogin;