# Spheron Protocol MCP Plugin

This MCP (Model Context Protocol) plugin integrates with the Spheron Protocol SDK to provide compute deployment and management capabilities directly through Claude.

## Recent Fixes

- **ES Module Compatibility**: Fixed fs-extra import to work properly with ES modules
- **BigInt Serialization**: Added proper handling of BigInt values in API responses to prevent JSON serialization errors

## Features

- **Deploy Compute Resources**: Deploy compute resources using YAML configuration
- **Fetch Wallet Balance**: Check your wallet balance for different tokens
- **Fetch Deployment URLs**: Get URLs for your active deployments
- **Fetch Lease ID Details**: Get detailed information about a lease
- **Deploy Custom YAML Files**: Deploy using custom YAML configurations

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/saurrx/spheron-mcp-plugin.git
   cd spheron-mcp-plugin
   ```

2. Install dependencies and build the project:
   ```bash
   cd spheron-server
   npm install
   npm run build
   ```

3. Configure the MCP settings:
   - Edit `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Add the following configuration:
   ```json
   {
     "mcpServers": {
       "spheron": {
         "command": "node",
         "args": ["/path/to/spheron-mcp-plugin/spheron-server/build/index.js"],
         "env": {
           "SPHERON_PRIVATE_KEY": "your-private-key",
           "SPHERON_NETWORK": "testnet",
           "PROVIDER_PROXY_URL": "https://provider-proxy.spheron.network"
         },
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

## Usage

Once installed, you can use the Spheron Protocol MCP plugin through Claude with commands like:

### Deploy Compute

```
Deploy this compute configuration:
version: "1.0"

services:
  py-cuda:
    image: quay.io/jupyter/pytorch-notebook:cuda12-pytorch-2.4.1
    expose:
      - port: 8888
        as: 8888
        to:
          - global: true
    env:
      - JUPYTER_TOKEN=sentient
profiles:
  name: py-cuda
  duration: 2h
  mode: provider
  tier:
    - community
  compute:
    py-cuda:
      resources:
        cpu:
          units: 8
        memory:
          size: 16Gi
        storage:
          - size: 200Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: rtx4090
  placement:
    westcoast:
      attributes:
        region: us-central
      pricing:
        py-cuda:
          token: CST
          amount: 10

deployment:
  py-cuda:
    westcoast:
      profile: py-cuda
      count: 1
```

### Check Wallet Balance

```
What's my CST balance on Spheron?
```

### Get Deployment URLs

```
Show me the URLs for my deployment with lease ID 12345
```

### Get Lease Details

```
Get details for lease ID 12345
```

## Testing

To test the MCP plugin, run the included test scripts:

```bash
# Main test script
node test-spheron-mcp.js

# Additional test scripts
node simple-test.js
node fs-test.js
node sdk-test.js
node list-tools-test.js
```

These scripts test different aspects of the plugin functionality.

## Environment Variables

- `SPHERON_PRIVATE_KEY`: Your Spheron private key for authentication
- `SPHERON_NETWORK`: Network to use (testnet or mainnet)
- `PROVIDER_PROXY_URL`: URL for the provider proxy server

## License

MIT
