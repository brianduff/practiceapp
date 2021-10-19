import { useEffect, useState, useRef } from 'react'
import './Listener.css'
import { Duration, add as add_date } from 'date-fns'
import { CircularBuffer } from './CircularBuffer'

const AVG_DURATION: Duration = {
  seconds: 5
}

// Below this is considered quiet.
const THRESHOLD_FOR_QUIET = 10


// We sample at about 30hz for the animation, so 200 should be more than enough.
const MAX_SAMPLES_PER_DURATION = 200
const MAX_AVERAGES = 100

// Keeps track of a running average within a time window. When
// the time window elapses, stores the average over the previous
// time period
class RunningAverage {
  prev_averages: CircularBuffer = new CircularBuffer(MAX_AVERAGES)
  current_values: CircularBuffer = new CircularBuffer(MAX_SAMPLES_PER_DURATION)

  period_start: Date = new Date()
  period_end: Date = add_date(this.period_start, AVG_DURATION)
  dropped_samples = 0

  period_callback: undefined | ((lastAverage: number) => void) = undefined

  constructor(period_callback?: ((lastAverage: number) => void)) {
    this.period_callback = period_callback
  }

  record(value: number) {
    this.current_values.push(value)
    if (this.current_values.length >= MAX_SAMPLES_PER_DURATION) {
      this.dropped_samples++
    }
    const now = new Date()
    if (now >= this.period_end) {
      const mean = this.current_values.mean
      this.dropped_samples = 0
      this.prev_averages.push(mean)
      this.current_values.clear()

      if (this.period_callback) {
        this.period_callback(mean)
      }

      this.period_start = now
      this.period_end = add_date(now, AVG_DURATION)
    }
  }
}

export interface Props {
  listening: boolean,
  // A function that's triggered when things go quiet for > 5s
  onQuietPeriod: () => void,
  // A function that's triggered when things are noisy for > 5s
  onNoisyPeriod: () => void
}

export function Listener({ listening, onQuietPeriod, onNoisyPeriod }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)

  const animation = useRef<number | null>(null);


  useEffect(() => {
    console.log("Effect: ", { listening })

    async function startListening() {
      const audioContext = new window.AudioContext()
      const analyzer = audioContext.createAnalyser()
      analyzer.fftSize = 512
      analyzer.minDecibels = -127
      analyzer.maxDecibels = 0
      analyzer.smoothingTimeConstant = 0.4
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mic = audioContext.createMediaStreamSource(stream)
      mic.connect(analyzer)

      analyzerRef.current = analyzer

      const volumes = new Uint8Array(analyzer.frequencyBinCount)

      const canvas = canvasRef.current
      const width = canvas?.width as number
      const height = canvas?.height as number
      const context = canvas?.getContext("2d")

      const averages = new RunningAverage((lastAverage) => {
        console.log("last average", lastAverage)
        if (lastAverage < THRESHOLD_FOR_QUIET) {
          onQuietPeriod()
        } else {
          onNoisyPeriod()
        }
      })

      var draw = () => {
        if (listening) {
          animation.current = requestAnimationFrame(draw)
          analyzer.getByteFrequencyData(volumes)

          if (context) {
            context.clearRect(0, 0, width, height)

            var barWidth = (width / analyzer.frequencyBinCount) * 2.5
            var barHeight;
            var x = 0

            for (var i = 0; i < analyzer.frequencyBinCount; i++) {
              barHeight = volumes[i]

              context.fillStyle = `rgb(50, 50, ${barHeight + 100})`
              context.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2)

              x += barWidth + 1
            }

            // We only sample the middle third of frequencies, because those are
            // where piano like noises are most likely to occur.
            const freq_third = analyzer.frequencyBinCount / 3
            var sum = 0
            var count = 0
            for (var i = Math.floor(freq_third); i < Math.max(Math.floor(freq_third * 2), volumes.length); i++) {
              sum += volumes[i]
              count++
            }
            averages.record(sum / count)
          }
        }
      }
      draw()
    }

    async function stopListening() {
      const canvas = canvasRef.current
      const context = canvas?.getContext("2d")
      if (context) {
        context.clearRect(0, 0, canvas?.width as number, canvas?.height as number)
      }

      if (animation.current) {
        cancelAnimationFrame(animation.current)
      }

      analyzerRef.current?.disconnect()
      analyzerRef.current = null
    }

    if (listening) {
      startListening()
    } else {
      stopListening()
    }

  }, [listening])

  return (
    <div>
      <canvas className="AudioBar" ref={canvasRef}></canvas>
      <div className="AudioMessage">&nbsp;</div>
    </div>
  )
}