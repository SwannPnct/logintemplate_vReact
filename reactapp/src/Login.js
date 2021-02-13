import React,{useContext, useState} from 'react'
import {TokenContext} from './App'
import {Redirect} from 'react-router-dom'

export default function Login() {
    const {token, setToken} = useContext(TokenContext)
    const [emailSI, setEmailSI] = useState("")
    const [passwordSI, setPasswordSI] = useState("")
    const [usernameSU, setUsernameSU] = useState("")
    const [emailSU, setEmailSU] = useState("")
    const [passwordSU, setPasswordSU] = useState("")
    const [errorSI, setErrorSI] = useState(null)
    const [errorSU, setErrorSU] = useState(null)

    async function handleSignIn() {
        const res = await fetch('/users/sign-in', {
            method: "POST",
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                email: emailSI,
                password: passwordSI
            })
        })
        const resJson = await res.json();
        if (!resJson.result) {
            setErrorSI(resJson.error);
        } else {
            setErrorSI(null);
            setToken(resJson.token)
        }
    }

    async function handleSignUp() {
        const res = await fetch('/users/sign-up', {
            method: "POST",
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                username: usernameSU,
                email: emailSU,
                password: passwordSU
            })
        })
        const resJson = await res.json();
        if (!resJson.result) {
            setErrorSU(resJson.error);
        } else {
            setErrorSU(null);
            setToken(resJson.token)
        }
    }
    
    if (token) {
        return (
            <Redirect to='/info'/>
        )
    } else {
        return (
            <div className="main_container">
                <div className="login_forms">
                    <div className="gen_form">
                        <div className="form_header">
                            <h3>Login into your account</h3>
                        </div>
                        <div className="form">
                        {errorSI ? <div className="alert_message">{errorSI}</div> : null}
                            <div>
                                <label>Email</label>
                                <input type="text" onChange={() => e => setEmailSI(e.target.value)} value={emailSI}></input>
                            </div>
                            <div>
                                <label>Password</label>
                                <input type="password" onChange={() => e => setPasswordSI(e.target.value)} value={passwordSI}></input>
                            </div>
                            <button class="submit_button" onClick={() => handleSignIn()}>Sign-In</button>
                        </div>
                    </div>
                    <div class="gen_form" id="form_two">
                        <div class="form_header">
                            <h3>Create a new account</h3>
                        </div>
                        <div className="form">
                            {errorSU ? <div className="alert_message">{errorSU}</div> : null}
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
                            <button class="submit_button" onClick={() => handleSignUp()}>Sign-Up</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    
}