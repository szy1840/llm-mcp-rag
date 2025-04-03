# ReAct-MCP

## Overview

The ReAct-MCP framework is designed to operate with various MCP client instances, leveraging the capabilities of OpenAI models to perform complex tasks. It serves as an interface for tool execution, responses handling, and communication between clients.

## Components

### Agent

The `Agent` class acts as a orchestrator. It initializes MCP clients, manages interactions with the ChatOpenAI model, and invokes relevant tools based on user prompts.

Key Features:
- Initialization of multiple MCP clients.
- Invocation of chat prompts to generate responses.
- Handling tool calls and executing associated commands.

### ChatOpenAI

The `ChatOpenAI` class wraps the OpenAI API functionalities, allowing communication with the language model. It manages message passing and tool call handling dynamically during the chat session.

Key Features:
- Interaction with the OpenAI API.
- Handling multi-turn conversations.
- Capturing and appending tool results to the conversation.

### MCPClient

The `MCPClient` class represents a client that connects to an MCP server, handles command execution, and manages available tools.

Key Features:
- Establish secure connections to MCP servers.
- List available tools and execute tool calls with arguments.
- Handle server connection and closure.

### Utilities

The `utils` module provides utility functions, such as `logTitle`, which enhances the console output formatting.

## Installation

To set up the project, follow these steps:

1. Clone the repository:
   ```bash
   git clone git@github.com:KelvinQiu802/ReAct-MCP.git
   ```
2. Change the directory:
   ```bash
   cd ReAct-MCP
   ```
3. Install the dependencies:
   ```bash
   pnpm install
   ```
4. Set up your environment variables:
   Ensure you have the OpenAI API key in your environment variables as `OPENAI_API_KEY` and `OPENAI_BASE_URL`.

## Usage

To run the main application, use the following command:

```bash
pnpm run dev
```