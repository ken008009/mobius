---
description: 国际化 (i18n) 规则 - 仅国际化用户界面文本
---

# 国际化规则

在处理国际化时，遵循以下规则：

## ✅ 需要国际化的内容

- 用户界面显示的文本（按钮、标签、标题、提示等）
- Toast 消息和用户提示
- 表单占位符和验证消息
- 弹窗标题和内容
- 错误提示（面向用户的）

## ❌ 不要国际化的内容

- `console.log` 日志输出
- `console.error` 错误日志
- `console.warn` 警告日志
- 分析和追踪代码
- RPC 方法名称
- 智能合约方法调用
- API 字段名和参数
- 技术性的调试信息
- 代码注释（保持中文）

## 示例

### ✅ 正确的做法

```jsx
// 用户界面文本 - 使用 t() 函数
<Button>{t('Confirm')}</Button>
<p className="title">{t('Input Team Address')}</p>

Toast.show({
  content: t('Please enter the Team address')
})

// 技术日志 - 不使用 t()
console.log('📡 正在调用 ETH.bind()...')
console.error('绑定失败:', error)

// 合约调用 - 不使用 t()
await ETH.bind(address)
await contract.stake(amount, plan)
```

### ❌ 错误的做法

```jsx
// ❌ 不要国际化日志
console.log(t('Calling contract method'))

// ❌ 不要国际化合约方法
await contract[t('stake')](amount)

// ❌ 不要国际化 API 字段
const data = {
  [t('amount')]: value
}
```

## 实施步骤

1. 检查所有用户可见的文本
2. 确保使用 `t()` 函数包裹
3. 保持技术日志为原始文本（中文或英文）
4. 不要修改合约方法名、API 字段名
5. 代码注释保持中文，便于团队理解

## 注意事项

- 国际化键值应该语义化，如 `t('Confirm')` 而不是 `t('btn1')`
- 如果文本包含变量，使用模板字符串：`t('Minimum amount is {{amount}} USDT', { amount: minAmount })`
- 确保所有国际化的键都在 i18n 配置文件中定义
