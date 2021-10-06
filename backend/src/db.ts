import { Db as MongoDb, MongoClient, Collection } from "mongodb"
import { Child, Session } from './types';

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

  export function students(): Collection<Child> {
    return db().collection<Child>("student")
  }

  export function sessions(): Collection<Session> {
    return db().collection<Session>("sessions")
  }
}