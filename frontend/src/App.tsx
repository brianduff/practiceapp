import { useState, useEffect } from "react";
import LeaderBoardPage from "./LeaderBoard";
import Practice from './Practice';
import { Calibrate } from './Calibrate'
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Admin } from './Admin';
import { StudentForm } from './StudentForm';
import { Student } from './types';
import { config } from './config'
import { DashBoard } from "./DashBoard";

export type StudentUpdates = {
  addStudent(child: Student): any;
  updateStudent(child: Student): any;
  /**
   * Reloads students from the server.
   */
  reloadStudents(): Promise<any>;
}

function App() {
  const [children, setChildren] = useState<Student[]>([])

  const studentUpdates: StudentUpdates = {
    addStudent(child: Student): any {
      const newChildren = [...children]
      newChildren.push(child)
      setChildren(newChildren)
    },
    updateStudent(child: Student): any {

    },
    async reloadStudents(): Promise<any> {
      let res = await axios(`${config.url}/api/children`)
      setChildren(res.data)
    }
  }

  useEffect(() => {
    axios(`${config.url}/api/children`).then(res => setChildren(res.data))
  }, [])

  return (
    <div className="container">
      <Router>
        <Switch>
          <Route exact path="/">
            <LeaderBoardPage children={children} />
          </Route>
          <Route exact path="/dashboard">
            <DashBoard children={children} />
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
          <Route path="/calibrate">
            <Calibrate students={children} />
          </Route>
        </Switch>
      </Router>
    </div>
  )
}

export default App;
