import React, { useContext, useEffect, useState } from 'react'
import { GlobalState } from '../../../GlobalState'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ReactPaginate from 'react-paginate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import * as FaIcons from 'react-icons/fa'
import * as BsIcons from 'react-icons/bs'
import moment from 'moment'
function OrderHistory() {

    const state = useContext(GlobalState)
    const [history, setHistory] = state.userAPI.history
    const [data, setData] = useState([])
    const [token] = state.token
    const [sort, setSort] = useState('')
    const [status, setStatus] = useState('')
    const [searchPhrase, setSearchPhrase] = useState('')
    const [currentItems, setCurrentItems] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 6;
    // const [search, setSearch] = useState('')

    useEffect(() => {
        if (token) {
            const getHistory = async () => {
                const res = await axios.get(`/user/history?${status}&${sort}`, {
                    headers: { Authorization: token }
                })
                setHistory(res.data);
                setData(res.data)          
            }
            getHistory()
        }
    }, [token, setHistory, sort, status]);

    const search = (e) => {
        const matchedUsers = data.filter((order) => {
            return order._id.toString().toLowerCase().includes(e.target.value.toLowerCase())||
            ((order.name || order.address.recipient_name).toLowerCase().includes(e.target.value.toLowerCase())) ||
            order.email?.toLowerCase().includes(e.target.value.toLowerCase()) || order.phone?.includes(e.target.value.toLowerCase())
        })

        setHistory(matchedUsers)
        setSearchPhrase(e.target.value)
    }

    const handleStatus = (e) => {
        setStatus(e.target.value)
        setSearchPhrase('')
    }

    useEffect(() => {
        const endOffset = itemOffset + itemsPerPage;
        setCurrentItems(history.slice(itemOffset, endOffset));
        setPageCount(Math.ceil(history.length / itemsPerPage));
    }, [itemOffset, itemsPerPage, history])

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % history.length;
        setItemOffset(newOffset);
    };

    return (
        <div className="history-page">
            <h2>L???ch s??? mua h??ng</h2>
            <h4>B???n ???? ?????t {history.length} ????n h??ng</h4>
            <div className="order-filter-client-wrapper">
                <div className='order-search-client'>
                    <input className="search-order-input" value={searchPhrase} type="text" placeholder="T??m ki???m b???ng m?? ????n/t??n/email/S??t"
                    onChange={search}/>
                </div>

                <div className="order-status-client">
                    <span>Tr???ng th??i: </span>
                    <select name="status" value={status} onChange={handleStatus}>
                        <option value="">T???t c??? ????n h??ng</option>
                    
                        <option value="status=Pending">
                            ??ang ch???
                        </option>

                        <option value="status=Processing">
                            ??ang x??? l??
                        </option>

                        <option value="status=Packaged">
                            ???? ????ng g??i
                        </option>

                        <option value="status=Delivering to the carrier">
                            ??ang giao cho ph??a v???n chuy???n
                        </option>

                        <option value="status=Picking up">
                            ??ang l???y h??ng
                        </option>

                        <option value="status=Picked up">
                            ???? l???y h??ng
                        </option>

                        <option value="status=On Delivery">
                            ??ang giao h??ng
                        </option>

                        <option value="status=Delivered">
                            ???? giao h??ng
                        </option>

                        <option value="status=Completed">
                            ???? ho??n th??nh
                        </option>

                        <option value="status=Cancel">
                            ???? h???y
                        </option>
                        
                    </select>
                </div>

                <div className="order-sortdate-client">
                    <span>S???p x???p: </span>
                    <select value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="">M???i nh???t</option>
                        <option value="sort=oldest">C?? nh???t</option>
                    </select>
                </div>
            </div>       
            <table>
                <thead>
                    <tr>
                        <th>M?? ????n</th>
                        <th>Ph????ng th???c thanh to??n</th>
                        <th>T???ng c???ng</th>
                        <th>Ng??y ?????t</th>
                        <th>Tr???ng th??i</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        currentItems.map(item => (
                            <tr key={item._id}>
                                <td style={{textTransform: 'uppercase'}}>{item._id}</td>
                                { item.method === 'Paypal' ? 
                                <td className="method-payment"><BsIcons.BsPaypal style={{marginRight: 5, color: '#1111a9'}}/>{item.method}</td>
                                :<td className="method-payment"><FaIcons.FaTruck style={{marginRight: 5, color: 'coral'}}/>{item.method}</td>
                            }
                                
                                {/* <td>{new Date(item.createdAt).toLocaleDateString()}</td> */}
                                <td>${item.total}</td>
                                <td>{new Date(item.createdAt).toLocaleDateString()}  {moment(item.createdAt).format('LT')}</td>
                                <td>
                                    <span className={item.status ? item.status.toLowerCase() : "non-status"}>
                                        {item.status}
                                    </span>
                                </td>
                                <td>
                                    <Link to={`/history/${item._id}`}>
                                        <FontAwesomeIcon icon={faEye} /> View
                                    </Link>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <ReactPaginate
                breakLabel="..."
                nextLabel=">"
                onPageChange={handlePageClick}
                pageRangeDisplayed={2}
                pageCount={pageCount}
                previousLabel="<"
                renderOnZeroPageCount={null}
                containerClassName="pagination"
                pageLinkClassName="page-num"
                previousLinkClassName="page-num"
                activeClassName="active"
            />
        </div>
        
    )
}

export default OrderHistory