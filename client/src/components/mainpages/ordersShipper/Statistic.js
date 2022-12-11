import React, { useContext, useEffect, useState } from 'react'
import Iframe from 'react-iframe'
import { GlobalState } from '../../../GlobalState'
import axios from 'axios'
import { FaBoxOpen } from 'react-icons/fa'
import { IoShirt } from 'react-icons/io5'
import * as FaIcons from "react-icons/fa"
import * as BiIcons from "react-icons/bi"
import * as MdIcons from "react-icons/md"
import * as RiIcons from "react-icons/ri"

function Statistic() {
  const state = useContext(GlobalState)
  const [products] = state.productsAPI.products
  const [token] = state.token
  const [orders, setOrders] = useState([])
  const [orderTotal, setOrderTotal] = useState(0)
  const [pickingOrders, setPickingOrders] = useState(0)
  const [pickedOrders, setPickedOrders] = useState(0)
  const [onDeliOrders, setOnDeliOrders] = useState(0)
  const [deliveredOrders, setDeliveredOrders] = useState(0)
  useEffect(() => {
    if (token) {
      const getOrder = async () => {
        const res = await axios.get(`/user/myordersshipper?sort=-updatedAt`, {
          headers: { Authorization: token }
        })
      
        setOrders(res.data)
        const data = res.data
        const data2 = res.data.filter(({ status }) => status === 'Picking up')
        const data3 = res.data.filter(({ status }) => status === 'Picked up')
        const data4 = res.data.filter(({ status }) => status === 'On Delivery')
        const data5 = res.data.filter(({ status }) => status === 'Delivered')
        setPickingOrders(data2.length)
        setPickedOrders(data3.length)
        setOnDeliOrders(data4.length)
        setDeliveredOrders(data5.length)
        setOrderTotal(data.length)
        
      }
      getOrder()
    }

  }, [token])


  return (
    <div>
      <div className='content-header'>
        <h2>Statistics</h2>
      </div>
      <div className="content-wrapper">
        <div className='chart grid-3'>
          <div className='card-total'>
            <div className='chart-item row'>
              <div>
                <span className='icon-bg primary-bg'><BiIcons.BiReceipt style={{ color: '#02688b' }}/></span>
              </div>
              <div className='card-content'>
                <h3>My orders</h3>
                <span>{orderTotal}</span>
              </div>
            </div>
          </div>
          <div className='card-total'>
            <div className='chart-item row'>
              <div>
                <span className='icon-bg success-bg'><RiIcons.RiTakeawayFill style={{ color: '#0f5132' }} /></span>
              </div>
              <div className='card-content'>
                <h3>Picking up</h3>
                <span>{pickingOrders}</span>
              </div>
            </div>
          </div>
          <div className='card-total'>
            <div className='chart-item row'>
              <div>
                <span className='icon-bg picked-bg'><FaIcons.FaTruck style={{ color: '#664d03' }} /></span>
              </div>
              <div className='card-content'>
                <h3>Picked up</h3>
                <span>{pickedOrders}</span>
              </div>
            </div>
          </div>
          <div className='card-total'>
            <div className='chart-item row'>
              <div>
                <span className='icon-bg on-shipping-bg'><FaIcons.FaShippingFast style={{ color: '#d80630' }} /></span>
              </div>
              <div className='card-content'>
                <h3>On Delivery</h3>
                <span>{onDeliOrders}</span>
              </div>
            </div>
          </div>
          <div className='card-total'>
            <div className='chart-item row'>
              <div>
                <span className='icon-bg shipped-bg'><MdIcons.MdOutlineDoneOutline style={{ color: '#068419' }} /></span>
              </div>
              <div className='card-content'>
                <h3>Delivered</h3>
                <span>{deliveredOrders}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistic