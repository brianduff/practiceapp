export interface Config {
  url: string
}

const PROD: Config = {
  url: 'https://perfectpractice.herokuapp.com'
}

const DEV: Config = {
  url: 'http://localhost:4000'
}

export const config = process.env.NODE_ENV === 'development' ? DEV : PROD
