import axios from "axios";
import { Toast } from 'react-vant'
import i18next from '../i18n';

const { t } = i18next;

const instance = axios.create({
    baseURL: import.meta.env.DEV ? import.meta.env.VITE_API + "/api/app_server" : import.meta.env.VITE_API + "/api/app_server",
});

// 请求拦截
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
}, (err) => {
    return Promise.reject(err);
});

// 响应拦截
instance.interceptors.response.use((res) => {
    const status = res.data?.status;

    if (res.config.method === "post" && status === 'ok' && res.request.responseURL.indexOf('/eth_authorize') == -1 && res.request.responseURL.indexOf('/look_card') == -1 && res.request.responseURL.indexOf('/create_nonce') == -1) {
      Toast.info((t('Operation successful')));
    }

    if (res.config.method === "post" && status !== 'ok' && status !== t('Invalid referral code') && res.request.responseURL.indexOf('/look_card') === -1) {
        status && Toast.info(status);
    }

    return res.data;
}, (err) => {
    // 报错提示
    const message = err.response?.data?.message;
    const reason = err.response?.data?.reason;
    const status = err.response?.status;
    const code = err.response?.data?.code;
    const noMsg = err.config.method === "post" && err.config?.data && JSON.parse(err.config.data)?.noMsg;

    // if (!noMsg) {
    //     if (message) {
    //         showFailToast(i18n.global.locale.value === "zh" ? message : reason);
    //     } else {
    //         showFailToast(err.response?.statusText);
    //     }
    // }

    if (code === 404) {
        localStorage.removeItem("account");
        localStorage.removeItem("sign");
        localStorage.removeItem("token");
        location.href = "/";
    }
    // 自动退出登录
    if (status === 401 || message === "user not found") {
        Toast.info(t('Session expired'));
        localStorage.removeItem("account");
        localStorage.removeItem("sign");
        localStorage.removeItem("token");
        location.href = "/";
    }

    return Promise.reject(err);
});

export default instance;