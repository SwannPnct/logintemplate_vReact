import React,{useContext, useState} from 'react'
import {TokenContext} from './App'

export default function Info() {
    const {token, setToken} = useContext(TokenContext)
    const [userInfo, setUserInfo] = useState({})

    return (
        <div className="main_container">
            <p>Hello</p>
        </div>
    )
}