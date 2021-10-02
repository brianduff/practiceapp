import axios from 'axios';
import { useEffect, useState } from 'react';
import { Child, Session } from './types';
import "./Practice.css";
import { Time } from './Time';
import { Color, Size } from './enums'
import { ButtonBar, Button, button } from './ButtonBar';
import { StudentChooser } from './StudentChooser';

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
  children: Child[]
}

function Practice({ children }: Props) {
  var [seconds, setSeconds] = useState(0)
  var [timerState, setTimerState] = useState(TimerState.Stopped)
  var [activeChild, setActiveChild] = useState(-1)
  var [reachedDailyGoal, setReachedDailyGoal] = useState(false)
  var [activeSession, setActiveSession] = useState<Session | undefined>(undefined)

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

        const child = children[activeChild]

        console.log("Child: ", { child, newSeconds })

        if (child.goals) {
          const todaySeconds = child.session_stats.seconds_today + newSeconds
          if (todaySeconds >= child.goals.daily_seconds) {
            setReachedDailyGoal(true)
          }
        }
      }, 1000)

      return () => clearInterval(interval)  // Let react clean up the timer
    }
  }, [timerState, seconds, activeChild, children, activeSession])

  const buttons: Button[] = [
    button(getPlayButtonLabel(timerState), playPauseOrResume)
  ]
  if (timerState !== TimerState.Stopped) buttons.push(button("Stop", stop))

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
          <ButtonBar buttons={buttons} />
        </>
      }
    </div>
  )
}

export default Practice;