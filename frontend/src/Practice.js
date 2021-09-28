import axios from 'axios';
import { useEffect, useState } from 'react';

const TIMER_STOPPED = 1
const TIMER_PAUSED = 2
const TIMER_RUNNING = 3


function getPlayButtonLabel(state) {
  switch (state) {
    case TIMER_PAUSED:
      return "Resume";
    case TIMER_RUNNING:
      return "Pause";
    case TIMER_STOPPED:
    default:
      return "Start";
  }
}

function Practice({ children }) {
  var [seconds, setSeconds] = useState(0)
  var [timerState, setTimerState] = useState(TIMER_STOPPED)
  var [activeChild, setActiveChild] = useState(-1)

  function playPauseOrResume() {
    switch (timerState) {
      case TIMER_STOPPED:
      case TIMER_PAUSED:
        setTimerState(TIMER_RUNNING);
        break;
      case TIMER_RUNNING:
      default:
        setTimerState(TIMER_PAUSED);
    }
  }

  function stop() {
    const session = {
      "elapsed_seconds": seconds
    }

    axios.post(`http://localhost:4000/api/children/${activeChild}/session`, session)

    setSeconds(0)
    setTimerState(TIMER_STOPPED)
  }

  useEffect(() => {
    if (timerState === TIMER_RUNNING) {
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
    if (child.loggedIn && (activeChild === -1 || index === activeChild)) {
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
            {timerState !== TIMER_STOPPED && <button onClick={stop}>Stop</button>}
          </div>
        </>
      }
    </div>
  )
}

export default Practice;