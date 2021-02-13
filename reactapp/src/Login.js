import React from 'react'

export default function Login() {

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
                            <input type="text"></input>
                        </div>
                        <div>
                            <label>Password</label>
                            <input type="password"></input>
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
                            <input type="text"></input>
                        </div>
                        <div>
                            <label>Email</label>
                            <input type="text"></input>
                        </div>
                        <div>
                            <label>Password</label>
                            <input type="password"></input>
                        </div>
                        <button class="submit_button">Sign-Up</button>
                    </div>
                </div>
            </div>
        </div>
    )
}