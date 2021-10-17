import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Student, Session } from './types';
import "./Practice.css";
import { Time } from './Time';
import { Color, Size } from './enums'
import { ButtonBar, Button, button } from './ButtonBar';
import { StudentChooser } from './StudentChooser';
import useSound from 'use-sound';
import { useHistory } from 'react-router-dom';
import { StudentUpdates } from './App';
import { config } from './config';
import { Listener } from './Listener';
import { speak } from './Speech';

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
  children: Student[],
  studentUpdates: StudentUpdates
}

enum QuietState {
  Normal,
  FirstWarning,
  SecondWarning,
  Paused
}

function Practice({ children, studentUpdates }: Props) {
  var [students, setStudents] = useState(children)
  var [seconds, setSeconds] = useState(0)
  var [timerState, setTimerState] = useState(TimerState.Stopped)
  var [activeStudentIndex, setActiveStudentIndex] = useState(-1)
  var [reachedDailyGoal, setReachedDailyGoal] = useState(false)
  var [secondsUntilDailyGoal, setSecondsUntilDailyGoal] = useState<number | undefined>(undefined)
  var [activeSession, setActiveSession] = useState<Session | undefined>(undefined)
  var quietPeriods = useRef(0)
  var [quietState, setQuietState] = useState(QuietState.Normal)

  const [playFanfare] = useSound('/fanfare.flac', { soundEnabled: !reachedDailyGoal })

  const history = useHistory()

  function getActiveStudentId(): string {
    return students[activeStudentIndex].id as string
  }

  function playPauseOrResume() {
    switch (timerState) {
      case TimerState.Stopped:
        axios.post<Session>(`${config.url}/api/children/${getActiveStudentId()}/session`).then(response => {
          var session = response.data
          setActiveSession(session);
          console.log("Resetting quiet periods")
          quietPeriods.current = 0
          setTimerState(TimerState.Running);
        })
        break;
      case TimerState.Paused:
        quietPeriods.current = 0
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
      activeSession.elapsed_seconds = seconds
      axios.put(`${config.url}/api/children/${getActiveStudentId()}/session/${activeSession.id}`, activeSession).then(res => {
        axios.delete(`${config.url}/api/children/${getActiveStudentId()}/session/${session.id}`).then(res => {
          setActiveSession(undefined)
          studentUpdates.reloadStudents()
        })
      })
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
          axios.put(`${config.url}/api/children/${getActiveStudentId()}/session/${activeSession.id}`, activeSession)
        }

        const child = students[activeStudentIndex]


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
  }, [timerState, seconds, activeStudentIndex, children, activeSession, students, playFanfare, getActiveStudentId])

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

  const onNoisyPeriod = () => {
    console.log("Noisy period!")
    quietPeriods.current = 0
  }

  const onQuietPeriod = () => {
    quietPeriods.current = quietPeriods.current + 1
    if (quietPeriods.current > 2 && timerState === TimerState.Running) {
      speak("I'm not hearing any sound, so I paused the practice. Press rezume to continue")
      playPauseOrResume()
    }
  }

  return (
    <div className="PracticeContainer">
      <StudentChooser students={children}
        selectedIndex={activeStudentIndex === -1 ? undefined : activeStudentIndex}
        onSelected={index => setActiveStudentIndex(index)} />
      {activeStudentIndex !== -1 &&
        <>
          <Listener listening={timerState === TimerState.Running}
            onNoisyPeriod={onNoisyPeriod}
            onQuietPeriod={onQuietPeriod}/>

          {quietPeriods.current === 1 &&
            <div>Hey! it's kind of quiet..... are you still practicing?</div>
          }

          {quietPeriods.current === 2 &&
            <div>Oy! It's been quiet for a while. Pausing soon!</div>
          }

          {quietPeriods.current > 2 &&
            <div>Paused automatically because it was so quiet</div>
          }

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