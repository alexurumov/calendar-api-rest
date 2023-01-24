import mongoose from 'mongoose'
import * as dotenv from 'dotenv'

dotenv.config()

const DB_CONNECTION_STRING: string = process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27018'
const DB_NAME: string = process.env.DB_NAME || 'calendar-api'
const DB_USERNAME: string = process.env.DB_USERNAME || 'root'
const DB_PASS: string = process.env.DB_PASS || 'passroot'

export const databaseConfig = async (): Promise<void> => {
  const _uri = `mongodb://${DB_CONNECTION_STRING}/${DB_NAME}`
  try {
    await mongoose.connect(_uri, {
      authSource: 'admin',
      user: DB_USERNAME,
      pass: DB_PASS
    })
    console.log('DB Connected!')
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`>>> DB Error: ${err}`)
  }
}
