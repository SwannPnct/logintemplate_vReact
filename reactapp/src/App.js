import React, { useState } from 'react'
import './App.css'
import Login from './Login'

export const TokenContext = React.createContext()

function App() {

  const [token, setToken] = useState(null)

  return (
    <TokenContext.Provider value={{token, setToken}}>
        <Login/>
    </TokenContext.Provider>
    
  );
}

export default App;
