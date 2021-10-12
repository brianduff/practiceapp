import './StudentForm.css'
import { ButtonBar, button } from './ButtonBar';
import { useHistory } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';
import axios from 'axios';
import { RobotPracticeTime, RobotSettings, Student } from './types';
import { StudentUpdates } from './App';
import randomNormal from 'random-normal';
import { config } from './config';

function randomValue(values: number[]): number {
  return values[Math.floor(Math.random() * values.length)]
}

function randomNormalValue(values: number[]): number {
  let spec = { mean: values.length / 2, dev: (values.length) / 4 }
  var r = randomNormal(spec)

  if (r < 0) r = 0
  if (r >= values.length) r = values.length - 1
  return values[Math.floor(r)]
}

function randomProbability(min: number, max: number): number {
  var base = Math.random() * (max - min) + min

  return Math.round((base + Number.EPSILON) * 100) / 100
}

function createDefaultRobotSettings(): RobotSettings {
  const weekday_start_hour = randomValue([6, 7, 16, 17, 18, 19, 20])
  const weekday_start_minute = randomValue([10, 15, 20, 30, 45])
  const weekend_start_hour = randomValue([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
  const weekend_start_minute = randomValue([10, 15, 20, 30, 45])
  const weekday_time_minutes = randomNormalValue([15, 20, 25, 30, 35, 40, 45])
  const weekend_time_minutes = randomNormalValue([15, 20, 25, 30, 35, 40, 45])

  return {
    week_day_practice_time: {
      start_hour: weekday_start_hour,
      start_minute: weekday_start_minute,
      duration_minutes: weekday_time_minutes
    },
    weekend_practice_time: {
      start_hour: weekend_start_hour,
      start_minute: weekend_start_minute,
      duration_minutes: weekend_time_minutes
    },
    p_skip: randomProbability(0.01, 0.08),
    p_extra_time: randomProbability(0.02, 0.10),
    p_less_time: randomProbability(0.01, 0.05),
  }
}


interface RobotControlsParams {
  settings: RobotSettings,
  updateSettings: (settings: RobotSettings) => void
}

function updatePracticeTime(txt: String, practice: RobotPracticeTime) {
  var bits = txt.split(':')
  if (bits[0]) {
    practice.start_hour = parseInt(bits[0], 10)
  }
  if (bits[1]) {
    practice.start_minute = parseInt(bits[0], 10)
  }
}

function RobotControls({ settings, updateSettings }: RobotControlsParams) {
  function update(fn: (txt: string, settings: RobotSettings) => void) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      fn(e.target.value, settings)
      updateSettings(settings)
    }
  }

  return (
    <>
      <span></span>
      <span>Robot Settings</span>
      <span>Weekday Start:</span>
      <input type="text"
        onChange={update((txt, settings) => updatePracticeTime(txt, settings.week_day_practice_time))}
        value={settings.week_day_practice_time.start_hour + ":" + settings.week_day_practice_time.start_minute} />
      <span>Weekday Mins:</span>
      <input type="text"
        onChange={update((txt, settings) => settings.week_day_practice_time.duration_minutes = parseInt(txt, 10))}
        value={settings.week_day_practice_time.duration_minutes} />
      <span>Weekend Start:</span>
      <input type="text"
        onChange={update((txt, settings) => updatePracticeTime(txt, settings.weekend_practice_time))}
        value={settings.weekend_practice_time.start_hour + ":" + settings.weekend_practice_time.start_minute} />
      <span>Weekend Mins:</span>
      <input type="text"
        onChange={update((txt, settings) => settings.weekend_practice_time.duration_minutes = parseInt(txt, 10))}
        value={settings.weekend_practice_time.duration_minutes} />
      <span>Skip Chance %:</span>
      <input type="text"
        onChange={update((txt, settings) => settings.p_skip = parseInt(txt, 10) / 100)}
        value={Math.floor(settings.p_skip * 100)} />
      <span>Extra Time Chance %:</span>
      <input type="text"
        onChange={update((txt, settings) => settings.p_extra_time = parseInt(txt, 10) / 100)}
        value={Math.floor(settings.p_extra_time * 100)} />
      <span>Less Time Chance %:</span>
      <input type="text"
        onChange={update((txt, settings) => settings.p_less_time = parseInt(txt, 10) / 100)}
        value={Math.floor(settings.p_less_time * 100)} />
    </>
  )
}

interface Props {
  studentUpdates: StudentUpdates
}

export function StudentForm({ studentUpdates }: Props) {
  const history = useHistory()
  const [name, setName] = useState("")
  const [pictureUrl, setPictureUrl] = useState("")
  const [dailyGoal, setDailyGoal] = useState("1800")
  const [canLogIn, setCanLogIn] = useState(false)

  const [robotSettings, setRobotSettings] = useState(createDefaultRobotSettings())

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
    const child: Student = {
      name,
      picture: pictureUrl,
      session_stats: {
        seconds_today: 0,
        seconds_week: 0
      },
      logged_in: canLogIn,
      goals: {
        daily_seconds: parseInt(dailyGoal, 10)
      },
      robot_controls: robotSettings
    }

    const response = await axios.post<Student>(`${config.url}/api/children`, child)
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

      {!canLogIn && <RobotControls settings={robotSettings} updateSettings={settings => setRobotSettings(settings)} />}

      <span />
      <ButtonBar buttons={[
        button("Cancel", () => { history.push("/admin") }),
        button("Add", addChild, addButtonEnabled)
      ]} />
    </div>
  )
}