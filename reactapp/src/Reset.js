import React, { useState, useEffect } from 'react'
import {useParams} from 'react-router-dom'

export default function ResetPassword(props) {

    const {token} = useParams()
    const [password, setPassword] = useState("")
    const [isInvalid, setIsInvalid] = useState(false)

    const [error, setError] = useState(null)
    const [mediumHandling, setMediumHandling] = useState(false)

    useEffect(() => {
        (async () => {
            const res = await fetch("/users/check-token/" + token)
            const resJson = await res.json()
            if (!resJson.result) setIsInvalid(true)
        })()
    },[])

    const handleResetPassword = () => {

    }

     return (
        <div>
            { !isInvalid ?
            <div>
            <h3>Reset your password here :</h3>
            <input type="password" placeholder="new password" onChange={(e) => setPassword(e.target.value)} value={password}/>
            <button className="submit_button">Reset</button>
            </div>
            :
            <h3>Invalid link or token.</h3>
            }
        </div>
           
    )
}