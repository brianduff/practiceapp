import { Student, Session } from './types';
import { StudentStore, MongoStudentStore } from './StudentStore';
import { SessionStore, MongoSessionStore } from './SessionStore';
import { matchesPeriod, MongoPeriodStatStore } from './PeriodStatStore';
import { launchTheRobots } from './robots'

export const studentStore: StudentStore = new MongoStudentStore()
const sessionStore: SessionStore = new MongoSessionStore()
export const periodStatStore = new MongoPeriodStatStore()

export async function addStudent(child: Student): Promise<Student> {
  return await studentStore.add(child)
}

/**
 * Fetches all students from the store, updating their session stats.
 * @returns
 */
export async function getAllStudents(): Promise<Student[]> {
  const students = await studentStore.getAll()

  await launchTheRobots(students)

  // Roll up the weekly and daily seconds for each child into the returned object.
  for (var i = 0; i < students.length; i++) {
    const studentKey = studentStore.getKey(students[i])
    const [weekStats, dayStats] = await periodStatStore.getPeriodStats(studentKey)

    students[i].session_stats.seconds_today = dayStats?.seconds_practiced
    students[i].session_stats.seconds_week = weekStats?.seconds_practiced

    // Include any active session for this student, assuming it started today.
    const activeSession = await sessionStore.getActiveSession(studentKey)
    if (activeSession) {
      if (matchesPeriod(activeSession.start_time, dayStats)) {
        students[i].session_stats.seconds_today += activeSession.elapsed_seconds
      }

      if (matchesPeriod(activeSession.start_time, weekStats)) {
        students[i].session_stats.seconds_week += activeSession.elapsed_seconds
      }
    }

    students[i].id = studentKey
  }

  return students
}

export async function updateSession(studentId: string, session: Session): Promise<Session> {
  return await sessionStore.updateSession(studentId, session)
}

export async function getActiveSession(studentId: string): Promise<Session | undefined> {
  return await sessionStore.getActiveSession(studentId)
}

export async function endActiveSession(studentId: string, end_time: Date = new Date()): Promise<Session | undefined> {
  let activeSession = await sessionStore.getActiveSession(studentId)
  if (activeSession) {
    activeSession.end_time = end_time
    sessionStore.updateSession(studentId, activeSession)
    // We record the seconds for this session in the day / week that the session *started*,
    // even if we're ending it later.
    periodStatStore.addPeriodTime(studentId, activeSession.elapsed_seconds, activeSession.start_time)

    return activeSession
  }
}

export async function startSession(studentId: string, start_time: Date = new Date()): Promise<Session> {
  // Is there a previously active session for this student that never
  // ended? If so, then end it now.
  endActiveSession(studentId)

  return await sessionStore.createSession(studentId, start_time)
}