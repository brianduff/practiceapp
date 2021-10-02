import { useState, useEffect } from "react";
import LeaderBoard from "./LeaderBoard";
import Practice from './Practice';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  const [children, setChildren] = useState([])

  useEffect(() => {
    axios("http://localhost:4000/api/children").then(res => setChildren(res.data))
  }, [])

  return (
    <div className="container">
      <Router>
        <Switch>
          <Route exact path="/">
            <LeaderBoard children={children} />
          </Route>
          <Route path="/practice">
            <Practice children={children} />
          </Route>
        </Switch>
      </Router>
    </div>
  )
}

export default App;
