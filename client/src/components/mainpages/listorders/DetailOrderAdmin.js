import axios from 'axios'
import React, { useState, useEffect, useContext, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { GlobalState } from '../../../GlobalState'
import { toast } from 'react-toastify'
import LocationForm from '../utils/address/LocationForm'
import { FaEdit } from 'react-icons/fa'
import ChangePhoneModal from '../utils/modal/ChangePhoneModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import DetailDeliveryOrdModal from '../utils/modal/DetailDeliveryOrdModal'
import moment from 'moment'

const initOrderDelivery = {
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    service_type_id: 1,
    payment_type_id: 1,
    required_note: 'KHONGCHOXEMHANG',
    note: ''
}

function DetailOrderAdmin() {
    const params = useParams()
    const state = useContext(GlobalState)
    const [orders] = state.ordersAPI.orders
    const [token] = state.token
    const [detailOrder, setDetailOrder] = useState([])
    const [statusOrder, setStatusOrder] = useState('')
    const [callback, setCallback] = state.ordersAPI.callback
    const [loading, setLoading] = useState(false)
    const [address, setAddress] = useState('')
    const addressRef = useRef()
    const [currentPhone, setCurrentPhone] = useState(false)
    const [currentOrder, setCurrentOrder] = useState(false)
    const [orderDelivery, setOrderDelivery] = useState(initOrderDelivery)
    const [shipFee, setShipFee] = useState(0)

    useEffect(() => {
        if (params.id) {
            orders.forEach(order => {
                if (order._id === params.id) {
                    setDetailOrder(order)
                    setStatusOrder(order.status)
                    setAddress(order.address || '')
                }
            })
        }
    }, [params.id, orders])


    const handleChangeSatus = (e) => {
        setStatusOrder(e.target.value)
    }

    const HandleSubmitChangeStatus = async () => {
        try {
            if (!detailOrder.isPaid && statusOrder === 'Completed') {
                await axios.put(`/api/payment/changestatus/${detailOrder._id}/`, { isPaid: true, status: statusOrder }, {
                    headers: { Authorization: token }
                })
                toast.success('Order is completed')
                setCallback(!callback)
                return;
            }
            await axios.patch(`/api/payment/changestatus/${detailOrder._id}/`, { status: statusOrder }, {
                headers: { Authorization: token }
            })

            toast.success('Order status is changed')

            setCallback(!callback)
        } catch (err) {
            alert(err.response.data.msg)
        }
    }

    const handleChangeAddress = () => {
        addressRef.current.classList.add('active')
    }

    const HandleSubmitAddress = async (address) => {
        try {
            await axios.patch(`/api/payment/changeaddress/${detailOrder._id}`, { address }, {
                headers: { Authorization: token }
            })

            toast.success('Order address is changed')

            setCallback(!callback)
        } catch (err) {
            toast.error(err.response.data.msg)
        }
    }

    const handleChangePhone = (phone) => {
        const viewbox = document.querySelector('.order-phone-change-box')
        viewbox.classList.toggle('active')
        setCurrentPhone(phone)
    }

    const handleViewDeliveryOrd = (order) => {
        const viewbox = document.querySelector('.detail-delivery-box')
        viewbox.classList.toggle('active')
        setCurrentOrder(order)
    }

    const handleOnChangeOrderDelivery = (e) => {
        const { name, value } = e.target
        setOrderDelivery({ ...orderDelivery, [name]: value })
    }
    
    const checkShipFee = async (e) => {
        try {
  
            const date = new Date();
            date.setDate(date.getDate() + 1)
            const pick_date = Math.floor(date.getTime() / 1000);
            const products = []
            detailOrder.cart.map((item) => {
                if (item.quantity > 0) {
                    const { title, quantity } = item
                    products.push({ name: title, quantity })
                }
            })
            const totalPrice = detailOrder.total.toFixed(0) * 23575

            const res = await axios.post('https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/preview', {
                "from_name": "Bita Urban",
                "from_phone": "0909999999",
                "from_address": "71/9 Nguyễn Văn Thương",
                "from_ward_name": "Phường 25",
                "from_district_name": "Quận Bình Thạnh",
                "from_province_name": "TP Hồ Chí Minh",
                "return_name": "Bita Urban",
                "return_phone": "0909999999",
                "return_address": "71/9 Nguyễn Văn Thương",
                "return_ward_name": "Phường 25",
                "return_district_name": "Quận Bình Thạnh",
                "return_province_name": "TP Hồ Chí Minh",
                "client_order_code": detailOrder._id,
                "to_name": detailOrder.name,
                "to_phone": detailOrder.phone,
                "to_address": detailOrder.address?.address_line_1 ? detailOrder.address?.address_line_1 : detailOrder.address?.detailAddress,
                "to_ward_name": detailOrder.address?.address_line_1 ? detailOrder.address?.address_line_1 : detailOrder.address?.ward?.label,
                "to_district_name": detailOrder.address?.address_line_1 ? detailOrder.address?.address_line_1 : detailOrder.address?.district?.label,
                "to_province_name": detailOrder.address?.address_line_1 ? detailOrder.address?.admin_area_2 : detailOrder.address?.city?.label,
                "cod_amount": detailOrder.method === 'Paypal' ? 0 : totalPrice,
                "content": "Thời trang",
                ...orderDelivery,
                'service_type_id': parseInt(orderDelivery.service_type_id),
                'payment_type_id': parseInt(orderDelivery.payment_type_id),
                'weight': parseInt(orderDelivery.weight),
                'length': parseInt(orderDelivery.length),
                'width': parseInt(orderDelivery.width),
                'height': parseInt(orderDelivery.height),
                "pick_station_id": 1444,
                "deliver_station_id": null,
                "insurance_value": 3000000,
                "coupon": null,
                "pick_shift": null,
                "pickup_time": pick_date,
                "items": products
            },
                {
                    headers: {
                        Token: 'a0c50773-7931-11ed-a83f-5a63c54f968d',
                        ShopId: '120981'
                    }
                })
            setShipFee(res.data.data.total_fee)
            console.log(res.data)
        } catch (err) {
            toast.error(err.response.data.message)
        }
    }
    const handleDeliveryToCarrier = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const date = new Date();
            date.setDate(date.getDate() + 1)
            const pick_date = Math.floor(date.getTime() / 1000);
            const products = []
            detailOrder.cart.map((item) => {
                if (item.quantity > 0) {
                    const { title, quantity } = item
                    products.push({ name: title, quantity })
                }
            })
            const totalPrice = detailOrder.total.toFixed(0) * 23575

            const res = await axios.post('https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create', {
                "from_name": "Bita Urban",
                "from_phone": "0909999999",
                "from_address": "71/9 Nguyễn Văn Thương",
                "from_ward_name": "Phường 25",
                "from_district_name": "Quận Bình Thạnh",
                "from_province_name": "TP Hồ Chí Minh",
                "return_name": "Bita Urban",
                "return_phone": "0909999999",
                "return_address": "71/9 Nguyễn Văn Thương",
                "return_ward_name": "Phường 25",
                "return_district_name": "Quận Bình Thạnh",
                "return_province_name": "TP Hồ Chí Minh",
                "client_order_code": detailOrder._id,
                "to_name": detailOrder.name,
                "to_phone": detailOrder.phone,
                "to_address": detailOrder.address?.address_line_1 ? detailOrder.address?.address_line_1 : detailOrder.address?.detailAddress,
                "to_ward_name": detailOrder.address?.address_line_1 ? detailOrder.address?.address_line_1 : detailOrder.address?.ward?.label,
                "to_district_name": detailOrder.address?.address_line_1 ? detailOrder.address?.address_line_1 : detailOrder.address?.district?.label,
                "to_province_name": detailOrder.address?.address_line_1 ? detailOrder.address?.admin_area_2 : detailOrder.address?.city?.label,
                "cod_amount": detailOrder.method === 'Paypal' ? 0 : totalPrice,
                "content": "Thời trang",
                ...orderDelivery,
                'service_type_id': parseInt(orderDelivery.service_type_id),
                'payment_type_id': parseInt(orderDelivery.payment_type_id),
                'weight': parseInt(orderDelivery.weight),
                'length': parseInt(orderDelivery.length),
                'width': parseInt(orderDelivery.width),
                'height': parseInt(orderDelivery.height),
                "pick_station_id": 1444,
                "deliver_station_id": null,
                "insurance_value": 3000000,
                "service_id": 0,
                "coupon": null,
                "pick_shift": null,
                "pickup_time": pick_date,
                "items": products
            },
                {
                    headers: {
                        Token: 'a0c50773-7931-11ed-a83f-5a63c54f968d',
                        ShopId: '120981'
                    }
                })
     
            await axios.put(`/api/payment/deliverytocarrier/${detailOrder._id}/`, { status: 'Delivering to the carrier', order_delivery_code: res.data.data.order_code, shipping_fee: res.data.data.total_fee}, {
                headers: { Authorization: token }
            })
            setLoading(false)

            toast.success('Order is delivering to the carrier')

            setCallback(!callback)
        } catch (err) {
            toast.error(err.response.data.message)
        }
    }

    const handleCompletedOrder = async () => {
        try {

            await axios.patch(`/api/payment/changestatus/${detailOrder._id}/`, { status: 'Completed' }, {
                headers: { Authorization: token }
            })

            toast.success('Order is completed')

            setCallback(!callback)
        } catch (err) {
            alert(err.response.data.msg)
        }
    }
 
    return (
        <div>
            <div className='content-header'>
                <h2>Order detail</h2>
            </div>
            <div className='content-body'>
                <div className='order-detail-wrapper'>
                    <div className='order-detail-header'>
                        <div className='order-id-status'>
                            <h1>ORDER</h1>
                            <p>STATUS: <span>{detailOrder.status}</span></p>
                            <p>PAID: <span>{detailOrder.isPaid ? 'Paid' : 'Unpaid'}</span></p>
                        </div>
                        {
                            detailOrder.status === 'Picking up' || detailOrder.status === 'Picked up'
                                || detailOrder.status === 'On Delivery' ?
                                <div>
                                    <span>The shipping side is processing</span>
                                </div> : detailOrder.status === 'Delivering to the carrier' ?
                                    <button
                                        onClick={() => handleViewDeliveryOrd(detailOrder)}
                                        className='view-delivery-order-btn' >
                                        View detail order delivery
                                    </button> : detailOrder.status === 'Delivered' ?

                                        <button className='btn-completed-admin' onClick={handleCompletedOrder}>Completed</button> : detailOrder.status === 'Completed' ?
                                            <div>
                                                <span>The order is completed!</span>
                                            </div> : detailOrder.status === 'Cancel' ? <span>The order is canceled!</span> :
                                                <div className='change-order-status'>
                                                    <span>Change Status: </span>
                                                    <select name="status" value={statusOrder} onChange={handleChangeSatus}>

                                                        <option value="Pending">
                                                            Pending
                                                        </option>

                                                        <option value="Processing">
                                                            Processing
                                                        </option>

                                                        <option value="Packaged">
                                                            Packaged
                                                        </option>

                                                    </select>

                                                    <button className='save-status' onClick={HandleSubmitChangeStatus}>Save</button>
                                                </div>
                        }

                        <div className='order-name-address'>
                            <h1>{detailOrder.name}</h1>
                            <p>{detailOrder.address?.address_line_1 ? ` ${detailOrder.address?.address_line_1}, ${detailOrder.address?.admin_area_2}` :
                                ` ${(detailOrder.address?.detailAddress || '')} ${detailOrder.address?.ward?.label}, 
                            ${detailOrder.address?.district?.label}, ${detailOrder.address?.city?.label}`}
                            </p>
                            <a href="#!"
                                onClick={handleChangeAddress}>
                                <FaEdit style={{ color: '#9e9e9e', cursor: 'pointer' }} />
                            </a>
                            <div className="address-form text-start" ref={addressRef}>
                                <LocationForm element={"address-form"} onSave={(address) => HandleSubmitAddress(address)} initAddress={detailOrder.address?.city ? detailOrder.address : ''} />
                            </div>
                        </div>
                    </div>
                    <div className='order-detail-body'>
                        <div className='date-order'>
                            <label>CREATE DATE</label>
                            <p>{new Date(detailOrder.createdAt).toLocaleDateString()}</p>
                            <span>{moment(detailOrder.createdAt).format('LT')}</span>
                        </div>
                        <div className='date-order'>
                            <label>LAST UPDATED AT:</label>
                            <p>{new Date(detailOrder.updatedAt).toLocaleDateString()}</p>
                            <span>{moment(detailOrder.updatedAt).format('LT')}</span>
                        </div>
                        <div className='id-order'>
                            <label>ORDER ID</label>
                            <p style={{ textTransform: 'uppercase' }}>{detailOrder._id}</p>
                        </div>
                        <div className='phone-number-order'>
                            <label>PHONE NUMBER</label>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p>+84 {detailOrder.phone ? detailOrder.phone : 'NO'}</p>
                                <a href="#!" onClick={() => handleChangePhone(detailOrder)}>
                                    <FaEdit style={{ color: '#9e9e9e', cursor: 'pointer' }} />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className='list-product-order'>
                        <table className="oder-product-list-table">
                            <thead className="table-header">
                                <tr>
                                    <th>SR.</th>
                                    <th>PRODUCT</th>
                                    <th>TYPE</th>
                                    <th>QUANTITY</th>
                                    <th>ITEM PRICE</th>
                                    <th>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {
                                    detailOrder.cart?.map((item, index) => {
                                        if (item.quantity > 0) {
                                            return (
                                                <tr key={item._id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <div className='table-product-column'>
                                                            <img className='table-thumbnail-product' src={item.images[0].url} alt='hinh'></img>
                                                            <span>{item.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className='table-product-column'>
                                                        <span>{item.size} - </span>
                                                        <div style={{ backgroundColor: `${item.color}`, width: '15px', height: '15px', border: '1px solid #ccc' }}></div>
                                                    </td>
                                                    <td className='table-quantity'>{item.quantity}</td>
                                                    <td className='table-item-price'>${item.price}</td>
                                                    <td className='table-amount'>${item.quantity * item.price}</td>
                                                </tr>
                                            )
                                        } else return null
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className='payment-detail-order'>
                        <div className='method'>
                            <label>PAYMENT METHOD</label>
                            <p>{detailOrder.method}</p>
                            {detailOrder.paymentID ? <p>PAYMENT ID: {detailOrder.paymentID}</p> : ''}
                        </div>
                        <div className='shipping-cost'>
                            <label>SHIPPING COST</label>
                            <p>$ 0</p>
                        </div>
                        <div className='discount'>
                            <label>DISCOUNT</label>
                            <p>$ 0</p>
                        </div>
                        <div className='total-amount'>
                            <label>TOTAL AMOUNT</label>
                            <p>${detailOrder.total}</p>
                        </div>
                    </div>
                    {
                        detailOrder.status === 'Packaged' ?
                        <form onSubmit={handleDeliveryToCarrier}>
                        <div className='packaged-detail-order'>
                            <h3>Packaged Detail</h3>
                            <div className='payment-detail-order'>
                                <div>
                                    <label>Weight (gram)</label>
                                    <input type='number' name="weight" value={orderDelivery.weight} onChange={handleOnChangeOrderDelivery} required/>
                                </div>
                                <div>
                                    <label>Length (cm)</label>
                                    <input type='number' name="length" value={orderDelivery.length} onChange={handleOnChangeOrderDelivery} required/>
                                </div>
                                <div>
                                    <label>Width (cm)</label>
                                    <input type='number' name="width" value={orderDelivery.width} onChange={handleOnChangeOrderDelivery} required/>
                                </div>
                                <div>
                                    <label>Height (cm)</label>
                                    <input type='number' name="height" value={orderDelivery.height} onChange={handleOnChangeOrderDelivery} required/>
                                </div>
                            </div>
                        </div>
                        <div className='service-detail-order'>
                            <h3>Service</h3>
                            <div className='payment-detail-order'>
                                <div className='method'>
                                    <label style={{paddingRight: '10px'}}>Service Type</label>
                                    <select name='service_type_id' value={orderDelivery.service_type_id} onChange={handleOnChangeOrderDelivery}>
                                        <option value='1'> Fast </option>
                                        <option value='2'> E-commerce delivery</option>
                                    </select>

                                </div>
                                <div className='shipping-cost'>
                                    <label style={{paddingRight: '10px'}}>Payment Type</label>
                                    <select name='payment_type_id' value={orderDelivery.payment_type_id} onChange={handleOnChangeOrderDelivery}>
                                        <option value='1'> Sender </option>
                                        <option value='2'> Receiver</option>
                                    </select>
                                </div>
                                <span onClick={checkShipFee} className="check-shipping-fee-btn">Check Ship Fee</span>
                                {
                                    shipFee !== 0 ? <span>{shipFee.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})}</span> : null
                                }
                            </div>
                        </div>
                        <div className='note-detail-order'>
                            <h3>Note</h3>
                            <div className='payment-detail-order'>
                                <div className='method'>
                                    <label style={{paddingRight: '10px'}}>Delivery note</label>
                                    <select name='required_note' value={orderDelivery.required_note} onChange={handleOnChangeOrderDelivery}>
                                        <option value='KHONGCHOXEMHANG'> Not allowed to check </option>
                                        <option value='CHOXEMHANGKHONGTHU'> Allowed to check without trying</option>
                                        <option value='CHOTHUHANG'> Allowed to Try</option>
                                    </select>
                                </div>

                                <div className='shipper-note'>
                                    <label style={{paddingRight: '10px'}}>Notes to the shipper</label>
                                    <textarea name='note' value={orderDelivery.note} onChange={handleOnChangeOrderDelivery}></textarea>
                                </div>
                            </div>
                        </div>              
                        
                        <button  type='submit' className='delivery-carrier-btn'>{loading ? <FontAwesomeIcon icon={faSpinner} className="fa-spin" style={{ color: '#9e9e9e' }} /> : 'Delivery to the carrier'}</button>
                               
                        </form> : <button className='delivery-carrier-btn disabled-btn' disabled>Delivery to the carrier</button>
                    }
                    
                 
                </div>
                <div className="order-phone-change-box">
                    {currentPhone && <ChangePhoneModal phoneOrder={currentPhone} callback={callback} setCallback={setCallback} token={token} />}
                </div>
                <div className="detail-delivery-box">
                    {currentOrder && <DetailDeliveryOrdModal order={detailOrder} callback={callback} setCallback={setCallback} token={token} />}
                </div>
            </div>
        </div>
    )
}

export default DetailOrderAdmin
