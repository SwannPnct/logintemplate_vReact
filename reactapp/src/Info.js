import React,{useContext, useState, useEffect} from 'react'
import {TokenContext} from './App'
import {Redirect} from 'react-router-dom'

export default function Info() {
    const {token, setToken} = useContext(TokenContext)
    const [userInfo, setUserInfo] = useState({})

    useEffect(() => {
        (async () => {
            const res = await fetch('/users/get-info?token='+token);
            const resJson = await res.json();
            resJson.result ? setUserInfo({username: resJson.info.username, email: resJson.info.email}) : setToken(null)
        })()
    },[])

    if (!token) {
        return (
            <Redirect to='/'/>
        )
    } else {
        return (
            <div className="main_container">
                <p>Hello. Your username is {userInfo.username}. Your email is {userInfo.email}</p>
            </div>
        )
    }
}