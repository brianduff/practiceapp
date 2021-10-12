import { Student, Session } from './types';
import { v4 as create_uuid } from 'uuid';
import { Db } from './db';

export interface SessionStore {
  /**
   * Gets the most recent active session for the given student.
   */
  getActiveSession(studentId: string): Promise<Session | undefined>;

  /**
   * Updates the properties of a session. This can also be used to end
   * a session by setting its end date.
   */
  updateSession(studentId: string, session: Session): Promise<Session>;

  /**
   * Creates a new session for the student.
   */
  createSession(studentId: string, start_time: Date): Promise<Session>;
}

export class ArraySessionStore implements SessionStore {
  private sessionsByChildNameHash: Map<string, Map<string, Session>> = new Map()

  private getSessions(studentId: string): Map<string, Session> | undefined {
    return this.sessionsByChildNameHash.get(studentId)
  }

  getActiveSession(studentId: string): Promise<Session | undefined> {
    const sessionMap = this.getSessions(studentId)
    if (sessionMap) {
      var sessions = Array.from(sessionMap, ([_, v]) => v)
      sessions.sort((a, b) => b.start_time.getTime() - a.start_time.getTime())
      return Promise.resolve(sessions.find(s => !s.end_time))
    }

    return Promise.resolve(undefined)
  }

  updateSession(studentId: string, session: Session): Promise<Session> {
    var sessionMap = this.getSessions(studentId)

    if (sessionMap && sessionMap.has(session.id)) {
      sessionMap.set(session.id, session)
      return Promise.resolve(session)
    }

    return Promise.resolve(undefined)
  }

  createSession(studentId: string, start_time: Date): Promise<Session> {
    const session = {
      id: create_uuid(),
      start_time,
      elapsed_seconds: 0
    }
    var sessionMap = this.getSessions(studentId)
    if (!sessionMap) {
      sessionMap = new Map()
      this.sessionsByChildNameHash.set(studentId, sessionMap)
    }
    sessionMap.set(session.id, session)

    return Promise.resolve(session)
  }
}

export class MongoSessionStore implements SessionStore {
  async getActiveSession(studentId: string): Promise<Session | undefined> {
    const query = {
      student_id: studentId,
      end_time: { $eq: null }
    }

    const sessions = await Db.sessions().find(query).toArray()
    if (!sessions || sessions.length < 1) {
      return Promise.resolve(undefined)
    }

    sessions.sort((a, b) => b.start_time.getTime() - a.start_time.getTime())
    return Promise.resolve(sessions[0])
  }

  async updateSession(_: string, session: Session): Promise<Session> {
    const query = {
      id: session.id
    }

    const update = {
      $set: {
        elapsed_seconds: session.elapsed_seconds,
        end_time: session.end_time
      },
    }

    // TODO: should disallow setting fields other than end time and elapsed seconds.
    await Db.sessions().updateOne(query, update)

    return session
  }

  async createSession(studentId: string): Promise<Session> {
    const session = {
      id: create_uuid(),
      start_time: new Date(),
      elapsed_seconds: 0,
      student_id: studentId
    }

    await Db.sessions().insertOne(session)
    return Promise.resolve(session)
  }
}