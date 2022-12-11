import React from 'react'
import * as MdIcons from 'react-icons/md'
import * as BiIcons from "react-icons/bi"
import * as AiIcons from "react-icons/ai"

export const SidebarData = [
    {
        title: 'New Orders',
        path: '/ordersonship',
        icon: <MdIcons.MdUpcoming />
    },
    {
        title: 'My Orders',
        path: '/myorders',
        icon: <BiIcons.BiReceipt />
    },
    {
        title: 'Statistics',
        path: '/statistic',
        icon: <AiIcons.AiFillProfile />
    }
]