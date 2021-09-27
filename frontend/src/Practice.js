import { useEffect, useState } from 'react';
import children from "./data";

const TIMER_STOPPED = 1
const TIMER_PAUSED = 2
const TIMER_RUNNING = 3


function Practice() {
  var [seconds, setSeconds] = useState(0)
  var [timerState, setTimerState] = useState(TIMER_STOPPED)

  function play() {
    setTimerState(TIMER_RUNNING)
  }

  function pauseOrResume() {
    setTimerState(timerState === TIMER_PAUSED ? TIMER_RUNNING : TIMER_PAUSED)
  }

  function stop() {
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

  for (var child of children) {
    if (child.loggedIn) {
      childElements.push(<span><img width="50" src={child.picture} alt="blah"></img></span>)
      childElements.push(<span>{child.name}</span>)
    }
  }

  return (
    <div>
      <div>{childElements}</div>
      <div>{seconds}</div>
      <div>
        {timerState === TIMER_STOPPED ? <button onClick={play}>Play</button> : <span />}
        <button onClick={pauseOrResume}>{timerState === TIMER_PAUSED ? "Resume" : "Pause"}</button>
        <button onClick={stop}>Stop</button>
      </div>
    </div>
  )
}

export default Practice;