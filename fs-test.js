#!/usr/bin/env node

/**
 * Test script for the fs-extra fix
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the MCP server
const SERVER_PATH = path.join(__dirname, 'spheron-server/build/index.js');

// Create a temporary YAML file
const TEMP_YAML_PATH = path.join(__dirname, 'temp-test.yaml');
fs.writeFileSync(TEMP_YAML_PATH, 'test: true');

// Environment variables for the server
const env = {
  ...process.env,
  SPHERON_PRIVATE_KEY: 'bbaeebbdf3c4785e8720b22611dc3a4b2566aba0c2425fd94ffcf01319d0ea3f',
  SPHERON_NETWORK: 'testnet',
  PROVIDER_PROXY_URL: 'https://provider-proxy.spheron.network'
};

// Start the MCP server
console.log('Starting Spheron MCP server...');
const server = spawn('node', [SERVER_PATH], { env, stdio: ['pipe', 'pipe', 'pipe'] });

// Handle server output
server.stdout.on('data', (data) => {
  console.log('Server stdout:', data.toString());
});

server.stderr.on('data', (data) => {
  console.log('Server stderr:', data.toString());
});

// Test the deploy_yaml operation with a file path
const testDeployYamlWithPath = () => {
  const request = {
    jsonrpc: '2.0',
    id: 3,
    method: 'callTool',
    params: {
      name: 'spheron_operation',
      arguments: {
        operation: 'deploy_yaml',
        yaml_path: TEMP_YAML_PATH
      }
    }
  };

  console.log('Testing deploy_yaml with file path...');
  console.log('Sending request:', JSON.stringify(request, null, 2));
  server.stdin.write(JSON.stringify(request) + '\n');
};

// Initialize the server
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '0.1.0',
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    },
    capabilities: {
      tools: true
    }
  }
};

// Wait for the server to start
setTimeout(() => {
  console.log('Initializing server...');
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  
  // Wait for initialization to complete
  setTimeout(() => {
    // Test the deploy_yaml operation with a file path
    testDeployYamlWithPath();
    
    // Wait for the test to complete
    setTimeout(() => {
      console.log('Test completed, terminating server...');
      // Clean up the temporary file
      fs.unlinkSync(TEMP_YAML_PATH);
      server.kill();
      process.exit(0);
    }, 5000);
  }, 2000);
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Terminating test...');
  // Clean up the temporary file
  if (fs.existsSync(TEMP_YAML_PATH)) {
    fs.unlinkSync(TEMP_YAML_PATH);
  }
  server.kill();
  process.exit(0);
});
