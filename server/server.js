import app from './src/app.js'
import { connectDB } from './src/config/db.js'
import { env } from './src/config/env.js'

let basePort = Number(env.PORT || 5000)

async function bindWithFallback(port, attemptsLeft = 5) {
  return new Promise((resolve, reject) => {
    const server = app
      .listen(port, () => {
        console.log(`API running on http://localhost:${port}`)
        resolve(server)
      })
      .on('error', (err) => {
        if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
          const nextPort = port + 1
          console.warn(`Port ${port} in use. Trying ${nextPort}…`)
          // Small delay before retrying to avoid tight loop
          setTimeout(() => {
            bindWithFallback(nextPort, attemptsLeft - 1).then(resolve).catch(reject)
          }, 200)
        } else {
          reject(err)
        }
      })
  })
}

async function start() {
  try {
    await connectDB()
  } catch (err) {
    console.warn('DB connection skipped or failed:', err?.message || err)
  }
  try {
    await bindWithFallback(basePort, 10)
  } catch (err) {
    console.error('Failed to start API:', err?.message || err)
    process.exit(1)
  }
}

start()