#!/usr/bin/env node

/**
 * Test script for the Spheron MCP server
 * 
 * This script tests each operation of the Spheron MCP server:
 * - fetch_balance
 * - deploy_yaml
 * - fetch_deployment_urls
 * - fetch_lease_id
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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
const server = spawn('node', [SERVER_PATH], { env, stdio: ['pipe', 'pipe', 'inherit'] });

// Handle server output
let buffer = '';
server.stdout.on('data', (data) => {
  console.log('Raw server output:', data.toString());
  buffer += data.toString();
  processBuffer();
});

// Process the buffer for JSON messages
function processBuffer() {
  const lines = buffer.split('\n');
  buffer = lines.pop(); // Keep the last incomplete line in the buffer
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        console.log('Processing line:', line);
        const message = JSON.parse(line);
        console.log('Parsed message:', JSON.stringify(message, null, 2));
        handleMessage(message);
      } catch (error) {
        console.error('Error parsing JSON:', error, 'Line:', line);
      }
    }
  }
}

// Current test state
let currentTest = 'init';
let leaseId = null;

// Handle MCP messages
function handleMessage(message) {
  if (message.jsonrpc !== '2.0') {
    console.log('Ignoring non-jsonrpc message:', message);
    return;
  }
  
  if (message.method === 'initialize') {
    // Server is ready, start testing
    console.log('Server initialized, starting tests...');
    runNextTest();
  } else if (message.result && currentTest) {
    // Handle test results
    console.log(`Test ${currentTest} completed with result:`, JSON.stringify(message.result, null, 2));
    
    if (currentTest === 'deploy_yaml' && message.result.content[0].text) {
      try {
        const result = JSON.parse(message.result.content[0].text);
        console.log('Parsed deploy_yaml result:', JSON.stringify(result, null, 2));
        if (result.success && result.leaseId) {
          leaseId = result.leaseId;
          console.log(`Deployment created with lease ID: ${leaseId}`);
        }
      } catch (error) {
        console.error('Error parsing deployment result:', error);
      }
    }
    
    // Move to the next test
    currentTest = null;
    setTimeout(runNextTest, 1000);
  } else {
    console.log('Unhandled message:', JSON.stringify(message, null, 2));
  }
}

// Run the next test in sequence
function runNextTest() {
  if (currentTest) return; // A test is already running
  
  if (!leaseId) {
    // First test: fetch balance
    currentTest = 'fetch_balance';
    console.log('Testing fetch_balance...');
    sendRequest({
      name: 'spheron_operation',
      arguments: {
        operation: 'fetch_balance',
        token: 'CST'
      }
    });
  } else if (currentTest === 'fetch_balance') {
    // Second test: fetch deployment URLs
    currentTest = 'fetch_deployment_urls';
    console.log('Testing fetch_deployment_urls...');
    sendRequest({
      name: 'spheron_operation',
      arguments: {
        operation: 'fetch_deployment_urls',
        lease_id: leaseId
      }
    });
  } else if (currentTest === 'fetch_deployment_urls') {
    // Third test: fetch lease ID
    currentTest = 'fetch_lease_id';
    console.log('Testing fetch_lease_id...');
    sendRequest({
      name: 'spheron_operation',
      arguments: {
        operation: 'fetch_lease_id',
        lease_id: leaseId
      }
    });
  } else if (currentTest === 'fetch_lease_id') {
    // All tests completed
    console.log('All tests completed successfully!');
    server.kill();
    process.exit(0);
  } else {
    // Initial test: deploy YAML
    currentTest = 'deploy_yaml';
    console.log('Testing deploy_yaml...');
    
    // Read the YAML file
    const yamlContent = fs.readFileSync(YAML_PATH, 'utf8');
    
    sendRequest({
      name: 'spheron_operation',
      arguments: {
        operation: 'deploy_yaml',
        yaml_content: yamlContent
      }
    });
  }
}

// Send a request to the MCP server
function sendRequest(params) {
  const request = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'callTool',
    params
  };
  
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Initialize the server
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    capabilities: {
      tools: true
    }
  }
};

server.stdin.write(JSON.stringify(initRequest) + '\n');

// Handle process termination
process.on('SIGINT', () => {
  console.log('Terminating test...');
  server.kill();
  process.exit(0);
});
