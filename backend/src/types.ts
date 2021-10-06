export type Goals = {
  daily_seconds: number
}

export interface Student {
  id?: string,
  picture: string,
  name: string,
  logged_in?: boolean,
  goals?: Goals,
  session_stats: SessionStats
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
