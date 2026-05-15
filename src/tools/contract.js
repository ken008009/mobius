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

    static async getISPSBalance() {
        const contract = new ethers.Contract(import.meta.env.VITE_ISPS, abi.ERC20, ETH.signer); // 创建合约对象
        const balance = await contract.balanceOf(ETH.account);
        return ethers.utils.formatUnits(balance, 'ether');
    }

    static async getUSDTBalance() {
        const contract = new ethers.Contract(import.meta.env.VITE_USDT, abi.USDT, ETH.signer); // 创建合约对象

        try {
            // 调用balanceOf函数来获取USDT余额
            const balance = await contract.balanceOf(ETH.account);
            return ethers.utils.formatUnits(balance, 'ether');
        } catch (error) {
            console.error(`${t('Error fetching USDT balance')}:`, error);
            return 0;
        }
    }
    static async getTOKENBalance() {
        const contract = new ethers.Contract(import.meta.env.VITE_DB, abi.DB, ETH.signer); // 创建合约对象
        try {
            // 调用balanceOf函数来获取USDT余额
            const balance = await contract.balanceOf('0x000000000000000000000000000000000000dEaD');
            return ethers.utils.formatUnits(balance, 'ether');
        } catch (error) {
            console.error(`${t('Error fetching token balance')}:`, error);
            return 0;
        }
    }

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

    static async register(address) {
        const contract = new ethers.Contract(import.meta.env.VITE_TEAM, abi.TEAM, ETH.signer); // 创建合约对象

        return contract.register(address)
    }

    static async getGlobalOverview() {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi.VIEW, ETH.signer); // 创建合约对象

        return contract.globalOverview()
    }

    static async getChildrenPage(address = ETH.account) {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi.VIEW, ETH.signer); // 创建合约对象
        const userSummary = await contract.getUserSummary(ETH.account)

        return contract.getChildrenPage(address, '0', userSummary.directChildrenCount)
    }

    static async kongTouPreviewClaim(address = ETH.account) {
        const contract = new ethers.Contract(import.meta.env.VITE_KT, abi.KT, ETH.signer); // 创建合约对象
        console.log(contract, address)
        return contract.previewClaim(address)
    }

    static async kongTouClaim() {
        const contract = new ethers.Contract(import.meta.env.VITE_KT, abi.KT, ETH.signer); // 创建合约对象
        console.log(contract)
        return contract.claim()
    }

    static async claimableOf(address = ETH.account) {
        const contract = new ethers.Contract(import.meta.env.VITE_FH, abi.FH, ETH.signer);

        return this.formatToken(await contract.claimableOf(address))
    }

    static async getUserQueueInfo(address = ETH.account) { 
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi.VIEW, ETH.signer);

        return contract.getUserQueueInfo(address)
    };

    static async getGlobalView() {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi.VIEW, ETH.signer); // 创建合约对象
        const globalView = await contract.getGlobalView()
        const pair = await contract.pair()
        const userSummary = await contract.getUserSummary(ETH.account)
        console.log('pair', pair, globalView.priceA.toString())
        return {
            priceA: this.formatToken(globalView.priceA.toString()),
            reserveUCurrent: this.formatToken(globalView.reserveUCurrent.toString()),
            perf: this.formatToken(userSummary.perf.toString()) - this.formatToken(userSummary.extraTeamPerf.toString()),
            level: userSummary.level.toString(),
            isRegistered: userSummary.isRegistered,
            baseStakedAmount: this.formatToken(userSummary.baseStakedAmount.toString()),
            teamCount: this.formatToken(userSummary.perfSon.toString()),
            maxStakeAmountNow: this.formatToken(globalView.maxStakeAmountNow.toString()),
            originMaxStakeAmountNow: globalView.maxStakeAmountNow.toString(),
            dividend: this.formatToken(globalView.dividendUsdtBalance.toString()) / globalView.dividendActiveUsers.toString(),
            queueLength: globalView.queueLength.toString(),
            queueCursor: globalView.queueCursor.toString(),
            parent: userSummary.parent,
            stakeOrderCount: userSummary.stakeOrderCount.toString(),
            canUnstakeCount: userSummary.canUnstakeCount.toString(),
            canRestakeCount: userSummary.canRestakeCount.toString(),
            claimableOrderCount: userSummary.claimableOrderCount.toString(),
            nextUnlockTime: userSummary.nextUnlockTime.toString(),
            nextTtlDeadline: userSummary.nextTtlDeadline.toString(),
            circuitBreakerTime: globalView.circuitBreakerTime.toString(),
        }
    }

    static async getUserOrders(address = ETH.account) {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi.VIEW, ETH.signer); // 创建合约对象
        const userSummary = await contract.getUserSummary(ETH.account)
        // console.log('userSummary', userSummary.stakeOrderCount.toString())
        return contract.getUserOrders(address, '0', userSummary.stakeOrderCount.toString())
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

    static async stake(...params) {
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

        return contract.stake(...params)
    }
    static async batchStake(...params) {
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

        return contract.batchStake(...params)
    }

    static async stakeWithInviter(...params) {
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

        return contract.stakeWithInviter(...params)
    }


    static async batchStakeWithInviter(...params) {
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

        return contract.batchStakeWithInviter(...params)
    }

    static async stakeToken(...params) {
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

//         const userUsed = await contract.userDepositUsed(ETH.account);
//         const userCap = await contract.postStartUserCap();
// console.log("已用额度:", userUsed.toString());
// console.log("用户上限:", userCap.toString());
        // try {
        //     await contract.callStatic.stakeToken(...params);
        // } catch (err) {
        //     console.log(err.error?.data || err);
        // }
        console.log('stakeToken', params)

        return contract.stakeToken(...params)
    }
    // 解押
    static async unstake(index) {
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

        return contract.unstake(index)
    }
    // 复投
    static async restake(...params) {
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

        return contract.restake(...params)
    }

    static async batchUnstake(index) {
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

        return contract.batchUnstake(index)
    }

    static async batchRestake(...params) {
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

        return contract.batchRestake(...params)
    }

    static async batchClaim(...params) {
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

        return contract.batchClaim(...params)
    }

    // 提取收益
    static async claim(index) {
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

        return contract.claim(index)
    }

    static async cancelQueuedStake(index) {
        console.log('index', index)
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

        return contract.cancelQueuedStake(index)
    }

    static async stakeQueuePage(index) {
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

        return contract.stakeQueuePage(index)
    }

    static async setAutoCompound(index, state) {
        const contract = new ethers.Contract(import.meta.env.VITE_ZY, abi.ZY, ETH.signer);

        return contract.setAutoCompound(index, state)
    }

    static async getKSDTBalance() {
        const contract = new ethers.Contract(import.meta.env.VITE_KSDT, abi.ERC20, ETH.signer); // 创建合约对象
        const balance = await contract.balanceOf(ETH.account);
        return ethers.utils.formatUnits(balance, 'ether');
    }

    static async processGlobalNodeDividendWindow(...params) {
        const contract = new ethers.Contract(import.meta.env.VITE_FH, abi.FH, ETH.signer);

        contract.processGlobalNodeDividendWindow(...params)
    }

    static async subscribe(...params) {
        try {
            const contract = new ethers.Contract(import.meta.env.VITE_FH, abi.FH, ETH.signer);

            contract.subscribe(...params)
        } catch (error) {
            console.log('error', error)
        }
    }

    static async getUsdtValueFromIsps(amount) {
        try {
            const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT, abi.ISPS, ETH.signer); // 创建合约对象
            const path = [import.meta.env.VITE_ISPS, import.meta.env.VITE_USDT];
            const amountsOut = await contract.getAmountsOut(ethers.utils.parseEther(amount), path);
            return ethers.utils.formatUnits(amountsOut[1].toString(), 'ether');
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
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
    static dbContract() {
        const contract = new ethers.Contract(import.meta.env.VITE_DB, abi.DB, ETH.signer);
        return contract
    }
    static teamContract() {
        const contract = new ethers.Contract(import.meta.env.VITE_TEAM, abi.TEAM, ETH.signer);
        return contract
    }
    static fhContract() {
        const contract = new ethers.Contract(import.meta.env.VITE_FH, abi.FH, ETH.signer);
        return contract
    }
    static ktContract() {
        const contract = new ethers.Contract(import.meta.env.VITE_KT, abi.KT, ETH.signer);
        return contract
    }
    static zysqContract() {
        const contract = new ethers.Contract(import.meta.env.VITE_ZYSQ, abi.ZYSQ, ETH.signer);
        return contract
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