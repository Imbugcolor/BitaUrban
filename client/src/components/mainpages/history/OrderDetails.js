import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { GlobalState } from '../../../GlobalState'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faTruck, faMapLocation } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import axios from 'axios'
import moment from 'moment'

function OrderDetails() {
    const state = useContext(GlobalState)
    const [history] = state.userAPI.history
    const [token] = state.token
    const [orderDetails, setOrderDetails] = useState([])
    const [statusOrderDelivery, setStatusOrderDelivery] = useState('')
    const [orderDeliveryCode, setOrderDeliveryCode] = useState('')
    const params = useParams()
    useEffect(() => {
        if (params.id) {
            history.forEach(item => {
                if (item._id === params.id) setOrderDetails(item)
                
            })
        }
    }, [params.id, history])

    const getStatusDelivery = async () => {
        try {
            const res = await axios.post('https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail-by-client-code', {
                "client_order_code": orderDetails._id
            },
                {
                    headers: {
                        Token: 'a0c50773-7931-11ed-a83f-5a63c54f968d',
                        ShopId: '120981'
                    }
                })
            console.log(res)
            setStatusOrderDelivery(res.data.data.status)
            setOrderDeliveryCode(res.data.data.order_code)
        } catch (err) {
            toast.error(err.response.data.message)
        }
    }

    if(orderDetails.status === 'Delivering to the carrier'){
        getStatusDelivery()
    }
    const handleCancelOrder = async () => {
        if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
            try {
                await axios.patch(`/api/payment/cancel/${orderDetails._id}`, { cancel: 'Cancel' }, {
                    headers: { Authorization: token }
                })

                toast.success('Hủy đơn hàng thành công.', {
                    position: "top-center",
                    autoClose: 3000
                })

            } catch (err) {
                toast.error(err.response.data.msg, {
                    position: "top-center",
                    autoClose: 3000
                })
            }
        }
    }

    if (orderDetails.length === 0) return null;
    return (
        <div className="history-page res-row">
            <div className="order-infor-container col l-12 m-12 c-12">
                <div className="res-row">
                    <div className="order-infor col l-4 m-4 c-12">
                        <div className="thumbnail">
                            <span>
                                <FontAwesomeIcon icon={faUser} />
                            </span>
                        </div>
                        <div className="infor name">
                            <span>Người nhận: {orderDetails.address.recipient_name || orderDetails.name}</span>
                            <span>Email: {orderDetails.email}</span>
                            <span>Số điện thoại: +84 {orderDetails.phone}</span>
                        </div>
                    </div>
                    <div className="order-infor col l-4 m-4 c-12">
                        <div className="thumbnail">
                            <span>
                                <FontAwesomeIcon icon={faTruck} />
                            </span>
                        </div>
                        <div className="infor status">
                            <span>Trạng thái: {orderDetails.status}</span>
                            {
                                orderDetails.status === 'Delivering to the carrier' ? <span>/Shipper: {statusOrderDelivery?.replace(/_/g, ' ')} <a target="_blank" href={`https://tracking.ghn.dev/?order_code=${orderDeliveryCode}`} >Tracking</a></span> : null
                            }
                            <span>Phương thức thanh toán: {orderDetails.method}</span>
                        </div>
                    </div>
                    <div className="order-infor col l-4 m-4 c-12">
                        <div className="thumbnail">
                            <span>
                                <FontAwesomeIcon icon={faMapLocation} />
                            </span>
                        </div>
                        <div className="infor address">
                            <span>
                                Địa chỉ nhận hàng:
                                {
                                    orderDetails.method === 'Paypal' ? ` ${orderDetails.address.address_line_1}, ${orderDetails.address.admin_area_2}` :
                                        ` ${(orderDetails.address.detailAddress || '')} ${orderDetails.address.ward.label}, ${orderDetails.address.district.label}, ${orderDetails.address.city.label}`
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="order-detail col l-12 m-12 c-12">
                <div className="res-row">
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Sản phẩm</th>
                                <th>Size - Màu</th>
                                <th>Số lượng</th>
                                <th>Tổng cộng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                orderDetails.cart.map(item => {
                                    if (item.quantity > 0) {
                                        const thumbnail = item.images[0].url
                                        return (
                                            <tr key={item._id}>
                                                <td><img src={thumbnail} alt="" /></td>
                                                <td>{item.title}</td>
                                                <td className="size-color-td">
                                                    <span>{item.size} - </span>
                                                    <div style={{ backgroundColor: `${item.color}` }}></div>
                                                </td>
                                                <td>{item.quantity}</td>
                                                <td>${item.price * item.quantity}</td>
                                            </tr>)
                                    } else return null
                                })
                            }
                        </tbody>
                    </table>
                    <div className='pay-infor-wrapper col l-5 m-5 c-12'>
                        <div className="pay-infor">

                            <div className="item fw600">
                                <div>Mã đơn</div>
                                <div style={{ textTransform: 'uppercase', wordBreak: 'break-word' }}>{orderDetails._id}</div>
                            </div>
                            <div className="item fw600">
                                <div>Ngày đặt</div>
                                <div>{new Date(orderDetails.createdAt).toLocaleDateString()} {moment(orderDetails.createdAt).format('LT')}</div>
                            </div>
                            <div className="divider"></div>
                            <div className="item">
                                <div>Tổng cộng</div>
                                <div>${orderDetails.total}</div>
                            </div>
                            <div className="item">
                                <div>Phí vận chuyển</div>
                                <div>$0</div>
                            </div>
                            <div className="item">
                                <div>Phương thức thanh toán</div>
                                <div>{orderDetails.method}</div>
                            </div>
                            {
                                orderDetails.method === 'Paypal' ?
                                    <div className="item">
                                        <div>Mã thanh toán</div>
                                        <div>{orderDetails.paymentID}</div>
                                    </div>
                                    : ''
                            }
                            <div className="divider"></div>
                            <div className="item fw600">
                                <div>Tổng thanh toán</div>
                                <div style={{ color: 'crimson' }}>${orderDetails.total}</div>
                            </div>
                            <div className="item fw600">
                                <div>Thời gian thanh toán</div>
                                <div>
                                    {orderDetails.method === 'Paypal' ?
                                        `Đã thanh toán vào ${new Date(orderDetails.createdAt).toLocaleDateString() + ' ' + moment(orderDetails.createdAt).format('LT')}`
                                        : 'Chưa thanh toán'
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            orderDetails.status === 'Completed' ? 
                            <div className='complete-order-noti'>
                                <button disabled>Đã hoàn thành</button>
                            </div> :   
                            orderDetails.status !== 'Pending' || orderDetails.status === 'Processing' ||orderDetails.status === 'Packaged' ?                    
                            <div className='cancel-order-disabled'>
                                <button onClick={handleCancelOrder} className='disabled-btn' disabled>Hủy đơn hàng</button>
                            </div> :
                            <div className='cancel-order'>
                                <button onClick={handleCancelOrder} >Hủy đơn hàng</button>
                            </div> 
                        }
                    </div>
                </div>
            </div>

        </div>
    )
}

export default OrderDetails