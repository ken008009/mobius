import React, {useState, useEffect} from 'react'
import { fetchRewardList } from '@services/api'
import { Pagination } from 'react-vant';

const EarningsList = (props) => {
  const [list, setList] = useState([])
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getList()
  }, [page])

  const getList = () => {
    fetchRewardList({
      page,
      reqType: 6
    }).then(res => {
      setTotal(res.count)
      setList(res.list)
    })
  }

  return (
    <>
      <div className="earnings-list">
        {
          list.map((item, index) => (
            <div className="earnings-item" key={index}>
              <div className="earnings-item-left">
                <p>{props.formatAddress(item.address)}</p>
                <p>{item.createdAt}</p>
              </div>
              <div className="earnings-item-amount">{item.amount} USD</div>
            </div>
          ))
        }
      </div>
      {
        list.length / 20 > 1 && <Pagination value={page} mode="simple" onChange={setPage} pageCount={Math.ceil(total / 20)} />
      }
    </>
  )
}

export default EarningsList;