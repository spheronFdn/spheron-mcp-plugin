#!/usr/bin/env node

/**
 * Test script for the Spheron MCP server using the MCP SDK
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the MCP server
const SERVER_PATH = path.join(__dirname, 'spheron-server/build/index.js');

// Path to the sample YAML file
const YAML_PATH = path.join(__dirname, 'sample-compute.yaml');

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

// Read the YAML file
const yamlContent = fs.readFileSync(YAML_PATH, 'utf8');

// Test the deploy_yaml operation
const testDeployYaml = () => {
  const request = {
    jsonrpc: '2.0',
    id: 3,
    method: 'callTool',
    params: {
      name: 'spheron_operation',
      arguments: {
        operation: 'deploy_yaml',
        yaml_content: yamlContent
      }
    }
  };

  console.log('Testing deploy_yaml...');
  console.log('Sending request:', JSON.stringify(request, null, 2));
  server.stdin.write(JSON.stringify(request) + '\n');
};

// Test the fetch_balance operation
const testFetchBalance = () => {
  const request = {
    jsonrpc: '2.0',
    id: 4,
    method: 'callTool',
    params: {
      name: 'spheron_operation',
      arguments: {
        operation: 'fetch_balance',
        token: 'CST'
      }
    }
  };

  console.log('Testing fetch_balance...');
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
    // Test the deploy_yaml operation
    testDeployYaml();
    
    // Wait for the deploy_yaml test to complete
    setTimeout(() => {
      // Test the fetch_balance operation
      testFetchBalance();
      
      // Wait for the fetch_balance test to complete
      setTimeout(() => {
        console.log('Tests completed, terminating server...');
        server.kill();
        process.exit(0);
      }, 5000);
    }, 5000);
  }, 2000);
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Terminating test...');
  server.kill();
  process.exit(0);
});
