const app = require('./src/index');
const port = process.env.PORT || 3000;
// const dockerManager = app.dockerManager;

// Start Docker containers before starting server
(async () => {
  // Start Docker containers
  // await dockerManager.start();

  // Start the server
  const server = app.listen(port, () => {
    console.log(`\n🚀 Server is running on port ${port}`);
    console.log(`📊 Test Runner UI: http://localhost:${port}/test-runner.html`);
    console.log(`🔍 API Health: http://localhost:${port}/api/v1/test-runner/health\n`);
  });

  // Graceful shutdown handler
  const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(async () => {
      console.log('✅ HTTP server closed');
      
      // Stop Docker containers
      // await dockerManager.stop();
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Listen for termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    const logger = require('./src/utils/logger');
    logger.error('Uncaught Exception', { error, errorStack: error.stack });
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    const logger = require('./src/utils/logger');
    const err = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('Unhandled Rejection', { error: err, errorStack: err.stack, promise: String(promise) });
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
})();

module.exports = app;