import React, {useState, useEffect, useContext} from 'react'
import { Form, Input, Switch, Button, Card, Tabs, Space, Selector } from "antd-mobile";
import StoreContext from '@store/context';
import { withToast } from '@components/withToast';
import { ETH } from '@tools/contract'
import './index.less'

const Admin = (props) => {
  const [tab, setTab] = useState('1')
  const { state, dispatch } = useContext(StoreContext)
  const [form] = Form.useForm();
  const { t } = props

  useEffect(() => {
  }, [])

  const setFeeExempt = async (values) => {
    console.log("Form Values:", values);
    const { account, exempt } = values

    await withToast(async () => {
      const dbContract = await ETH.dbContract()
      const tx = await dbContract.setFeeExempt(account, exempt)

      await tx.wait()
    }, { t })
  };
  const setBuyFees = async (values) => {
    console.log("Form Values:", values);
    const { eco, backflow, node, direct, indirect } = values

    await withToast(async () => {
      const dbContract = await ETH.dbContract()
      const tx = await dbContract.setBuyFees(eco, backflow, node, direct, indirect)

      await tx.wait()
    }, { t })
  };
  const setSellFees = async (values) => {
    console.log("Form Values:", values);
    const { global_, eco, game } = values

    await withToast(async () => {
      const dbContract = await ETH.dbContract()
      const tx = await dbContract.setSellFees(global_, eco, game)

      await tx.wait()
    }, { t })
  };
  const setProfitFees = async (values) => {
    console.log("Form Values:", values);
    const { total, eco, node, backflow, game, global_, burn } = values

    await withToast(async () => {
      const dbContract = await ETH.dbContract()
      const tx = await dbContract.setProfitFees(total, eco, node, backflow, game, global_, burn)

      await tx.wait()
    }, { t })
  };
  const setDailyQueueCancelLimit = async (values) => {
    console.log("Form Values:", values);
    const { limit } = values

    await withToast(async () => {
      const zysqContract = await ETH.zysqContract()
      const tx = await zysqContract.setDailyQueueCancelLimit(limit)

      await tx.wait()
    }, { t })
  }
  const setStageThresholds = async (values) => {
    console.log("Form Values:", values);
    const { stage1, stage2 } = values

    await withToast(async () => {
      const zysqContract = await ETH.zysqContract()
      const tx = await zysqContract.setStageThresholds(stage1, stage2)

      await tx.wait()
    }, { t })
  }
  const setDailyLimitRates = async (values) => {
    console.log("Form Values:", values);
    const { stakeLow, stakeMid, stakeHigh, unstakeLow, unstakeMid, unstakeHigh } = values

    await withToast(async () => {
      const zysqContract = await ETH.zysqContract()
      const tx = await zysqContract.setDailyLimitRates(stakeLow, stakeMid, stakeHigh, unstakeLow, unstakeMid, unstakeHigh)

      await tx.wait()
    }, { t })
  }
  const setRewardFeeConfig = async (values) => {
    console.log("Form Values:", values);
    const { feeTotalBps, ecoBps, gameBps, globalBps, s7Bps, teamRewardMaxBps } = values

    await withToast(async () => {
      const zysqContract = await ETH.zysqContract()
      const tx = await zysqContract.setRewardFeeConfig(feeTotalBps, ecoBps, gameBps, globalBps, s7Bps, teamRewardMaxBps)

      await tx.wait()
    }, { t })
  }
  const setRewardCbNewOrderFeeConfig = async (values) => {
    console.log("Form Values:", values);
    const { ecoBpsTwo, directBps } = values

    await withToast(async () => {
      const zysqContract = await ETH.zysqContract()
      const tx = await zysqContract.setRewardCbNewOrderFeeConfig(ecoBpsTwo, directBps)

      await tx.wait()
    }, { t })
  }
  const setCircuitBreakerParams = async (values) => {
    console.log("Form Values:", values);
    const { dropBpsThreshold, recoveryDuration, unstakeRatePermille } = values

    await withToast(async () => {
      const zysqContract = await ETH.zysqContract()
      const tx = await zysqContract.setCircuitBreakerParams(dropBpsThreshold, recoveryDuration, unstakeRatePermille)

      await tx.wait()
    }, { t })
  }
  const adminCancelQueuedStake = async (values) => {
    console.log("Form Values:", values);
    const { queueIndexes } = values

    const queueIndexesArray = queueIndexes.split('|').map(index => parseInt(index.trim())).filter(index => !isNaN(index))

    await withToast(async () => {
      const zysqContract = await ETH.zysqContract()
      if (queueIndexesArray.length === 1) {
        const tx = await zysqContract.adminCancelQueuedStake(queueIndexesArray[0])

        await tx.wait()
      } else {
        const tx = await zysqContract.adminCancelQueuedStakes(queueIndexesArray)

        await tx.wait()
      }
    }, { t })
  }
  const setPauseAndUnpause = async (enabled) => {
    await withToast(async () => {
      const zysqContract = await ETH.zysqContract()

      if (enabled) {
        const tx = await zysqContract.unpause()

        await tx.wait()
        return
      } else {
        const tx = await zysqContract.pause()

        await tx.wait()
        return
      }
    }, { t })
  }
  const processStakeQueue = async (values) => {
    console.log("Form Values:", values);
    const { maxItems } = values

    await withToast(async () => {
      const zysqContract = await ETH.zysqContract()
      const tx = await zysqContract.processStakeQueue(maxItems)

      await tx.wait()
    }, { t })
  }
  const updateCircuitBreaker = async () => {
    await withToast(async () => {
      const zysqContract = await ETH.zysqContract()
      const tx = await zysqContract.updateCircuitBreaker()

      await tx.wait()
    }, { t })
  }
  const burnExpiredReward = async (values) => {
    console.log("Form Values:", values);
    const { user, index } = values

    await withToast(async () => {
      const zysqContract = await ETH.zysqContract()
      const tx = await zysqContract.burnExpiredReward(user, index)

      await tx.wait()
    }, { t })
  }
  const setAntiDumpTiers = async (values) => {
    console.log("Form Values:", values);
    const { dropBps_, burnBps_ } = values

    await withToast(async () => {
      const dbContract = await ETH.dbContract()
      const tx = await dbContract.setAntiDumpTiers(dropBps_, burnBps_)

      await tx.wait()
    }, { t })
  }
  const setExtraPerformance = async (values) => {
    console.log("Form Values:", values);
    const { account, extraTeamPerformance, extraPersonalStake } = values

    await withToast(async () => {
      const teamContract = await ETH.teamContract()
      const tx = await teamContract.setExtraPerformance(account, extraTeamPerformance, extraPersonalStake)

      await tx.wait()
    }, { t })
  }
  const setGlobalMinProcessAmount = async (values) => {
    console.log("Form Values:", values);
    const { minProcessAmount } = values

    await withToast(async () => {
      const fhContract = await ETH.fhContract()
      const tx = await fhContract.setGlobalMinProcessAmount(minProcessAmount)

      await tx.wait()
    }, { t })
  }
  const setActiveUser = async (values) => {
    console.log("Form Values:", values);
    const { account, extraTeamPerformance, extraPersonalStake } = values

    await withToast(async () => {
      const fhContract = await ETH.fhContract()
      const tx = await fhContract.setActiveUser(account, extraTeamPerformance, extraPersonalStake)

      await tx.wait()
    }, { t })
  }
  const removeActiveUser = async (values) => {
    console.log("Form Values:", values);
    const { account } = values

    await withToast(async () => {
      const fhContract = await ETH.fhContract()
      const tx = await fhContract.removeActiveUser(account)

      await tx.wait()
    }, { t })
  }
  const processGlobalNodeDividendWindow = async () => {
    await withToast(async () => {
      const fhContract = await ETH.fhContract()
      const tx = await fhContract.processGlobalNodeDividendWindow()

      await tx.wait()
    }, { t })
  }
  const setClaimEnabled = async (enabled) => {
    await withToast(async () => {
      const ktContract = await ETH.ktContract()
      const tx = await ktContract.setClaimEnabled(enabled)

      await tx.wait()
    }, { t })
  }
  const withdrawToken = async (values) => {
    console.log("Form Values:", values);
    const { token, to, amount } = values

    await withToast(async () => {
      const ktContract = await ETH.ktContract()
      const tx = await ktContract.withdrawToken(token, to, amount)

      await tx.wait()
    }, { t })
  }

  return (
    <div className="p-3">
      <Tabs defaultActiveKey={tab}>
        <Tabs.Tab title='Token管理' key='1'>
          <Form layout="vertical" onFinish={setFeeExempt} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="设置免税地址">
              <Form.Item label="免税地址" name="account">
                <Input />
              </Form.Item>

              <Form.Item label="是否免税" name="exempt" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>
          </Form>
          <Form layout="vertical" onFinish={setBuyFees} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="设置买入税">
              <Form.Item name="eco" label="eco">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="backflow" label="backflow">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="node" label="node">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="direct" label="direct">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="indirect" label="indirect">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
          <Form layout="vertical" onFinish={setSellFees} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="设置卖出税">
              <Form.Item name="global_" label="global_">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="eco" label="eco">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="game" label="game">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
          <Form layout="vertical" onFinish={setProfitFees} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="设置盈利税">
              <Form.Item name="total" label="total">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="eco" label="eco">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="node" label="node">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="backflow" label="backflow">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="game" label="game">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="global_" label="global_">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="burn" label="burn">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
          <Form layout="vertical" onFinish={setAntiDumpTiers} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="设置防爆跌系数">
              <Form.Item name="dropBps_" label="dropBps_">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="burnBps_" label="burnBps_">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
        </Tabs.Tab>
        <Tabs.Tab title='Staking管理' key='2'>
          <Form layout="vertical" onFinish={setDailyQueueCancelLimit} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="设置 Queue 每个钱包每日取消上限">
              <Form.Item name="dropBps_" label="dropBps_">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="burnBps_" label="burnBps_">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
          <Form layout="vertical" onFinish={setStageThresholds} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="设置阶段阈值（分段条件）">
              <Form.Item name="stage1" label="stage1">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="stage2" label="stage2">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
          <Form layout="vertical" onFinish={setDailyLimitRates} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="设置每日限制比例（速率）">
              <Form.Item name="stakeLow" label="stakeLow">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="stakeMid" label="stakeMid">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="stakeHigh" label="stakeHigh">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="unstakeLow" label="unstakeLow">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="unstakeMid" label="unstakeMid">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="unstakeHigh" label="unstakeHigh">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
          <Form layout="vertical" onFinish={setRewardFeeConfig} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="设置奖励手续费配置">
              <Form.Item name="feeTotalBps" label="feeTotalBps">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="ecoBps" label="ecoBps">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="gameBps" label="gameBps">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="globalBps" label="globalBps">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="s7Bps" label="s7Bps">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="teamRewardMaxBps" label="teamRewardMaxBps">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
          <Form layout="vertical" onFinish={setRewardCbNewOrderFeeConfig} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="设置“CB新订单”的奖励手续费配置">
              <Form.Item name="ecoBpsTwo" label="ecoBpsTwo">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="directBps" label="directBps">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
          <Form layout="vertical" onFinish={setCircuitBreakerParams} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="设置熔断参数">
              <Form.Item name="dropBpsThreshold" label="dropBpsThreshold">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="recoveryDuration" label="recoveryDuration">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="unstakeRatePermille" label="unstakeRatePermille">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
          <Form layout="vertical" onFinish={adminCancelQueuedStake} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="管理员取消排队单">
              <Form.Item name="queueIndexes" label="queueIndexes">
                <Input placeholder="请输入队列索引(多个使用|线分割)" />
              </Form.Item>
            </Card>
          </Form>
          <Card title="开关" style={{marginBottom: 12}}>
            <Space block>
              <Button onClick={() => setPauseAndUnpause(true)} size="small" style={{color: '#FFF'}} color="primary">恢复</Button>
              <Button onClick={() => setPauseAndUnpause(false)} size="small" style={{color: '#FFF'}} color="danger">暂停</Button>
            </Space>
          </Card>
          <Form layout="vertical" onFinish={processStakeQueue} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="处理队列">
              <Form.Item name="maxItems" label="maxItems">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
          <Card title="更新熔断状态" style={{marginBottom: 12}}>
            <Space block>
              <Button onClick={() => updateCircuitBreaker()} size="small" style={{color: '#FFF'}} color="primary">更新</Button>
            </Space>
          </Card>
          <Form layout="vertical" onFinish={burnExpiredReward} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="销毁过期奖励">
              <Form.Item label="user" name="user">
                <Input />
              </Form.Item>
              <Form.Item name="index" label="index">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
        </Tabs.Tab>
        <Tabs.Tab title='用户体系管理' key='3'>
          <Form layout="vertical" onFinish={setExtraPerformance} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="手动补额外业绩">
              <Form.Item label="address" name="account">
                <Input />
              </Form.Item>
              <Form.Item name="extraTeamPerformance" label="extraTeamPerformance">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="extraPersonalStake" label="extraPersonalStake">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
        </Tabs.Tab>
        <Tabs.Tab title='分红管理' key='4'>
          <Form layout="vertical" onFinish={setGlobalMinProcessAmount} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="设置最小处理额">
              <Form.Item name="minProcessAmount" label="minProcessAmount">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
          <Form layout="vertical" onFinish={setActiveUser} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="设置节点">
              <Form.Item label="address" name="account">
                <Input />
              </Form.Item>
              <Form.Item name="extraTeamPerformance" label="extraTeamPerformance">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="extraPersonalStake" label="extraPersonalStake">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
          <Form layout="vertical" onFinish={removeActiveUser} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="移除节点">
              <Form.Item label="address" name="account">
                <Input />
              </Form.Item>
            </Card>
          </Form>
          <Card title="节点分红">
            <Button onClick={processGlobalNodeDividendWindow} size="small" style={{color: '#FFF'}} color="primary">执行全局节点分红</Button>
          </Card>
        </Tabs.Tab>
        <Tabs.Tab title='空投管理' key='5'>
          <Card title="开关领取" style={{marginBottom: 12}}>
            <Space block>
              <Button onClick={() => setClaimEnabled(true)} size="small" style={{color: '#FFF'}} color="primary">开启空投领取</Button>
              <Button onClick={() => setClaimEnabled(false)} size="small" style={{color: '#FFF'}} color="danger">关闭空投领取</Button>
            </Space>
          </Card>
          <Form layout="vertical" onFinish={withdrawToken} footer={
            <Button block type="submit" color="primary">
              修改
            </Button>
          }>
            <Card title="提走资产MS代币">
              <Form.Item label="token" name="Form Address">
                <Input />
              </Form.Item>
              <Form.Item label="to" name="To Address">
                <Input />
              </Form.Item>
              <Form.Item name="amount" label="amount">
                <Input type="number" />
              </Form.Item>
            </Card>
          </Form>
        </Tabs.Tab>
      </Tabs>
    </div>
  )
}

export default Admin;