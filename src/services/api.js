import request from './request';

export const fetchBuy = (params) => {
  return request.post(`/buy`, params)
}

export const fetchWithdrawDeposit = (params) => {
  return request.post(`/withdraw`, params)
}

export const fetchAmountTo = (params) => {
  return request.post(`/amount_to`, params)
}

export const fetchExchange = (params) => {
  return request.post(`/exchange`, params)
}

export const fetchAmountToCard = (params) => {
  return request.post(`/amount_to_card`, params)
}

export const fetchSetVip = (params) => {
  return request.post(`/set_vip`, params)
}

export const fetchOpenCardTwo = (params) => {
  return request.post(`/open_card_two`, params)
}

export const fetchOpenCard = (params) => {
  return request.post(`/open_card`, params)
}

export const fetchLogList = (params) => {
  return request.get(`/record_list`, {
    params
  })
}

export const fetchRewardList = (params) => {
  return request.get(`/reward_list`, {
    params
  })
}

export const fetchRecommendList = (params) => {
  return request.get(`/recommend_list`, {
    params
  })
}

export const fetchOrderList = (params) => {
  return request.get(`/order_list_new`, {
    params
  })
}

export const fetchCardInfo = (params) => {
  return request.post(`/look_card`, params)
}

export const fetchNonce = (params) => {
  return request.post(`/create_nonce`, params)
}

export const fetchLookCard = (params) => {
  return request.post(`/look_card_new`, params)
}

export const fetchChangeCard = (params) => {
  return request.post(`/change_card`, params)
}

export const fetchCodeList = (params) => {
  return request.get(`/code_list`, {
    params
  })
}

export const fetchResetPassword = (params) => {
  return request.post(`/change_pin`, params)
}

export const fetchActivateCard = (params) => {
  return request.post(`/check_card`, params)
}