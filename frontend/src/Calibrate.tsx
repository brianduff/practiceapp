import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { button, ButtonBar } from "./ButtonBar";
import { Listener } from "./Listener";
import { StudentChooser } from "./StudentChooser";
import { Student } from "./types";
import { config } from './config';

const instructions = [
  "Let's calibrate your microphone! Tap Next when you're ready.",
  "I need to hear you play piano. Play anything you like for 10 seconds. Tap Next when you're ready.",
  "Play piano. Keep playing :)",
  "Great! Now, I need to hear a bit of quiet. Try to keep quiet for the next 10 seconds. Tap Next when you're ready.",
  "Sssssh! keep quiet :)",
  "Thanks! we're all done"
]

const NOISY_SAMPLE_STEP = 2
const QUIET_SAMPLE_STEP = 4

const COUNTDOWN_STEPS = new Set()
COUNTDOWN_STEPS.add(NOISY_SAMPLE_STEP)
COUNTDOWN_STEPS.add(QUIET_SAMPLE_STEP)

class Sample {
  private count = 0
  sum = 0

  get average() {
    return this.sum / this.count
  }

  add(sample: number) {
    this.sum += sample
    this.count++
  }
}

interface Samples {
  quiet: Sample,
  noisy: Sample,
}

const EPSILON = 2.0

function isSampleGood(samples: Samples) {
  if (samples.noisy.average < samples.quiet.average) {
    return false;
  }

  if (Math.abs(samples.noisy.average - samples.quiet.average) < EPSILON) {
    return false;
  }

  return true;
}

interface CalibrateAudioProps {
  student: Student
}
function CalibrateAudio({ student }: CalibrateAudioProps) {
  const [step, setStep] = useState(0)
  const samples = useRef<Samples>({
    quiet: new Sample(),
    noisy: new Sample()
  })
  const history = useHistory()

  const onSample = (sample: number) => {
    var s
    if (step === NOISY_SAMPLE_STEP) {
      s = samples.current.noisy
    } else {
      s = samples.current.quiet
    }
    s.add(sample)
  }

  useEffect(() => {
    if (COUNTDOWN_STEPS.has(step)) {
      let timeout = setTimeout(() => {
        setStep(step + 1)
      }, 10000)

      return () => clearTimeout(timeout)
    }
  }, [step])

  var retry = step === instructions.length - 1 && !isSampleGood(samples.current)

  if (step === instructions.length - 1 && isSampleGood(samples.current)) {
    const studentId = student.id as string

    const volDiff = samples.current.noisy.average - samples.current.quiet.average
    const noisy_threshold = samples.current.quiet.average + (0.25 * volDiff)

    student.calibration = {
      noisy_threshold
    }

    axios.put(`${config.url}/api/children/${studentId}`, student)
  }

  const nextStep = () => {
    if (retry) {
      setStep(0)
    } else {
      setStep(step + 1)
    }
  }

  const nextEnabled = retry || (!COUNTDOWN_STEPS.has(step) && step < instructions.length - 1)

  return (
    <div>
      {!retry &&
        <div>
          {instructions[step]}
        </div>
      }

      {retry && <div>I wasn't able to get a good sample. Try again and make sure it's really quiet during the quiet time.</div>}

      <Listener listening={COUNTDOWN_STEPS.has(step)}
        onAverageVolume={onSample}
        debugMode={true}
        averageTimeSecs={4} />

      {nextEnabled &&
        <ButtonBar buttons={[button(retry ? "Try Again" : "Next", nextStep, nextEnabled)]} />
      }

      {step === instructions.length - 1 &&
        <ButtonBar buttons={[button("Practice", () => history.push('/practice'))]} />
      }

    </div>
  )
}

interface Props {
  students: Student[]
}
export function Calibrate({ students }: Props) {
  const [student, setStudent] = useState<undefined | number>(undefined)

  return (
    <div>
      <h1>Calibrate Microphone</h1>

      <StudentChooser students={students} selectedIndex={student}
        onSelected={index => setStudent(index)} />

      {student != null && <CalibrateAudio student={students[student]} />}
    </div>
  )
}