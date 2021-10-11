import { format } from 'date-fns';
import { Db } from './db';

export enum PeriodType {
  Week,
  Day
}

export type PeriodStats = {
  student_id: string,
  period_type: PeriodType,
  period_key: string
  seconds_practiced: number,
}

export function matchesPeriod(date: Date, stats: PeriodStats): boolean {
  if (stats.period_type === PeriodType.Week) {
    return getWeekKey(date) === stats.period_key
  } else {
    return getDayKey(date) === stats.period_key
  }
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

export class MongoPeriodStatStore {
  async getPeriodStats(studentId: string, date?: Date): Promise<PeriodStats[]> {

    const weekKey = getWeekKey(date)
    const dayKey = getDayKey(date)

    const query = {
      student_id: studentId,
      period_key: {
        $in: [weekKey, dayKey]
      }
    }
    let result = await Db.periodstats().find(query).toArray()
    result.sort((a, b) => a.period_type - b.period_type)

    if (result.length < 2) {
      var defaultWeek = {
        student_id: studentId,
        period_type: PeriodType.Week,
        period_key: weekKey,
        seconds_practiced: 0
      }
      var defaultDay = {
        student_id: studentId,
        period_type: PeriodType.Day,
        period_key: dayKey,
        seconds_practiced: 0
      }

      if (result.length === 0) {
        return [defaultWeek, defaultDay]
      } else if (result[0].period_type === PeriodType.Week) {
        result.push(defaultDay)
      } else {
        result.unshift(defaultWeek)
      }
    }
    return result
  }

  async addPeriodTime(studentId: string, addSeconds: number, date?: Date): Promise<boolean> {
    let weekKey = getWeekKey(date)
    let dayKey = getDayKey(date)

    const query = {
      student_id: studentId,
      period_key: {
        $in: [weekKey, dayKey]
      }
    }

    const update = {
      $inc: {
        seconds_practiced: addSeconds
      }
    }

    let result = await Db.periodstats().updateMany(query, update)
    if (result.matchedCount === 0) {
      // Insert newbies
      var stats = [
        {
          student_id: studentId,
          period_type: PeriodType.Week,
          period_key: weekKey,
          seconds_practiced: addSeconds
        },
        {
          student_id: studentId,
          period_type: PeriodType.Day,
          period_key: dayKey,
          seconds_practiced: addSeconds
        }
      ]
      return (await Db.periodstats().insertMany(stats)).acknowledged
    }
    return result.acknowledged
  }
}