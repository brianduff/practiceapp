import { Db as MongoDb, MongoClient, Collection } from "mongodb"
import { PeriodStats } from "./PeriodStatStore";
import { RobotState } from "./robots";
import { Student, Session } from './types';

const DATABASE = "practice"

// Could we write this as an interface, and have an implementation
// that uses mongo, and another that just stores stuff locally.

export namespace Db {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost"
  let dbClient: MongoClient

  export async function init() {
    dbClient = await MongoClient.connect(mongoUri)
    console.log("Connected to mongo", mongoUri)
  }

  export function getClient(): MongoClient | undefined {
    return dbClient
  }

  function db(): MongoDb {
    return dbClient.db(DATABASE)
  }

  export function students(): Collection<Student> {
    return db().collection<Student>("student")
  }

  export function sessions(): Collection<Session> {
    return db().collection<Session>("sessions")
  }

  export function periodstats(): Collection<PeriodStats> {
    return db().collection<PeriodStats>("periodstats")
  }

  export function robots(): Collection<RobotState> {
    return db().collection<RobotState>("robotstate")
  }
}