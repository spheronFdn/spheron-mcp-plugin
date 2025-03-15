#!/usr/bin/env node

/**
 * Spheron Protocol MCP Server
 * 
 * This MCP server integrates with the Spheron Protocol SDK to provide:
 * - Deployment of compute resources
 * - Fetching wallet balances
 * - Fetching deployment URLs
 * - Fetching lease IDs
 * - Deploying custom YAML files
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { SpheronSDK } from "@spheron/protocol-sdk";
import pkg from 'fs-extra';
const { readFile } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Environment variables for Spheron SDK
const SPHERON_PRIVATE_KEY = process.env.SPHERON_PRIVATE_KEY;
const SPHERON_NETWORK = process.env.SPHERON_NETWORK || "testnet";
const DEFAULT_PROVIDER_PROXY_URL = process.env.PROVIDER_PROXY_URL || "https://provider-proxy.spheron.network";

// Initialize Spheron SDK
let spheronSDK: SpheronSDK;

try {
  if (!SPHERON_PRIVATE_KEY) {
    throw new Error("SPHERON_PRIVATE_KEY environment variable is required");
  }
  
  console.error('[Setup] Initializing Spheron SDK...');
  spheronSDK = new SpheronSDK(SPHERON_NETWORK as any, SPHERON_PRIVATE_KEY);
  console.error('[Setup] Spheron SDK initialized successfully');
} catch (error) {
  console.error('[Error] Failed to initialize Spheron SDK:', error);
  process.exit(1);
}

/**
 * Create an MCP server with capabilities for tools to interact with Spheron Protocol
 */
const server = new Server(
  {
    name: "Spheron-MCP",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler that lists available tools.
 * Exposes a single "spheron_operation" tool that lets clients interact with Spheron Protocol.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "spheron_operation",
        description: "Perform operations with Spheron Protocol",
        inputSchema: {
          type: "object",
          properties: {
            operation: {
              type: "string",
              enum: ["deploy_compute", "fetch_balance", "fetch_deployment_urls", "fetch_lease_id", "deploy_yaml"],
              description: "The operation to perform"
            },
            yaml_content: {
              type: "string",
              description: "YAML content for deployment (for deploy operations)"
            },
            yaml_path: {
              type: "string",
              description: "Path to YAML file (alternative to yaml_content)"
            },
            token: {
              type: "string",
              description: "Token symbol (e.g., 'CST', 'USDC') for balance operations"
            },
            wallet_address: {
              type: "string",
              description: "Wallet address to check (defaults to authenticated wallet)"
            },
            lease_id: {
              type: "string",
              description: "ID of the lease/deployment"
            },
            provider_proxy_url: {
              type: "string",
              description: "URL for the provider proxy server (defaults to environment variable)"
            }
          },
          required: ["operation"]
        }
      }
    ]
  };
});

/**
 * Handler for the spheron_operation tool.
 * Routes to different operations based on the operation parameter.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "spheron_operation") {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${request.params.name}`
    );
  }

  const args = request.params.arguments || {};
  const operation = args.operation as string;
  const providerProxyUrl = args.provider_proxy_url as string || DEFAULT_PROVIDER_PROXY_URL;

  try {
    console.error(`[API] Executing operation: ${operation}`);
    
    switch (operation) {
      case "deploy_compute":
      case "deploy_yaml": {
        // Get YAML content either directly or from file
        let yamlContent: string;
        
        if (args.yaml_content) {
          yamlContent = args.yaml_content as string;
        } else if (args.yaml_path) {
          const yamlPath = args.yaml_path as string;
          try {
            yamlContent = await readFile(yamlPath, 'utf8');
          } catch (error) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Failed to read YAML file: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        } else {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Either yaml_content or yaml_path must be provided"
          );
        }

        console.error('[API] Creating deployment with Spheron SDK');
        const deploymentResult = await spheronSDK.deployment.createDeployment(
          yamlContent,
          providerProxyUrl
        );

        // Handle BigInt serialization
        const safeResult = JSON.parse(JSON.stringify(deploymentResult, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value
        ));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              leaseId: safeResult.leaseId,
              message: `Deployment created successfully with lease ID: ${safeResult.leaseId}`
            }, null, 2)
          }]
        };
      }

      case "fetch_balance": {
        const token = args.token as string;
        const walletAddress = args.wallet_address as string;
        
        if (!token) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Token symbol is required"
          );
        }

        console.error(`[API] Fetching balance for token: ${token}`);
        const balance = await spheronSDK.escrow.getUserBalance(token, walletAddress);

        // Handle BigInt serialization
        const safeBalance = JSON.parse(JSON.stringify(balance, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value
        ));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              balance: {
                lockedBalance: safeBalance.lockedBalance,
                unlockedBalance: safeBalance.unlockedBalance,
                token: safeBalance.token
              }
            }, null, 2)
          }]
        };
      }

      case "fetch_deployment_urls": {
        const leaseId = args.lease_id as string;
        
        if (!leaseId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Lease ID is required"
          );
        }

        console.error(`[API] Fetching deployment details for lease ID: ${leaseId}`);
        const deploymentDetails = await spheronSDK.deployment.getDeployment(leaseId, providerProxyUrl);

        // Handle BigInt serialization
        const safeDetails = JSON.parse(JSON.stringify(deploymentDetails, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value
        ));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              deploymentDetails: safeDetails
            }, null, 2)
          }]
        };
      }

      case "fetch_lease_id": {
        const leaseId = args.lease_id as string;
        
        if (!leaseId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Lease ID is required"
          );
        }

        console.error(`[API] Fetching lease details for lease ID: ${leaseId}`);
        const leaseDetails = await spheronSDK.leases.getLeaseDetails(leaseId);

        // Handle BigInt serialization
        const safeLeaseDetails = JSON.parse(JSON.stringify(leaseDetails, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value
        ));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              leaseDetails: safeLeaseDetails
            }, null, 2)
          }]
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown operation: ${operation}`
        );
    }
  } catch (error) {
    console.error('[Error] Operation failed:', error);
    
    // Ensure error is properly serialized
    let errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's a BigInt serialization error and provide a more helpful message
    if (errorMessage.includes("BigInt") && errorMessage.includes("serialize")) {
      errorMessage = "BigInt serialization error in response data. This has been fixed in the latest version.";
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: false,
          error: errorMessage
        }, null, 2)
      }],
      isError: true
    };
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  console.error('[Setup] Starting Spheron MCP server...');
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[Setup] Spheron MCP server running on stdio');
}

main().catch((error) => {
  console.error("[Error] Server error:", error);
  process.exit(1);
});
