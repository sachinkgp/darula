const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);

const testRunnerController = {
  runTests: async (req, res) => {
    try {
      const { testFile } = req.body;
      
      // Set up Jest command
      const jestPath = path.join(__dirname, '../../../node_modules/.bin/jest');
      let command = `node "${jestPath}" --json --no-coverage --no-color`;
      
      if (testFile) {
        command += ` "${testFile}"`;
      }

      const projectRoot = path.join(__dirname, '../../../');
      
      try {
        const { stdout, stderr } = await execAsync(command, {
          cwd: projectRoot,
          env: { ...process.env, NODE_ENV: 'test' },
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        });

        let testResults = null;
        try {
          // Jest outputs JSON to stdout
          const jsonMatch = stdout.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            testResults = JSON.parse(jsonMatch[0]);
          } else {
            // Try parsing the entire stdout
            testResults = JSON.parse(stdout);
          }
        } catch (parseError) {
          // If parsing fails, try to extract JSON from stderr
          const stderrJsonMatch = stderr.match(/\{[\s\S]*\}/);
          if (stderrJsonMatch) {
            testResults = JSON.parse(stderrJsonMatch[0]);
          }
        }

        const success = testResults ? 
          (testResults.numFailedTests === 0 && testResults.numTotalTests > 0) : 
          false;

        res.json({
          success,
          exitCode: success ? 0 : 1,
          testResults,
          rawOutput: stdout,
          errorOutput: stderr || null
        });
      } catch (execError) {
        // execAsync throws on non-zero exit codes, but we still want the output
        let testResults = null;
        let stdout = '';
        let stderr = '';

        try {
          // Try to get output even if command failed
          const result = await execAsync(command, {
            cwd: projectRoot,
            env: { ...process.env, NODE_ENV: 'test' },
            maxBuffer: 10 * 1024 * 1024
          });
          stdout = result.stdout;
          stderr = result.stderr;
        } catch (e) {
          stdout = e.stdout || '';
          stderr = e.stderr || '';
        }

        try {
          const jsonMatch = stdout.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            testResults = JSON.parse(jsonMatch[0]);
          }
        } catch (parseError) {
          // Ignore parse errors
        }

        res.json({
          success: false,
          exitCode: 1,
          testResults,
          rawOutput: stdout,
          errorOutput: stderr || execError.message
        });
      }

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  },

  getTestFiles: async (req, res) => {
    try {
      const fs = require('fs');
      // Path from src/api/controller to src/__tests__
      const testDir = path.join(__dirname, '../../__tests__');
      const resolvedPath = path.resolve(testDir);
      
      console.log('Looking for test files in:', resolvedPath);
      
      // Check if directory exists
      if (!fs.existsSync(testDir)) {
        console.error('Test directory not found:', resolvedPath);
        return res.status(404).json({
          success: false,
          error: 'Test directory not found',
          message: `Directory ${resolvedPath} does not exist`
        });
      }

      const allFiles = fs.readdirSync(testDir);
      console.log('Files in test directory:', allFiles);
      
      const files = allFiles
        .filter(file => {
          const filePath = path.join(testDir, file);
          return file.endsWith('.test.js') && fs.statSync(filePath).isFile();
        })
        .map(file => ({
          name: file,
          path: `src/__tests__/${file}`
        }));

      console.log('Found test files:', files);
      
      res.json({
        success: true,
        testFiles: files
      });
    } catch (error) {
      console.error('Error getting test files:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get test files',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

module.exports = testRunnerController;

