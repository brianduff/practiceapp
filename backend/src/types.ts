

export interface Child {
  picture: string,
  name: string,
  total_seconds: number,
  logged_in?: boolean
}

export type Session = {
  elapsed_seconds: number,
  start_time: Date,
  end_time: Date
}
