import React,{useContext, useState} from 'react'
import {TokenContext} from './App'

export default function Login() {
    const {token, setToken} = useContext(TokenContext)
    const [emailSI, setEmailSI] = useState("")
    const [passwordSI, setPasswordSI] = useState("")
    const [usernameSU, setUsernameSU] = useState("")
    const [emailSU, setEmailSU] = useState("")
    const [passwordSU, setPasswordSU] = useState("")


    return (
        <div className="main_container">
            <div className="login_forms">
                <div className="gen_form">
                    <div className="form_header">
                        <h3>Login into your account</h3>
                    </div>
                    <div className="form">
                        <div>
                            <label>Email</label>
                            <input type="text" onChange={() => e => setEmailSI(e.target.value)} value={emailSI}></input>
                        </div>
                        <div>
                            <label>Password</label>
                            <input type="password" onChange={() => e => setPasswordSI(e.target.value)} value={passwordSI}></input>
                        </div>
                        <button class="submit_button">Sign-In</button>
                    </div>
                </div>
                <div class="gen_form" id="form_two">
                    <div class="form_header">
                        <h3>Create a new account</h3>
                    </div>
                    <div className="form">
                        <div>
                            <label>Username</label>
                            <input type="text" onChange={() => e => setUsernameSU(e.target.value)} value={usernameSU}></input>
                        </div>
                        <div>
                            <label>Email</label>
                            <input type="text" onChange={() => e => setEmailSU(e.target.value)} value={emailSU}></input>
                        </div>
                        <div>
                            <label>Password</label>
                            <input type="password" onChange={() => e => setPasswordSU(e.target.value)} value={passwordSU}></input>
                        </div>
                        <button class="submit_button" >Sign-Up</button>
                    </div>
                </div>
            </div>
        </div>
    )
}