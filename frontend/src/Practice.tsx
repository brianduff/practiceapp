import axios from 'axios';
import { useEffect, useState } from 'react';
import { Child, Session } from './types';
import "./Practice.css";
import { Time } from './Time';
import { Size } from './size'
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
  var [sessionStart, setSessionStart] = useState(new Date())

  function playPauseOrResume() {
    switch (timerState) {
      case TimerState.Stopped:
        setSessionStart(new Date())
        setTimerState(TimerState.Running);
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
    const session: Session = {
      elapsed_seconds: seconds,
      start_time: sessionStart,
      end_time: new Date()
    }

    axios.post(`http://localhost:4000/api/children/${activeChild}/session`, session)

    setSeconds(0)
    setTimerState(TimerState.Stopped)
  }

  useEffect(() => {
    if (timerState === TimerState.Running) {
      let interval = setInterval(() => {
        setSeconds(seconds + 1)
      }, 1000)

      return () => clearInterval(interval)  // Let react clean up the timer
    }
  }, [timerState, seconds])

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
            <Time size={Size.Large} paused={timerState === TimerState.Paused} seconds={seconds} />
          </div>
          <ButtonBar buttons={buttons} />
        </>
      }
    </div>
  )
}

export default Practice;