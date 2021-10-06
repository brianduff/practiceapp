import { Child, Session } from './types';
import { format } from 'date-fns';
import { StudentStore, MongoStudentStore } from './StudentStore';
import { SessionStore, ArraySessionStore } from './SessionStore';

const studentStore: StudentStore = new MongoStudentStore()
const sessionStore: SessionStore = new ArraySessionStore()

interface PeriodStats {
  // Map from yyyyMMdd -> number of seconds practiced on that day
  daily_seconds: Map<string, number>;
  // Map from yyyyww -> number of seconds practiced in that week
  weekly_seconds: Map<string, number>;
}

function getDayKey(date?: Date): string {
  if (!date) {
    date = new Date()
  }
  return format(date, "yyyyMMdd")
}

function getWeekKey(date?: Date): string {
  if (!date) {
    date = new Date()
  }
  return format(date, "yyyyww")
}

// childId -> period stats for that child
var periodStats: PeriodStats[] = [
  null,
  null,
  null
]


function getPeriodStats(childId: string): PeriodStats {
  let stats = periodStats[parseInt(childId, 10)]
  if (!stats) {
    stats = {
      daily_seconds: new Map(),
      weekly_seconds: new Map()
    }
    periodStats[parseInt(childId, 10)] = stats
  }
  return stats
}

export async function addStudent(child: Child): Promise<Child> {
  return await studentStore.add(child)
}

/**
 * Fetches all students from the store, updating their session stats.
 * @returns
 */
export async function getAllStudents(): Promise<Child[]> {
  const students = await studentStore.getAll()

  // Roll up the weekly and daily seconds for each child into the returned object.
  for (var i = 0; i < students.length; i++) {
    const stats = getPeriodStats(i.toString())
    const dayKey = getDayKey()
    const weekKey = getWeekKey()

    let secondsToday = stats.daily_seconds.get(dayKey) || 0
    let secondsWeek = stats.weekly_seconds.get(weekKey) || 0
    students[i].session_stats.seconds_today = secondsToday
    students[i].session_stats.seconds_week = secondsWeek

    // Include any active session for this student, assuming it started today.
    const activeSession = await sessionStore.getActiveSession(studentStore.getKey(students[i]))
    if (activeSession) {
      if (dayKey === getDayKey(activeSession.start_time)) {
        students[i].session_stats.seconds_today += activeSession.elapsed_seconds
      }

      if (weekKey === getWeekKey(activeSession.start_time)) {
        students[i].session_stats.seconds_week += activeSession.elapsed_seconds
      }
    }
  }

  return students
}

export async function getActiveSession(studentId: string): Promise<Session | undefined> {
  return await sessionStore.getActiveSession(studentId)
}

export async function endActiveSession(studentId: string): Promise<Session | undefined> {
  let activeSession = await sessionStore.getActiveSession(studentId)
  if (activeSession) {
    activeSession.end_time = new Date()
    sessionStore.updateSession(studentId, activeSession)
    // We record the seconds for this session in the day / week that the session *started*,
    // even if we're ending it later.
    const stats = getPeriodStats(studentId)

    const dayKey = getDayKey(activeSession.start_time)
    var seconds = stats.daily_seconds.get(dayKey) || 0
    stats.daily_seconds.set(dayKey, seconds + activeSession.elapsed_seconds)

    const weekKey = getWeekKey(activeSession.start_time)
    seconds = stats.weekly_seconds.get(weekKey) || 0
    stats.weekly_seconds.set(weekKey, seconds + activeSession.elapsed_seconds)

    return activeSession
  }
}

export async function startSession(studentId: string): Promise<Session> {
  // Is there a previously active session for this student that never
  // ended? If so, then end it now.
  endActiveSession(studentId)

  return await sessionStore.createSession(studentId)
}