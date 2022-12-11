import React, { useContext } from 'react'
import { GlobalState } from './GlobalState'
import Header from './components/headers/Header'
import MainPages from './components/mainpages/Pages'
import Sidebar from './components/adminPage/Sidebar'
import HeaderShipper from './components/shipperPage/HeaderShipper'
import Footer from './components/footer/Footer'

function Content() {

    const state = useContext(GlobalState)
    const [isAdmin] = state.userAPI.isAdmin
    const [isShipper] = state.userAPI.isShipper

    if (isAdmin)
        return (
            <div className="admin grid">
                <Sidebar></Sidebar>
            </div>
        )
    if (isShipper)
        return (
            <div className="admin grid">
                <HeaderShipper></HeaderShipper>
            </div>
        )
    return (
        <>
            <Header />
            <div className="client grid">
                <MainPages />
            </div>
            <Footer />
        </>
    )
}

export default Content