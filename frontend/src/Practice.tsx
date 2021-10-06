import axios from 'axios';
import { useEffect, useState } from 'react';
import { Child, Session } from './types';
import "./Practice.css";
import { Time } from './Time';
import { Color, Size } from './enums'
import { ButtonBar, Button, button } from './ButtonBar';
import { StudentChooser } from './StudentChooser';
import useSound from 'use-sound';
import { useHistory } from 'react-router-dom';
import { StudentUpdates } from './App';

enum TimerState {
  Stopped,
  Paused,
  Running
}


function getPlayButtonLabel(state: TimerState) {
  switch (state) {
    case TimerState.Paused:
      return "Resume";
    case TimerState.Running:
      return "Pause";
    case TimerState.Stopped:
    default:
      return "Start";
  }
}

interface Props {
  children: Child[],
  studentUpdates: StudentUpdates
}

function Practice({ children, studentUpdates }: Props) {
  var [students, setStudents] = useState(children)
  var [seconds, setSeconds] = useState(0)
  var [timerState, setTimerState] = useState(TimerState.Stopped)
  var [activeChild, setActiveChild] = useState(-1)
  var [reachedDailyGoal, setReachedDailyGoal] = useState(false)
  var [secondsUntilDailyGoal, setSecondsUntilDailyGoal] = useState<number | undefined>(undefined)
  var [activeSession, setActiveSession] = useState<Session | undefined>(undefined)

  const [playFanfare] = useSound('/fanfare.flac', { soundEnabled: !reachedDailyGoal })

  const history = useHistory()

  function playPauseOrResume() {
    switch (timerState) {
      case TimerState.Stopped:
        axios.post<Session>(`http://localhost:4000/api/children/${activeChild}/session`).then(response => {
          var session = response.data
          setActiveSession(session);
          setTimerState(TimerState.Running);
        })
        break;
      case TimerState.Paused:
        setTimerState(TimerState.Running);
        break;
      case TimerState.Running:
      default:
        setTimerState(TimerState.Paused);
    }
  }

  function stop() {
    if (activeSession) {
      const session = activeSession as Session;
      axios.delete(`http://localhost:4000/api/children/${activeChild}/session/${session.id}`)
      setActiveSession(undefined)
      studentUpdates.reloadStudents()
    }

    setSeconds(0)
    setTimerState(TimerState.Stopped)
  }

  useEffect(() => {
    if (timerState === TimerState.Running) {
      let interval = setInterval(() => {
        const newSeconds = seconds + 1
        setSeconds(newSeconds)

        // Save the session to the server every 5 seconds.
        if (newSeconds % 5 === 0 && activeSession) {
          activeSession.elapsed_seconds = newSeconds
          axios.put(`http://localhost:4000/api/children/${activeChild}/session/${activeSession.id}`, activeSession)
        }

        const child = students[activeChild]


        if (child.goals) {
          const todaySeconds = child.session_stats.seconds_today + newSeconds
          if (todaySeconds >= child.goals.daily_seconds) {
            if (todaySeconds === child.goals.daily_seconds) {
              playFanfare()
            }
            setReachedDailyGoal(true)
          } else {
            setSecondsUntilDailyGoal(child.goals.daily_seconds - todaySeconds)
          }
        }
      }, 1000)

      return () => clearInterval(interval)  // Let react clean up the timer
    }
  }, [timerState, seconds, activeChild, children, activeSession, students, playFanfare])

  const buttons: Button[] = [
    button(getPlayButtonLabel(timerState), playPauseOrResume)
  ]
  if (timerState !== TimerState.Stopped) buttons.push(button("Stop", stop))
  if (timerState === TimerState.Stopped) buttons.push(button("Leaderboard", () => history.push("/")))

  var secondsUntilGoalElement = <div></div>
  if (reachedDailyGoal) {
    secondsUntilGoalElement = <div className="TimeToTarget">Daily target reached!</div>
  } else if (secondsUntilDailyGoal) {
    secondsUntilGoalElement = <div className="TimeToTarget"><Time seconds={secondsUntilDailyGoal} /> until target</div>
  }

  return (
    <div className="PracticeContainer">
      <StudentChooser students={children}
        selectedIndex={activeChild === -1 ? undefined : activeChild}
        onSelected={index => setActiveChild(index)} />
      {activeChild !== -1 &&
        <>
          <div className="TimeBox">
            <Time size={Size.Large} paused={timerState === TimerState.Paused}
              seconds={seconds} color={reachedDailyGoal ? Color.Green : Color.Default} />
          </div>
          {secondsUntilGoalElement}
          <ButtonBar buttons={buttons} />
        </>
      }
    </div>
  )
}

export default Practice;