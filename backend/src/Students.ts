import { Child, Session } from './types';
import { format } from 'date-fns';
import { v4 as create_uuid } from 'uuid';

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

// childId -> currently active session for that child
var activeSessions: Session[] = [
  null,
  null,
  null
]

var students: Child[] = [
  {
    name: "Michael",
    picture: "https://storage.googleapis.com/discobubble-quiz/IMG_2071.jpg",
    logged_in: true,
    goals: {
      daily_seconds: 30
    },
    session_stats: {
      seconds_today: 0,
      seconds_week: 0
    }
  },
  {
    name: "Caitlin",
    picture: "https://storage.googleapis.com/discobubble-quiz/IMG_3196.jpg",
    logged_in: true,
    goals: {
      daily_seconds: 1800
    },
    session_stats: {
      seconds_today: 0,
      seconds_week: 0
    }
  },
  {
    name: "Dan",
    picture: "https://storage.googleapis.com/discobubble-quiz/country_detail_pokemon.png",
    session_stats: {
      seconds_today: 0,
      seconds_week: 0
    }
  }
]

function getPeriodStats(childId: number): PeriodStats {
  let stats = periodStats[childId]
  if (!stats) {
    stats = {
      daily_seconds: new Map(),
      weekly_seconds: new Map()
    }
    periodStats[childId] = stats
  }
  return stats
}

export function getAllStudents(): Child[] {
  // Roll up the weekly and daily seconds for each child into the returned object.
  for (var i = 0; i < students.length; i++) {
    const stats = getPeriodStats(i);
    const dayKey = getDayKey()
    const weekKey = getWeekKey()

    console.log("Keys:", { dayKey, weekKey, stats })

    let secondsToday = stats.daily_seconds.get(dayKey) || 0
    let secondsWeek = stats.weekly_seconds.get(weekKey) || 0
    students[i].session_stats.seconds_today = secondsToday
    students[i].session_stats.seconds_week = secondsWeek

    // Include any active session for this student, assuming it started today.
    const activeSession = activeSessions[i]
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

export function getActiveSession(studentId: number): Session | undefined {
  return activeSessions[studentId]
}

export function endActiveSession(studentId: number): Session | undefined {
  let activeSession = activeSessions[studentId]
  if (activeSession) {
    activeSession.end_time = new Date()
    // We record the seconds for this session in the day / week that the session *started*,
    // even if we're ending it later.
    const stats = getPeriodStats(studentId)

    const dayKey = getDayKey(activeSession.start_time)
    var seconds = stats.daily_seconds.get(dayKey) || 0
    stats.daily_seconds.set(dayKey, seconds + activeSession.elapsed_seconds)

    const weekKey = getWeekKey(activeSession.start_time)
    seconds = stats.weekly_seconds.get(weekKey) || 0
    stats.weekly_seconds.set(weekKey, seconds + activeSession.elapsed_seconds)

    activeSessions[studentId] = null

    return activeSession
  }
}

export function startSession(studentId: number): Session {
  // Is there a previously active session for this student that never
  // ended? If so, then end it now.
  endActiveSession(studentId)

  const session = {
    id: create_uuid(),
    start_time: new Date(),
    elapsed_seconds: 0
  }
  activeSessions[studentId] = session

  return session
}