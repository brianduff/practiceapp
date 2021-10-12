export type Goals = {
  daily_seconds: number
}

/** Controls for the robotz */
export interface Range {
  min: number,
  max: number
}

export interface RobotPracticeTime {
  start_hour: number,
  start_minute: number,
  duration_minutes: number
}

export interface RobotSettings {
  /** The schedules for this robot in crontab format. */
  week_day_practice_time: RobotPracticeTime,
  weekend_practice_time: RobotPracticeTime,
  /** The probability of skipping a scheduled practice session altogether. */
  p_skip: number,
  /** The probability of practicing for extra time */
  p_extra_time: number,
  /** The probability of practicing for less time */
  p_less_time: number,
}

export interface Student {
  id?: string,
  picture: string,
  name: string,
  logged_in?: boolean,
  goals?: Goals,
  session_stats: SessionStats,
  robot_controls?: RobotSettings
}

export type Session = {
  id?: string,
  elapsed_seconds: number,
  start_time: Date,
  end_time?: Date
}

export type SessionStats = {
  seconds_today: number,
  seconds_week: number
}
