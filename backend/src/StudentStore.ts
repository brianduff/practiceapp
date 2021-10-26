import { Student } from './types';
import { Db } from './db';
import { ObjectId } from 'mongodb';
import { de } from 'date-fns/locale';

/**
 * Store for students.
 */
export interface StudentStore {
  /**
   * Gets all students.
   */
  getAll(): Promise<Student[]>;

  /**
   * Adds a student to the store.
   */
  add(student: Student): Promise<Student>;

  update(student: Student): Promise<Student>;

  getKey(student: Student): string;
}

export class ArrayStudentStore implements StudentStore {

  private students: Student[] = [
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

  getAll(): Promise<Student[]> {
    return Promise.resolve(this.students)
  }

  add(student: Student): Promise<Student> {
    this.students.push(student)
    return Promise.resolve(student)
  }

  update(student: Student): Promise<Student> {
    // TODO
    return Promise.resolve(student)
  }

  getKey(student: Student): string {
    for (var i = 0; i < this.students.length; i++) {
      if (this.students[i] === student) {
        return i.toString()
      }
    }
    return "-1"
  }
}

interface MongoStudent extends Student {
  _id: ObjectId
}

export class MongoStudentStore implements StudentStore {
  async getAll(): Promise<Student[]> {
    return await Db.students().find().toArray()
  }

  async add(student: Student): Promise<Student> {
    await Db.students().insertOne(student)
    return student
  }

  async update(student: Student): Promise<Student> {
    console.log("Update student", student);

    delete (student as MongoStudent)._id

    const result = await Db.students().replaceOne({
      _id: new ObjectId(student.id)
    }, student)


    console.log("Result", result)

    return student
  }

  getKey(student: Student): string {
    return (student as MongoStudent)._id.toHexString()
  }
}
