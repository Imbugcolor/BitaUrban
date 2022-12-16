import React, { useState, useEffect } from 'react'
import * as FaIcons from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'
import './deliveryOrd.css'

function DetailDeliveryOrdModal({ order, callback, setCallback, token }) {
    const [inforOrderDelivery, setInforOrderDelivery] = useState('')

    const handleCloseView = (e) => {
        e.preventDefault()
        const viewbox = document.querySelector('.detail-delivery-box')
        viewbox.classList.remove('active')
    }

    useEffect(() => {
        const detailDeliveryOrd = async () => {
            try {
                const res = await axios.post('https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail-by-client-code', {
                    "client_order_code": order._id
                },
                    {
                        headers: {
                            Token: 'a0c50773-7931-11ed-a83f-5a63c54f968d',
                            ShopId: '120981'
                        }
                    })
                console.log(res)
                setInforOrderDelivery(res.data.data)
            } catch (err) {
                console.log(err.response.data.message)
            }
        }
        detailDeliveryOrd()

    }, [order])

    const handleCancelDeliveryOrder = async () => {
        try {
            await axios.post('https://dev-online-gateway.ghn.vn/shiip/public-api/v2/switch-status/cancel', { order_codes: [`${order.order_delivery_code}`] }, {
                headers: {
                    Token: 'a0c50773-7931-11ed-a83f-5a63c54f968d',
                    ShopId: '120981'
                }
            })

            await axios.put(`/api/payment/deliverytocarrier/${order._id}/`, { status: 'Packaged', order_delivery_code: '', shipping_fee: '' }, {
                headers: { Authorization: token }
            })

            toast.success('Order is canceled delivery to carrier')

            setCallback(!callback)
            
            const viewbox = document.querySelector('.detail-delivery-box')
            viewbox.classList.remove('active')


        } catch (err) {
            console.log(err.response.data.message)
        }
    }
    const handleCompleteOrder = async () => {
        try {

            await axios.put(`/api/payment/changestatus/${order._id}/`, { status: 'Completed' }, {
                headers: { Authorization: token }
            })

            toast.success('Order is delivering to the carrier')
            
            setCallback(!callback)

            const viewbox = document.querySelector('.detail-delivery-box')
            viewbox.classList.remove('active')
            
        } catch (err) {
            alert(err.response.data.msg)
        }
    }

    return (
        <div className="view-detail-user-modal">
            <section className="delivery-order-detail">

                <div className="delivery-order-detail-wrapper">
                    <div className="infor-order">
                        <h2 className="infor-order_title">Information Order</h2>
                        <div className="table-row">
                            <div className="label">Order code:</div>
                            <div className="value">{inforOrderDelivery.order_code}</div>
                        </div>
                        <div className="table-row">
                            <div className="label">Pickup time:</div>
                            <div className="value">{new Date(inforOrderDelivery.pickup_time).toLocaleDateString()}</div>
                        </div>
                        <div className="table-row">
                            <div className="label">Expected delivery time:</div>
                            <div className="value">{new Date(inforOrderDelivery.leadtime).toLocaleDateString()}</div>
                        </div>
                        <div className="table-row">
                            <div className="label">Status:</div>
                            <div className="value status">{inforOrderDelivery.status?.replace(/_/g, ' ')}</div>
                        </div>
                    </div>

                    <div className="detail-infor">
                        <h2 className="infor-order_title">Detail</h2>
                        <div className="table-row">
                            <div className="label">Products:</div>
                            <div className="value">{inforOrderDelivery.content}</div>
                        </div>
                        <div className="table-row">
                            <div className="label">Required note:</div>
                            <div className="value">
                                {
                                    inforOrderDelivery.required_note === 'CHOTHUHANG' ? 'Allowed to check and trial' :
                                        inforOrderDelivery.required_note === 'CHOXEMHANGKHONGTHU' ? 'Allowed to check and but not trial' :
                                            'Not allowed to check'
                                }
                            </div>
                        </div>

                    </div>

                    <div className="recipient">
                        <h2 className="infor-order_title">Recipient</h2>
                        <div className="table-row">
                            <div className="label">Name:</div>
                            <div className="value">{inforOrderDelivery.to_name}</div>
                        </div>
                        <div className="table-row">
                            <div className="label">Phone:</div>
                            <div className="value">{inforOrderDelivery.to_phone}</div>
                        </div>
                        <div className="table-row">
                            <div className="label">Address:</div>
                            <div className="value">{inforOrderDelivery.to_address}</div>
                        </div>
                    </div>

                    <div className="shipping-fee">
                        <h2 className="infor-order_title">Shipping fee</h2>
                        <div className="table-row">
                            <div className="label">Total Fee:</div>
                            <div className="value">
                                {
                                    order.shipping_fee ? order.shipping_fee.toLocaleString('it-IT', { style: 'currency', currency: 'VND' }) :
                                        null
                                }
                            </div>
                            <div className="label">Payer:</div>
                            <div className="value">
                                {
                                    inforOrderDelivery.payment_type_id === 1 ? 'Shop paid shipping fee' :
                                        'Recipient pay shipping fee'
                                }
                            </div>
                        </div>

                    </div>
                </div>
                <div className="btns-wrapper">
                    {
                        order.status === 'Delivering to the carrier' && inforOrderDelivery.status === 'delivered' ?
                            null :
                            order.status === 'Pending' || order.status === 'Processing' || order.status === 'Packaged' || order.status === 'Completed' || order.status === 'Cancel' ?
                                <button className="return-order-disabled-btn disabled-btn" disabled>
                                    Return order
                                </button> :
                                <button className="return-order-btn">
                                    Return order
                                </button>

                    }
                    {
                        order.status === 'Delivering to the carrier' && inforOrderDelivery.status === 'delivered' ?
                            <button className="cancel-order-btn" onClick={handleCompleteOrder}>
                                Completed
                            </button> :
                            order.status === 'Pending' || order.status === 'Processing' || order.status === 'Packaged' || order.status === 'Completed' || order.status === 'Cancel' ?
                                <button className="cancel-order-disabled-btn disabled-btn" disabled>
                                    Cancel order
                                </button> :
                                <button className="cancel-order-btn" onClick={handleCancelDeliveryOrder}>
                                    Cancel order
                                </button>

                    }
                    <div className="btn-tracking">
                        <a target="_blank" href={`https://tracking.ghn.dev/?order_code=${inforOrderDelivery.order_code}`} >Tracking this order</a>
                    </div>
                </div>


                <div className="view-close" onClick={handleCloseView}>
                    <FaIcons.FaRegTimesCircle style={{ color: 'crimson' }} />
                </div>
            </section>
        </div>
    )
}

export default DetailDeliveryOrdModal
