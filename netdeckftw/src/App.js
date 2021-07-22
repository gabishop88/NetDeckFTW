import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import Home from './Home';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

function App() {
  const [userName, setUserName] = useState('');

  return (
    <div className="Application">
      <Router>
        <Switch>
          <Route exact path='/login'>
            <Login userName={userName} setUserName={setUserName} />
          </Route>
          <Route path='/home'>
            <Home userName={userName} />
          </Route>
          <Route path='/'>
            <Redirect to={userName === '' ? '/login' : '/home'}></Redirect>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
