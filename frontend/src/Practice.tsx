import axios from 'axios';
import { useEffect, useState } from 'react';
import { Child, Session } from './types';

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

  var childElements = []

  var index = 0
  for (var child of children) {
    const childNumber = index;
    if (child.logged_in && (activeChild === -1 || index === activeChild)) {
      childElements.push(<button onClick={() => setActiveChild(childNumber)}><img width="50" src={child.picture} alt="blah"></img></button>)
      childElements.push(<span>{child.name}</span>)
    }
    index++
  }

  return (
    <div>
      <div>{childElements}</div>
      {activeChild === -1 ? <span /> :
        <>
          <div>{seconds}</div>
          <div>
            <button onClick={playPauseOrResume}>{getPlayButtonLabel(timerState)}</button>
            {timerState !== TimerState.Stopped && <button onClick={stop}>Stop</button>}
          </div>
        </>
      }
    </div>
  )
}

export default Practice;