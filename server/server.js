import app from './src/app.js'
import { connectDB } from './src/config/db.js'
import { env } from './src/config/env.js'

const basePort = Number(env.PORT || 5000)

async function bindWithFallback(port, attemptsLeft = 5) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port)

    server.once('listening', () => {
      console.log(`API running on http://localhost:${port}`)
      resolve(server)
    })

    server.once('error', (err) => {
      if (err?.code === 'EADDRINUSE' && attemptsLeft > 0) {
        const nextPort = port + 1
        console.warn(`Port ${port} is in use. Trying ${nextPort}...`)

        setTimeout(() => {
          bindWithFallback(nextPort, attemptsLeft - 1)
            .then(resolve)
            .catch(reject)
        }, 200)

        return
      }

      reject(err)
    })
  })
}

async function start() {
  try {
    await connectDB()
  } catch (err) {
    console.error('MongoDB connection failed:', err?.message || err)
    process.exit(1)
  }

  try {
    await bindWithFallback(basePort, 10)
  } catch (err) {
    console.error('Failed to start API:', err?.message || err)
    process.exit(1)
  }
}

start()