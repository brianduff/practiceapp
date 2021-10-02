import { Child } from './types';
import { Db } from './db';

/**
 * Store for students.
 */
export interface StudentStore {
  /**
   * Gets all students.
   */
  getAll(): Promise<Child[]>;

  /**
   * Adds a student to the store.
   */
  add(student: Child): Promise<Child>;
}

export class ArrayStudentStore implements StudentStore {

  private students: Child[] = [
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

  getAll(): Promise<Child[]> {
    return Promise.resolve(this.students)
  }

  add(student: Child): Promise<Child> {
    this.students.push(student)
    return Promise.resolve(student)
  }
}

export class MongoStudentStore implements StudentStore {
  async getAll(): Promise<Child[]> {
    return await Db.students().find().toArray()
  }

  async add(student: Child): Promise<Child> {
    await Db.students().insertOne(student)
    return Promise.resolve(student)
  }
}
