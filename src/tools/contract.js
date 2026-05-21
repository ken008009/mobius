// 导入模块
import detectEthereumProvider from '@metamask/detect-provider'; // 用于检测以太坊提供者（例如MetaMask）
import { ethers } from "ethers"; // 导入 ethers 库中的 ethers 和 BigNumber 对象
import { Toast } from 'antd-mobile'
import abi from "./abi.json"; // 导入智能合约 ABI
import { fetchNonce } from '@services/api'
import Big from 'big.js';
import i18next from '../i18n';

const { t } = i18next;

const usdtAbi = [
    "function balanceOf(address owner) view returns (uint256)",
];

/* 链接钱包类 */
export class ETH {
    static provider = undefined;    // 提供者
    static account = "";         // 钱包地址
    static signer = undefined;       // 用户签名者

    // 链接钱包返回钱包地址
    static async getAccount() {
        const ethereum = await detectEthereumProvider(); // 检测以太坊提供者
        if (!ethereum) { // 如果未检测到以太坊提供者
          Toast.show(t('Please install a wallet')); // 显示失败的提示信息
            throw t('Please install a wallet'); // 抛出错误信息
        }

        // 1️⃣ 主动切换到 BNB Chain
        try {
            await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }], // BNB Mainnet
            });
        } catch (switchError) {
            // 2️⃣ 如果钱包没有 BNB 网络，则自动添加
            if (switchError.code === 4902) {
            try {
                await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x38',
                    chainName: 'BNB Smart Chain',
                    nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18,
                    },
                    rpcUrls: ['https://bsc-dataseed.binance.org/'],
                    blockExplorerUrls: ['https://bscscan.com'],
                }],
                });
            } catch (addError) {
                Toast.show(t('Failed to add BNB network'));
                throw addError;
            }
            } else {
            Toast.show(t('Please switch to the BNB network'));
            throw switchError;
            }
        }

        ETH.provider = new ethers.providers.Web3Provider(ethereum); // 使用 Web3Provider 创建提供者
        const chainId = Number(await ethereum.request({ method: 'eth_chainId' })); // 获取链ID
        console.log('chainId', chainId)
        if (!(chainId === Number(import.meta.env.VITE_CHAINID) || chainId === 1)) { // 如果链ID不匹配
          Toast.show(t('Please connect to the BSC network')); // 显示失败的提示信息
            throw t('Please connect to the BSC network'); // 抛出错误信息
        }
        ETH.account = ethers.utils.getAddress((await ethereum.request({ method: 'eth_requestAccounts' }))[0]); // 获取钱包地址
        ETH.signer = ETH.provider.getSigner(); // 获取用户签名者
        return ETH.account; // 返回钱包地址
    }
    static formatToken(value, decimals = 18, fixed = 3) {
        if (!value) return '0';

        const formatted = ethers.utils.formatUnits(value, decimals);

        return new Big(formatted).toFixed(fixed);
    };

    static async getUserOverview(address = ETH.account) {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi.VIEW, ETH.signer); // 创建合约对象
        console.log('contract', contract)
        const res = await contract.userOverview(address)
        return res
    }

    static async getChildrenPage(address = ETH.account, page = 0, pageSize = 20) {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi.VIEW, ETH.signer); // 创建合约对象
        const res = await contract.childrenPage(address, page, pageSize)
        return res
    }

    static async getUserQueueInfo(address = ETH.account) { 
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi.VIEW, ETH.signer);

        return contract.getUserQueueInfo(address)
    };

    static async getUserOrders(address = ETH.account, page = '0', pageSize = '10') {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi.VIEW, ETH.signer); // 创建合约对象
        return contract.getUserOrders(address, page, pageSize)
    }

    static async getStakeQueuePage(page, pageSize) {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi.VIEW, ETH.signer); // 创建合约对象

        return contract.stakeQueuePage(page, pageSize)
    }

    static async getMyStakesPage(page, pageSize) {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi.VIEW, ETH.signer); // 创建合约对象
        console.log(ETH.account, page, pageSize)
        return contract.myStakesPage(ETH.account, page, pageSize)
    }

    static async plans() {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi.VIEW, ETH.signer);
        return contract.plans()
    }

    static async userView(address = ETH.account) {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi.VIEW, ETH.signer);
        return contract.userView(address)
    }

    // 签名
    static async signMessage(status = true) {
        return new Promise(async (resolve, reject) => {
            try {
                if (status) {
                    const signer = await fetchNonce({
                        address: ETH.account
                    });

                    if (signer.status === 'ok') {
                        resolve(await ETH.signer.signMessage(signer.nonce));
                    } else {
                        reject()
                    }
                } else {
                    resolve(await ETH.signer.signMessage(ETH.account));
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    // 将数字转换为指定精度的 BigNumber 对象
    static parseUnits(n, dec) {
        return ethers.utils.parseUnits(`${n}`, dec); // 将数字转换为 BigNumber 对象
    }

    static async isAddress(address) {
        return ethers.utils.isAddress(address);
    }

    // 将 BigNumber 对象转换为指定精度的字符串
    static formatUnits(n, dec) {
        return ethers.utils.formatUnits(n, dec); // 将 BigNumber 对象转换为字符串
    }

    // 格式化钱包地址
    static format_address(v, n = 8) {
        const reg = new RegExp(`^(.{${n}})(.*)(.{${n}})$`, "ig"); // 创建正则表达式，用于格式化地址
        return v.replace(reg, "$1...$3"); // 格式化钱包地址
    }
}

/* 合约类 */
export class Contract {
    constructor(address, abiName) {
        this.address = address; // 设置合约地址
        this.abiName = abiName; // 设置 abi 名称
    }

    // 获取合约实例
    getInsance() {
        return new ethers.Contract(this.address, abi[this.abiName], ETH.provider).connect(ETH.signer); // 创建合约实例并连接用户签名者
    }

    // 调用合约方法
    async call(methods, params = []) {
        return await this.getInsance()[methods](...params); // 调用合约方法
    }

    // 发送交易至合约
    async send(methods, params = []) {
        return new Promise(async (resolve, reject) => {
            try {
                let tx = {};
                try {
                    tx = await this.getInsance()[methods](...params); // 发送交易
                } catch (error) {
                    if (!(error.code === "INVALID_ARGUMENT" && error.reason === "missing from address")) { // 如果不是因为缺少地址导致的错误
                        reject(error); // 抛出错误
                    }
                    tx.hash = error.transactionHash; // 获取交易哈希
                }
                let receipt = await ETH.provider.waitForTransaction(tx.hash); // 等待交易确认
                if (receipt.status == 1) { // 如果交易成功
                    resolve()
                } else {
                    reject(t('Transaction failed')); // 抛出错误信息
                }
            } catch (error) {
                let msg = "";
                if (error.data) msg = error.data.message;
                else if (/^Error/ig.test(error.toString())) msg = t('Transaction failed');
                else if (error.message) msg = error.message;
                else msg = error;
                reject(msg); // 抛出错误信息
            }
        })
    }
}