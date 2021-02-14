import React, { useState } from 'react'
import './App.css'
import Login from './Login'
import Info from './Info'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'

export const TokenContext = React.createContext()

function App() {

  const [token, setToken] = useState(null)

  return (
    <TokenContext.Provider value={{token, setToken}}>
      <Router>
        <Switch>
          <Route exact path='/'>
            <Login/>
          </Route>
          <Route path='/info'>
            <Info/>
          </Route>
        </Switch>
      </Router>
    </TokenContext.Provider>
    
  );
}

export default App;
