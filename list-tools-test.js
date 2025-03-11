#!/usr/bin/env node

/**
 * Test script for the Spheron MCP server
 * 
 * This script lists the available tools and then tests one of them
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Path to the MCP server
const SERVER_PATH = path.join(__dirname, 'spheron-server/build/index.js');

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

// List tools request
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'listTools',
  params: {}
};

// Wait for the server to start
setTimeout(() => {
  console.log('Initializing server...');
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  
  // Wait for initialization to complete
  setTimeout(() => {
    console.log('Listing tools...');
    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    
    // Wait for the test to complete
    setTimeout(() => {
      console.log('Test completed, terminating server...');
      server.kill();
      process.exit(0);
    }, 5000);
  }, 2000);
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Terminating test...');
  server.kill();
  process.exit(0);
});
