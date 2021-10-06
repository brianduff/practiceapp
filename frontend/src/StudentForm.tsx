import './StudentForm.css'
import { ButtonBar, button } from './ButtonBar';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { Child } from './types';
import { StudentUpdates } from './App';

interface Props {
  studentUpdates: StudentUpdates
}

export function StudentForm({ studentUpdates }: Props) {
  const history = useHistory()
  const [name, setName] = useState("")
  const [pictureUrl, setPictureUrl] = useState("")
  const [dailyGoal, setDailyGoal] = useState("1800")
  const [canLogIn, setCanLogIn] = useState(false)

  const updateDailyGoal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newNumber = parseInt(newValue, 10)
    if (newValue.length === 0) {
      setDailyGoal("")
    } else if (!isNaN(newNumber) && newNumber >= 0) {
      setDailyGoal(newNumber.toString())
    }
  }

  const addButtonEnabled = name.length > 0 && pictureUrl.length > 0 && dailyGoal.length > 0;

  const addChild = async () => {
    const child: Child = {
      name,
      picture: pictureUrl,
      session_stats: {
        seconds_today: 0,
        seconds_week: 0
      },
      logged_in: canLogIn,
      goals: {
        daily_seconds: parseInt(dailyGoal, 10)
      }
    }

    const response = await axios.post<Child>(`http://localhost:4000/api/children`, child)
    const responseChild = response.data
    studentUpdates.addStudent(responseChild)
    history.push("/")
  }

  return (
    <div className="StudentForm">
      <span>Name:</span>
      <span><input type="text" value={name} onChange={e => setName(e.target.value)} /></span>
      <span>Picture URL:</span>
      <span><input type="text" value={pictureUrl} onChange={e => setPictureUrl(e.target.value)} /></span>
      <span />
      <span><input id="canLogIn" name="canLogIn" type="checkbox" checked={canLogIn} onChange={e => setCanLogIn(e.target.checked)} /><label htmlFor="canLogIn">Can log in</label></span>
      <span>Daily Goal (sec):</span>
      <span><input type="text" value={dailyGoal.toString()} onChange={updateDailyGoal} /></span>
      <span />
      <ButtonBar buttons={[
        button("Cancel", () => { history.push("/admin") }),
        button("Add", addChild, addButtonEnabled)
      ]} />
    </div>
  )
}