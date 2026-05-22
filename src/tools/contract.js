// 导入模块
import detectEthereumProvider from '@metamask/detect-provider'; // 用于检测以太坊提供者（例如MetaMask）
import { ethers } from "ethers"; // 导入 ethers 库中的 ethers 和 BigNumber 对象
import { Toast } from 'antd-mobile'
import abi from "./abi.json"; // 导入智能合约 ABI
import stakeAbi from "./stake.json"; // 导入 STAKE 合约 ABI
import userAbi from "./userContract.json"; // 导入 USER 合约 ABI
import { fetchNonce } from '@services/api'
import Big from 'big.js';
import i18next from '../i18n';

const { t } = i18next;

const usdtAbi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
];

/* 链接钱包类 */
export class ETH {
    static provider = undefined;    // 提供者
    static account = "";         // 钱包地址
    static signer = undefined;       // 用户签名者
    
    // ========== Promise 锁：防止并发调用造成 MetaMask 阻塞 ==========
    static _connectingPromise = null

    /**
     * 确保钱包已连接：如果正在连接中，复用已有 Promise
     * 避免多个并发调用触发多次 wallet_switchEthereumChain
     */
    static async ensureWallet() {
        console.log('🔐 [ensureWallet] signer:', !!ETH.signer, 'connectingPromise:', !!ETH._connectingPromise)
        
        if (ETH.signer) {
            console.log('🔐 [ensureWallet] 已有 signer，直接返回')
            return ETH.account
        }
        if (ETH._connectingPromise) {
            console.log('🔐 [ensureWallet] 正在连接中，等待已有 Promise')
            return await ETH._connectingPromise
        }
        
        console.log('🔐 [ensureWallet] 开始新连接')
        ETH._connectingPromise = ETH._doConnect()
        try {
            return await ETH._connectingPromise
        } finally {
            ETH._connectingPromise = null
            console.log('🔐 [ensureWallet] 连接完成，重置 Promise 锁')
        }
    }
    
    /**
     * 实际执行连接（内部方法）
     */
    static async _doConnect() {
        const ethereum = await detectEthereumProvider()
        if (!ethereum) {
            Toast.show(t('Please install a wallet'))
            throw t('Please install a wallet')
        }
        
        // 提前检查当前 chainId，如果已经是目标链则跳过 switch
        const currentChainIdHex = await ethereum.request({ method: 'eth_chainId' })
        const targetChainIdHex = '0x38'
        console.log('🔗 [_doConnect] 当前链:', currentChainIdHex, '目标链:', targetChainIdHex)
        
        if (currentChainIdHex !== targetChainIdHex) {
            console.log('🔗 [_doConnect] 需要切换链，调用 wallet_switchEthereumChain')
            try {
                await ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: targetChainIdHex }],
                })
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x38',
                            chainName: 'BNB Smart Chain',
                            nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                            rpcUrls: ['https://bsc-dataseed.binance.org/'],
                            blockExplorerUrls: ['https://bscscan.com'],
                        }],
                    })
                } else {
                    Toast.show(t('Please switch to the BNB network'))
                    throw switchError
                }
            }
        }
        
        ETH.provider = new ethers.providers.Web3Provider(ethereum)
        const chainId = Number(await ethereum.request({ method: 'eth_chainId' }))
        if (!(chainId === Number(import.meta.env.VITE_CHAINID) || chainId === 1)) {
            Toast.show(t('Please connect to the BSC network'))
            throw t('Please connect to the BSC network')
        }
        ETH.account = ethers.utils.getAddress((await ethereum.request({ method: 'eth_requestAccounts' }))[0])
        ETH.signer = ETH.provider.getSigner()
        return ETH.account
    }

    // 链接钱包返回钱包地址（主动连接入口，保持向后兼容）
    static async getAccount() {
        return ETH.ensureWallet()
    }

    static formatToken(value, decimals = 18, fixed = 3) {
        if (!value) return '0';

        const formatted = ethers.utils.formatUnits(value, decimals);

        return new Big(formatted).toFixed(fixed);
    };

    static async getUserOverview(address = ETH.account) {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi, ETH.signer); // 创建合约对象
        console.log('contract', contract)
        const res = await contract.userOverview(address)
        return res
    }

    static async getUserQueueInfo(address = ETH.account) { 
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi, ETH.signer);

        return contract.getUserQueueInfo(address)
    };

    static async getStakeQueuePage(page, pageSize) {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi, ETH.signer); // 创建合约对象

        return contract.queuePage(page, pageSize)
    }

    static async getMyStakesPage(page, pageSize) {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi, ETH.signer); // 创建合约对象
        console.log(ETH.account, page, pageSize)
        return contract.myStakesPage(ETH.account, page, pageSize)
    }

    // ========== 只读方法：使用 eth_call，避免 ethers.Contract 挂起问题 ==========

    static async plans() {
        const iface = new ethers.utils.Interface(['function plans() view returns (tuple(uint256 index, uint128 minAmount, uint128 maxAmount, uint128 outAmount, uint32 daysCount, bool enabled)[])']);
        const raw = await window.ethereum.request({
            method: 'eth_call',
            params: [{ to: import.meta.env.VITE_VIEW, data: iface.encodeFunctionData('plans', []) }, 'latest']
        });
        const decoded = iface.decodeFunctionResult('plans', raw);
        return decoded[0].map(item => ({
            index: item[0], minAmount: item[1], maxAmount: item[2],
            outAmount: item[3], daysCount: item[4], enabled: item[5]
        }));
    }

    static async userView(address = ETH.account) {
        const iface = new ethers.utils.Interface(['function userView(address a) view returns (tuple(bool bound, bool sys, bool locked, address parent, int8 level, uint16 rate, uint256 tokenBal, uint256 usdtBal, uint256 principalU, uint256 exemptToken, uint256 baseStake, uint256 basePerf, uint256 perf, uint256 teamU, uint256 teamClaimed, uint256 levelRewardTotal, uint40 teamClearAt, uint40 teamClearDeadline, bool teamExpired, uint256 orderCount, uint256 capLeftTotal, uint256 teamNeedCap, uint256 lineClaimableTotal) v)']);
        const raw = await window.ethereum.request({
            method: 'eth_call',
            params: [{ to: import.meta.env.VITE_VIEW, data: iface.encodeFunctionData('userView', [address]) }, 'latest']
        });
        const decoded = iface.decodeFunctionResult('userView', raw);
        const item = decoded[0];
        return {
            bound: item[0], sys: item[1], locked: item[2], parent: item[3],
            level: item[4], rate: item[5], tokenBal: item[6], usdtBal: item[7],
            principalU: item[8], exemptToken: item[9], baseStake: item[10],
            basePerf: item[11], perf: item[12], teamU: item[13],
            teamClaimed: item[14], levelRewardTotal: item[15],
            teamClearAt: item[16], teamClearDeadline: item[17],
            teamExpired: item[18], orderCount: item[19], capLeftTotal: item[20],
            teamNeedCap: item[21], lineClaimableTotal: item[22]
        };
    }

    static async orders(address = ETH.account, page = 0, pageSize = 10) {
        const iface = new ethers.utils.Interface(['function orders(address a, uint256 off, uint256 lim) view returns (tuple(uint256 index, uint256 id, address account, uint128 amount, uint128 cap, uint128 used, uint128 linePaid, uint40 created, uint40 start, uint40 claimEffective, uint40 effectiveNow, uint32 daysCount, bool exited, uint256 capNow, uint256 left, uint256 comp, uint256 lineClaimable)[] out)']);
        const raw = await window.ethereum.request({
            method: 'eth_call',
            params: [{ to: import.meta.env.VITE_VIEW, data: iface.encodeFunctionData('orders', [address, page, pageSize]) }, 'latest']
        });
        const decoded = iface.decodeFunctionResult('orders', raw);
        return decoded[0].map(item => ({
            index: item[0], id: item[1], account: item[2], amount: item[3],
            cap: item[4], used: item[5], linePaid: item[6], created: item[7],
            start: item[8], claimEffective: item[9], effectiveNow: item[10],
            daysCount: item[11], exited: item[12], capNow: item[13],
            left: item[14], comp: item[15], lineClaimable: item[16]
        }));
    }

    // getUserOrders 是 orders 的别名，保持向后兼容
    static async getUserOrders(address = ETH.account, page = 0, pageSize = 10) {
        return ETH.orders(address, page, pageSize)
    }

    static async children(address = ETH.account, page = 0, pageSize = 20) {
        const iface = new ethers.utils.Interface(['function children(address a, uint256 off, uint256 lim) view returns (tuple(address account, uint256 baseStake, uint256 basePerf, uint256 perf, int8 level, uint16 rate)[] out)']);
        const raw = await window.ethereum.request({
            method: 'eth_call',
            params: [{ to: import.meta.env.VITE_VIEW, data: iface.encodeFunctionData('children', [address, page, pageSize]) }, 'latest']
        });
        const decoded = iface.decodeFunctionResult('children', raw);
        return decoded[0].map(item => ({
            account: item[0], baseStake: item[1], basePerf: item[2],
            perf: item[3], level: item[4], rate: item[5]
        }));
    }

    // 获取全局视图数据
    static async getGlobalView() {
        const contract = new ethers.Contract(import.meta.env.VITE_VIEW, abi, ETH.signer);
        return contract.globalView()
    }

    // 获取黑洞代币余额
    static async getTOKENBalance() {
        const stakeContract = new ethers.Contract(import.meta.env.VITE_BUY, stakeAbi, ETH.signer);
        const deadAddress = await stakeContract.DEAD();
        const tokenContract = new ethers.Contract(import.meta.env.VITE_ISPS, ["function balanceOf(address) view returns (uint256)"], ETH.signer);
        const balance = await tokenContract.balanceOf(deadAddress);
        return ETH.formatToken(balance, 18, 4);
    }

    // 绑定上级：调用 userContract 的 bind(address) 方法
    static async bind(parentAddress) {
        const contract = new ethers.Contract(import.meta.env.VITE_TEAM, userAbi, ETH.signer);
        return contract.bind(parentAddress)
    }

    // 质押：调用 stake(amount, plan) 合约方法
    static async stake(amount, plan = 0) {
        const contract = new ethers.Contract(import.meta.env.VITE_BUY, stakeAbi, ETH.signer);
        // amount 需要转换为 wei 单位
        const amountWei = ETH.parseUnits(amount, 18);
        return contract.stake(amountWei, plan)
    }

    // 领取单个订单奖励：调用 claimLine(index)
    static async claimLine(index) {
        const contract = new ethers.Contract(import.meta.env.VITE_BUY, stakeAbi, ETH.signer);
        return contract.claimLine(index)
    }

    // 一键领取所有奖励：调用 claimLineAll(maxOrders)
    static async claimLineAll(maxOrders) {
        const contract = new ethers.Contract(import.meta.env.VITE_BUY, stakeAbi, ETH.signer);
        return contract.claimLineAll(maxOrders)
    }

    // 领取团队奖励：调用 claimTeam(amount)
    static async claimTeam(amount) {
        const contract = new ethers.Contract(import.meta.env.VITE_BUY, stakeAbi, ETH.signer);
        const amountWei = ETH.parseUnits(amount, 18);
        return contract.claimTeam(amountWei)
    }

    // 检查 USDT 授权额度
    static async checkUsdtAllowance(spender = import.meta.env.VITE_BUY) {
        const usdtContract = new ethers.Contract(import.meta.env.VITE_USDT, usdtAbi, ETH.signer);
        const allowance = await usdtContract.allowance(ETH.account, spender);
        return allowance;
    }

    // 授权 USDT
    static async approveUsdt(spender = import.meta.env.VITE_BUY, amount = '1000000000000000000000000') {
        const usdtContract = new ethers.Contract(import.meta.env.VITE_USDT, usdtAbi, ETH.signer);
        return usdtContract.approve(spender, amount);
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