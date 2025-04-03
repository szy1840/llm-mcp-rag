import MCPClient from "./MCPClient";
import Agent from "./Agent";

const URL = 'https://github.com/unjs/consola'
const TASK = `
Please help me summarize the content of this website.
URL: ${URL}
`

async function main() {
    const fetchMCP = new MCPClient("mcp-server-fetch", "uvx", ['mcp-server-fetch']);

    const agent = new Agent([fetchMCP], 'gpt-4o-mini', 'You are a helpful assistant.');
    await agent.init();
    await agent.invoke(TASK);
    await agent.close();
}

main()