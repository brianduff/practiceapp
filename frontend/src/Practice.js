import { useEffect, useState } from 'react';

const TIMER_STOPPED = 1
const TIMER_PAUSED = 2
const TIMER_RUNNING = 3


function Practice({ children }) {
  var [seconds, setSeconds] = useState(0)
  var [timerState, setTimerState] = useState(TIMER_STOPPED)
  var [activeChild, setActiveChild] = useState(-1)

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
            {timerState === TIMER_STOPPED ? <button onClick={play}>Play</button> : <span />}
            <button onClick={pauseOrResume}>{timerState === TIMER_PAUSED ? "Resume" : "Pause"}</button>
            <button onClick={stop}>Stop</button>
          </div>
        </>
      }
    </div>
  )
}

export default Practice;