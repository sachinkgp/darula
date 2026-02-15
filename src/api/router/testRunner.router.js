const router = require('express').Router();
const testRunnerController = require('../controller/testRunner.controller');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Test runner API is running' });
});

router.post('/run', testRunnerController.runTests);
router.get('/files', testRunnerController.getTestFiles);

module.exports = router;

