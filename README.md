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

## Installation

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/spheronFdn/spheron-mcp-plugin.git

# Navigate to the project directory
cd spheron-mcp-plugin
```

### 2. Set Up Node.js Version

#### Using nvm (recommended)

```bash
# If you don't have nvm installed, install it first:
# For macOS/Linux:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# or
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# For Windows (using Windows Subsystem for Linux or Git Bash):
# Follow instructions at https://github.com/nvm-sh/nvm

# Restart your terminal or run:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use the project's Node.js version (defined in .nvmrc)
nvm use

# If you get an error that the version isn't installed:
nvm install
nvm use
```

#### Without nvm

If you're not using nvm, ensure your system Node.js version is 16.0.0 or higher:

```bash
# Check your Node.js version
node -v

# If it's below 16.0.0, download and install from nodejs.org
# https://nodejs.org/en/download/
```

### 3. Install Dependencies and Build

```bash
# Navigate to the server directory
cd spheron-server

# Install dependencies
npm install

# Build the project
npm run build

# Verify the build was successful
ls -la build
```

The build process will:

1. Compile TypeScript to JavaScript
2. Make the main file executable
3. Run the Node.js version check script

## Configuration

### VS Code Configuration

1. Locate or create the MCP settings file:

```bash
# For Linux:
mkdir -p ~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/
touch ~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json

# For macOS:
mkdir -p ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/
touch ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json

# For Windows:
# Create the file at %APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

2. Edit the settings file with your configuration:

```bash
# Open the file in your preferred editor
# For example:
nano ~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

3. Find the absolute path to the spheron-server directory:

```bash
# For example:
pwd
```

4. Add the following configuration (adjust paths and keys as needed):

```json
{
  "mcpServers": {
    "spheron": {
      "command": "node",
      "args": [
        "/absolute/path/to/spheron-mcp-plugin/spheron-server/build/index.js"
      ],
      "env": {
        "SPHERON_PRIVATE_KEY": "your-spheron-private-key",
        "SPHERON_NETWORK": "testnet",
        "PROVIDER_PROXY_URL": "https://provider-proxy.sphn.xyz"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

5. Or use the Docker configuration:

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
        "PROVIDER_PROXY_URL": "https://provider-proxy.sphn.xyz",
        "YAML_API_URL": "http://provider.cpu.gpufarm.xyz:32692/generate"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

6. Save the file and restart VS Code

### Claude Desktop Configuration

1. Locate or create the Claude Desktop configuration file:

```bash
# For macOS:
mkdir -p ~/Library/Application\ Support/Claude/
touch ~/Library/Application\ Support/Claude/claude_desktop_config.json

# For Windows:
# Create the file at %APPDATA%\Claude\claude_desktop_config.json

# For Linux:
mkdir -p ~/.config/Claude/
touch ~/.config/Claude/claude_desktop_config.json
```

2. Edit the configuration file:

```bash
# Open the file in your preferred editor
# For example:
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

3. Add the following configuration (adjust paths and keys as needed):

### Docker Configuration

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
        "PROVIDER_PROXY_URL": "https://provider-proxy.sphn.xyz",
        "YAML_API_URL": "http://provider.cpu.gpufarm.xyz:32692/generate"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Node Configuration

```json
{
  "mcpServers": {
    "spheron": {
      "command": "node",
      "args": [
        "/absolute/path/to/spheron-mcp-plugin/spheron-server/build/index.js"
      ],
      "env": {
        "SPHERON_PRIVATE_KEY": "your-spheron-private-key",
        "SPHERON_NETWORK": "testnet",
        "PROVIDER_PROXY_URL": "https://provider-proxy.sphn.xyz"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

4. Save the file and restart Claude Desktop

### Cursor Configuration

1. Locate or create the Cursor configuration file:

```bash
# For macOS:
mkdir -p ~/Library/Application\ Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/
touch ~/Library/Application\ Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json

# For Windows:
# Create the file at %APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json

# For Linux:
mkdir -p ~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/
touch ~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

2. Edit the configuration file:

```bash
# Open the file in your preferred editor
# For example:
nano ~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
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

## Environment Variables

- `SPHERON_PRIVATE_KEY`: Your Spheron private key for authentication
- `SPHERON_NETWORK`: Network to use (testnet or mainnet)
- `PROVIDER_PROXY_URL`: URL for the provider proxy server
- `YAML_API_URL`: URL for the YAML generation API service

## License

MIT
