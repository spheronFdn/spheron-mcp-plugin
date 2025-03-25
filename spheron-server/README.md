# Spheron-MCP Server

The MCP server to interact with Spheron Network

This is a TypeScript-based MCP server that provides integration with the Spheron Protocol SDK, allowing you to deploy compute resources, check wallet balances, and manage deployments directly through Claude.

## Features

### Tools

- `deploy_compute` - Deploy compute resources using YAML configuration
- `get_wallet_balance` - Check your wallet balance for different tokens
- `get_deployment_urls` - Get URLs for your active deployments
- `get_lease_details` - Get detailed information about a lease

## Development

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run watch
```

## Docker

A Docker image is available for easy deployment. The image is available on Docker Hub as `saurrx/spheron-mcp-v2:latest`.

### Building the Docker Image

```bash
# Build the Docker image
docker build -t saurrx/spheron-mcp-v2:latest .

# Run the Docker container
docker run -d --name spheron-mcp-container \
  -e SPHERON_PRIVATE_KEY=your-spheron-private-key \
  -e SPHERON_NETWORK=testnet \
  -e PROVIDER_PROXY_URL=https://provider-proxy.spheron.network \
  -e YAML_API_URL=http://provider.cpu.gpufarm.xyz:32692/generate \
  saurrx/spheron-mcp-v2:latest
```

## Installation

### Claude Desktop Configuration

Add the server config to your Claude Desktop configuration file:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`
On Linux: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "spheron": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "SPHERON_PRIVATE_KEY",
        "-e",
        "SPHERON_NETWORK",
        "-e",
        "PROVIDER_PROXY_URL",
        "-e",
        "YAML_API_URL",
        "saurrx/spheron-mcp-v2:latest"
      ],
      "env": {
        "SPHERON_PRIVATE_KEY": "your-spheron-private-key",
        "SPHERON_NETWORK": "testnet",
        "PROVIDER_PROXY_URL": "https://provider-proxy.spheron.network",
        "YAML_API_URL": "http://provider.cpu.gpufarm.xyz:32692/generate"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### VS Code / Cursor Configuration

For VS Code or Cursor, add the server config to the appropriate settings file:

VS Code: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
Cursor: `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

## Environment Variables

- `SPHERON_PRIVATE_KEY`: Your Spheron private key for authentication
- `SPHERON_NETWORK`: Network to use (testnet or mainnet)
- `PROVIDER_PROXY_URL`: URL for the provider proxy server
- `YAML_API_URL`: URL for the YAML generation API service
