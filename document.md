8.1 Token 管理
# 合约地址0xfd54927185312Af6ba54F676D50dCbFEbb5EFa82
---

* 设置免税地址：`setFeeExempt`
* 设置买卖税/盈利税：`setBuyFees` / `setSellFees` / `setProfitFees`
* 设置防爆跌系数：`setAntiDumpTiers`

## 8.2 Staking 管理

## 合约地址0x8F48b5875a065B2f68d31Dd676282E90453a4263

* 设置 queue 每个钱包每日取消上限：`setDailyQueueCancelLimit`
* 设置日限额分档：`setStageThresholds` / `setDailyLimitRates`
* 设置奖励费率：`setRewardFeeConfig` / `setRewardCbNewOrderFeeConfig`
* 设置熔断参数：`setCircuitBreakerParams`
* 管理员取消排队单：`adminCancelQueuedStake` / `adminCancelQueuedStakes`
* 暂停/恢复：`pause` / `unpause`
* 处理队列：`processStakeQueue`
* 更新熔断：`updateCircuitBreaker`
* 燃烧过期奖励：`burnExpiredReward`

## 8.3 用户体系管理

## 合约地址0x3C112C03D6d8f500A3527746d04C59f39E932bD7

* 手动补额外业绩：`setExtraPerformance`

## 8.4 分红管理

## 合约地址0x3eba1Aa2d3D18095b547C5A7FB92379a70052aD0

* 设置最小处理额：`setGlobalMinProcessAmount`
* 设置节点：`setActiveUser`
* 移除节点（附加清楚额外业绩）：`removeActiveUser`
* 执行全局分红：`processGlobalNodeDividendWindow`

## 8.5 空投管理

## 合约地址0x922b79C9c795fABE98F2846E34BF626AC7B0f8Cb

* 开关领取：`setClaimEnabled`
* 提走资产MS代币：`withdrawToken`

