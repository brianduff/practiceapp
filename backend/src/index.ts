import cors from 'cors';
import { Child, Session } from './types';
import express from 'express';
import { Request, Response } from 'express';
import { addStudent, getAllStudents, startSession, getActiveSession, endActiveSession } from './Students';
import * as sourceMapSupport from 'source-map-support';
import { Db } from './db';

Db.init()

sourceMapSupport.install()

const app = express()
app.use(express.json())
app.use(cors())

interface PostSessionParams {
  childId: string
}
// Creates a new session for this child. No body is required, returns
// the new session.
// Note that as a side effect of calling this, session_stats for the child
// may change because of a dangling previous session that was never ended.
app.post("/api/children/:childId/session", async (req: Request<PostSessionParams, {}, Session, {}>, res: Response) => {
  res.json(await startSession(req.params.childId))
})

interface SessionParams extends PostSessionParams {
  sessionId: string
}
// Updates a session's elapsed seconds. Only works if sessionId represents an active
// session, and updates to other fields are ignored.
app.put("/api/children/:childId/session/:sessionId", async (req: Request<SessionParams, {}, Session, {}>, res: Response) => {
  var session = await getActiveSession(req.params.childId)
  if (!session || session.id !== req.params.sessionId) {
    res.sendStatus(404)
    return
  }

  session.elapsed_seconds = req.body.elapsed_seconds

  res.json(session)
})

app.delete("/api/children/:childId/session/:sessionId", async (req: Request<SessionParams, {}, {}, {}>, res: Response) => {
  var session = await getActiveSession(req.params.childId)
  if (!session || session.id !== req.params.sessionId) {
    res.sendStatus(404)
    return
  }

  res.json(await endActiveSession(req.params.childId))
})

app.get("/api/children", async (_: Request, res: Response<Child[], {}>) => {
  res.json(await getAllStudents())
})

app.post("/api/children", async (req: Request<{}, {}, Child, {}>, res: Response<Child, {}>) => {
  res.json(await addStudent(req.body))
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`)
})

