const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const execAsync = promisify(exec);

const projectRoot = path.join(__dirname, '../../');

// Helper function to run command with interactive sudo
const runWithSudo = (command, args, options) => {
  return new Promise((resolve, reject) => {
    console.log('🔐 Sudo password required. Please enter your password:');
    const sudoProcess = spawn('sudo', [command, ...args], {
      ...options,
      stdio: 'inherit', // This allows interactive password entry
      cwd: projectRoot,
      env: process.env
    });

    sudoProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    sudoProcess.on('error', (error) => {
      reject(error);
    });
  });
};

const dockerManager = {
  start: async () => {
    try {
      console.log('🐳 Starting Docker containers...');
      
      // First try without sudo
      try {
        const { stdout, stderr } = await execAsync('docker-compose up -d', {
          cwd: projectRoot,
          env: process.env
        });

        if (stdout) console.log(stdout);
        if (stderr && !stderr.includes('Creating') && !stderr.includes('Starting')) {
          console.warn('Docker warning:', stderr);
        }

        // Wait a bit for containers to be ready
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check if containers are running
        try {
          const { stdout: psOutput } = await execAsync('docker-compose ps', {
            cwd: projectRoot
          });
          console.log('📦 Container status:');
          console.log(psOutput);
        } catch (error) {
          // Ignore ps errors
        }

        console.log('✅ Docker containers started');
        return true;
      } catch (error) {
        // Check if it's a permission error
        if (error.message.includes('permission denied') || error.message.includes('Cannot connect')) {
          console.warn('⚠️  Docker permission issue. Trying with sudo...');
          console.log('🔐 You will be prompted for your sudo password...');
          
          try {
            await runWithSudo('docker-compose', ['up', '-d']);
            
            // Wait a bit for containers to be ready
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log('✅ Docker containers started (with sudo)');
            return true;
          } catch (sudoError) {
            console.error('❌ Failed to start Docker containers with sudo:', sudoError.message);
            console.error('💡 Please run manually: sudo docker-compose up -d');
            return false;
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Failed to start Docker containers:', error.message);
      console.error('💡 Please run manually: docker-compose up -d');
      return false;
    }
  },

  stop: async () => {
    try {
      console.log('🐳 Stopping Docker containers...');
      
      // First try without sudo
      try {
        const { stdout, stderr } = await execAsync('docker-compose down', {
          cwd: projectRoot,
          env: process.env
        });

        if (stdout) console.log(stdout);
        if (stderr && !stderr.includes('Stopping') && !stderr.includes('Removing')) {
          console.warn('Docker warning:', stderr);
        }

        console.log('✅ Docker containers stopped');
        return true;
      } catch (error) {
        // Try with sudo if permission denied
        if (error.message.includes('permission denied') || error.message.includes('Cannot connect')) {
          try {
            console.log('⚠️  Trying with sudo...');
            console.log('🔐 You may be prompted for your sudo password...');
            
            await runWithSudo('docker-compose', ['down']);
            
            console.log('✅ Docker containers stopped (with sudo)');
            return true;
          } catch (sudoError) {
            console.error('❌ Failed to stop Docker containers:', sudoError.message);
            console.error('💡 Please run manually: sudo docker-compose down');
            return false;
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Failed to stop Docker containers:', error.message);
      console.error('💡 Please run manually: docker-compose down');
      return false;
    }
  },

  checkStatus: async () => {
    try {
      const { stdout } = await execAsync('docker-compose ps', {
        cwd: projectRoot
      });
      return stdout;
    } catch (error) {
      return null;
    }
  }
};

module.exports = dockerManager;

