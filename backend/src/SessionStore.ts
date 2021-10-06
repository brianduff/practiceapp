import { Child, Session } from './types';
import { v4 as create_uuid } from 'uuid';

export interface SessionStore {
  /**
   * Gets the most recent active session for the given student.
   */
  getActiveSession(studentId: string): Promise<Session>;

  /**
   * Updates the properties of a session. This can also be used to end
   * a session by setting its end date.
   */
  updateSession(studentId: string, session: Session): Promise<Session>;

  /**
   * Creates a new session for the student.
   */
  createSession(studentId: string): Promise<Session>;
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

  createSession(studentId: string): Promise<Session> {
    const session = {
      id: create_uuid(),
      start_time: new Date(),
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