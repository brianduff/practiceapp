import cors from 'cors';
import { Session } from './types';
import express from 'express';
import { Request, Response } from 'express';
import { getAllStudents, startSession, getActiveSession, endActiveSession } from './Students';
import * as sourceMapSupport from 'source-map-support';

sourceMapSupport.install()

const app = express()
app.use(express.json())
app.use(cors())

interface PostSessionParams {
  childId: number
}
// Creates a new session for this child. No body is required, returns
// the new session.
// Note that as a side effect of calling this, session_stats for the child
// may change because of a dangling previous session that was never ended.
app.post("/api/children/:childId/session", (req: Request<PostSessionParams, {}, Session, {}>, res: Response) => {
  res.json(startSession(req.params.childId))
})

interface SessionParams extends PostSessionParams {
  sessionId: string
}
// Updates a session's elapsed seconds. Only works if sessionId represents an active
// session, and updates to other fields are ignored.
app.put("/api/children/:childId/session/:sessionId", (req: Request<SessionParams, {}, Session, {}>, res: Response) => {
  var session = getActiveSession(req.params.childId)
  if (!session || session.id !== req.params.sessionId) {
    res.sendStatus(404)
    return
  }

  session.elapsed_seconds = req.body.elapsed_seconds

  res.json(session)
})

app.delete("/api/children/:childId/session/:sessionId", (req: Request<SessionParams, {}, {}, {}>, res: Response) => {
  var session = getActiveSession(req.params.childId)
  if (!session || session.id !== req.params.sessionId) {
    res.sendStatus(404)
    return
  }

  res.json(endActiveSession(req.params.childId))
})

app.get("/api/children", (_: Request, res: Response) => {
  // Sort the children by their practice time, descending.
  var students = getAllStudents()
  students.sort((a, b) => b.session_stats.seconds_week - a.session_stats.seconds_week)

  res.json(students)
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`)
})

