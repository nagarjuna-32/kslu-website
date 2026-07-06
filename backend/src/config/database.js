const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connection established successfully via Prisma ORM.');
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
