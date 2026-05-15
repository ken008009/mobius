import { useState, useEffect, useReducer } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import withNavigate from './router/withNavigate'
import StoreContext from '@store/context';
import { reducer, initialState } from '@store/reducer';
import { ETH } from '@tools/contract'
import routes from './router/index'

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    getUserOverview()
    // getGlobalOverview()
  }, [])

  const getNumber = (number, digits = 2) => {
    if (digits === 0) {
      return Number(ETH.formatUnits(number)).toLocaleString('en-US', {
        maximumFractionDigits: 0
      });
    }
    console.log(ETH.formatUnits(number))
    return Number(ETH.formatUnits(number)).toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  const getUserOverview = async () => {
    console.log(ETH.account)
    if (ETH.account !== localStorage.getItem('address')) {
      return
    }

    dispatch({
      type: 'SET_DATA',
      payload: {
        address: ETH.account
      }
    })
  }

  const getGlobalOverview = async () => {
    await ETH.getAccount();
    const res = await ETH.getGlobalOverview()

    const { poolUReserve, poolBReserve, priceE18, stakeQueueHead, priceA, totalStakedU, queuedOrders, globalPendingU, globalPendingB, burnedToDead } = res

    dispatch({
      type: 'SET_DATA',
      payload: {
        poolUReserve: getNumber(poolUReserve),
        poolBReserve: getNumber(poolBReserve),
        priceE18: getNumber(priceE18),
        priceA: getNumber(priceA),
        totalStakedU: getNumber(totalStakedU),
        queuedOrders: queuedOrders.toString(),
        globalPendingU: getNumber(globalPendingU),
        globalPendingB: getNumber(globalPendingB),
        burnedToDead: getNumber(burnedToDead),
        stakeQueueHead: stakeQueueHead.toString(),
      }
    })
  }

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      <Router>
        <Routes>
          {routes.map((route, index) => {
            const RouteComponent = withNavigate(route.element)

            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <RouteComponent
                    {...route}
                  />
                }
              />
            )
          })}
        </Routes>
      </Router>
    </StoreContext.Provider>
  )
}

export default App
