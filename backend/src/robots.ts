import { Db } from "./db";
import { RobotPracticeTime, RobotSettings, Student } from "./types"
import { add } from 'date-fns'
import * as cronParser from 'cron-parser'
import { startSession, updateSession, studentStore, periodStatStore } from './Students'
import { CronExpression } from "cron-parser";

// Can increase this to delay robot updates
const timeBetweenUprisings: Duration = { minutes: 30 }

const ROBOT_STATE_KEY = "asimov"

export interface RobotState {
  key: string,
  /** When was the last robot uprising? */
  last_robot_uprising: Date
}

/** Launch the robots! */
export async function launchTheRobots(students: Student[]) {
  const now = new Date()
  // When did the robots last rise up to strike down their human overlords?
  const state = await Db.robots().findOne()
  if (state !== null) {
    var nextUprising = add(state.last_robot_uprising, timeBetweenUprisings)
    if (now < nextUprising) {
      console.log("Skipping uprising. Next one at ", nextUprising)
      return
    }
  } else {
    // We skip this uprising, but record the date so that future generations
    // of robots will profit.
    console.log("Beginning a new robot uprising era")
    Db.robots().insertOne({ key: ROBOT_STATE_KEY, last_robot_uprising: now })
    return
  }

  for (const student of students) {
    if (student.logged_in) continue;
    const controls = student.robot_controls
    if (!controls) continue;

    var options = {
      currentDate: state.last_robot_uprising,
      endDate: now,
      iterate: true,
      tz: 'America/Los_Angeles'
    }
    var practice = controls.week_day_practice_time
    var weekdayCron = cronParser.parseExpression(`${practice.start_minute} ${practice.start_hour} * * 1-5`, options)
    doPractice(student, weekdayCron, practice)

    practice = controls.weekend_practice_time
    var weekendCron = cronParser.parseExpression(`${practice.start_minute} ${practice.start_hour} * * 6,7`, options)
    doPractice(student, weekendCron, practice)
  }

  await Db.robots().updateOne({ key: ROBOT_STATE_KEY }, {
    $set: {
      last_robot_uprising: now
    }
  })
}

async function doPractice(student: Student, cron: CronExpression<false>, practice: RobotPracticeTime) {
  const studentId = studentStore.getKey(student)
  const controls = student.robot_controls
  while (cron.hasNext()) {
    const practiceStart = cron.next().toDate()
    if (passProbability(controls.p_skip)) {
      console.log(`[${practiceStart}] ${student.name} skipped practice with probability=${controls.p_skip}`)
      continue
    }
    var practiceDuration = practice.duration_minutes
    while (passProbability(controls.p_less_time)) {
      practiceDuration -= 5
    }
    while (passProbability(controls.p_extra_time)) {
      practiceDuration += 5
    }
    console.log(`[${practiceStart}] ${student.name} practiced for ${practiceDuration} minutes`)

    const practiceEnd = add(practiceStart, { minutes: practiceDuration })

    let session = await startSession(studentId, practiceStart)
    session.end_time = practiceEnd
    session.elapsed_seconds = 60 * practiceDuration

    await updateSession(studentId, session)
    await periodStatStore.addPeriodTime(studentId, session.elapsed_seconds, session.start_time)
  }
}

function passProbability(probability: number): boolean {
  return Math.random() <= probability
}