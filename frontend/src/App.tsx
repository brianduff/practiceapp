import { useState, useEffect } from "react";
import LeaderBoard from "./LeaderBoard";
import Practice from './Practice';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Admin } from './Admin';
import { StudentForm } from './StudentForm';
import { Child } from './types';

export type StudentUpdates = {
  addStudent(child: Child): any;
  updateStudent(child: Child): any;
  /**
   * Reloads students from the server.
   */
  reloadStudents(): Promise<any>;
}

function App() {
  const [children, setChildren] = useState<Child[]>([])

  const studentUpdates: StudentUpdates = {
    addStudent(child: Child): any {
      const newChildren = [...children]
      newChildren.push(child)
      setChildren(newChildren)
    },
    updateStudent(child: Child): any {

    },
    async reloadStudents(): Promise<any> {
      let res = await axios("http://localhost:4000/api/children")
      setChildren(res.data)
    }
  }

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
            <Practice children={children} studentUpdates={studentUpdates} />
          </Route>
          <Route exact path="/admin">
            <Admin />
          </Route>
          <Route path="/admin/addstudent">
            <StudentForm studentUpdates={studentUpdates} />
          </Route>
        </Switch>
      </Router>
    </div>
  )
}

export default App;
