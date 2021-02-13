import React,{useContext, useState} from 'react'
import {TokenContext} from './App'
import {Redirect} from 'react-router-dom'

export default function Info() {
    const {token, setToken} = useContext(TokenContext)
    const [userInfo, setUserInfo] = useState({})

    if (!token) {
        return (
            <Redirect to='/'/>
        )
    } else {
        return (
            <div className="main_container">
                <p>Hello</p>
            </div>
        )
    }
}