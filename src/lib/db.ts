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
      const favoriteCount = await db.favorite.count()
      const commentCount = await db.comment.count()
      const messageCount = await db.message.count()
      const watchlistCount = await db.watchlist.count()
      
      return {
        users: userCount,
        movies: movieCount,
        favorites: favoriteCount,
        comments: commentCount,
        messages: messageCount,
        watchlistItems: watchlistCount,
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
      // Clean up old messages (older than 1 year)
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      const oldMessages = await db.message.deleteMany({
        where: {
          createdAt: {
            lt: oneYearAgo
          }
        }
      })

      // Clean up old comments without content (older than 3 months)
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      
      const emptyComments = await db.comment.deleteMany({
        where: {
          AND: [
            { content: { equals: "" } },
            { createdAt: { lt: threeMonthsAgo } }
          ]
        }
      })

      return {
        oldMessages: oldMessages.count,
        emptyComments: emptyComments.count,
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