import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development
export const db = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}

// Database utility functions
export const dbUtils = {
  // Connection health check
  async healthCheck() {
    try {
      await db.$queryRaw`SELECT 1`
      return { status: 'healthy', timestamp: new Date() }
    } catch (error) {
      return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date() }
    }
  },

  // Graceful shutdown
  async disconnect() {
    await db.$disconnect()
  },

  // Database statistics
  async getStats() {
    try {
      const userCount = await db.user.count()
      const movieCount = await db.movie.count()
      const voteCount = await db.vote.count()
      const commentCount = await db.comment.count()
      
      return {
        users: userCount,
        movies: movieCount,
        votes: voteCount,
        comments: commentCount,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error fetching database stats:', error)
      return null
    }
  },

  // Clean up old data
  async cleanupOldData() {
    try {
      // Clean up expired user sessions
      const expiredSessions = await db.userSession.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      })

      // Clean up old activity logs (older than 6 months)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      const oldActivities = await db.userActivity.deleteMany({
        where: {
          createdAt: {
            lt: sixMonthsAgo
          }
        }
      })

      return {
        expiredSessions: expiredSessions.count,
        oldActivities: oldActivities.count,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error during cleanup:', error)
      return null
    }
  }
}

// Export types for use in other files
export type Database = typeof db