import MCPClient from "./MCPClient";
import ChatOpenAI from "./ChatOpenAI";

const URL = 'https://www.anthropic.com/engineering/building-effective-agents'

const TASK = `
Please help me summarize the content of this website.
URL: ${URL}
`

async function main() {
    const mcp = new MCPClient("mcp-client", "uvx", ['mcp-server-fetch']);
    await mcp.init();

    const llm = new ChatOpenAI('gpt-4o-mini', TASK, mcp.getTools(), true);
    const response = await llm.chat();
    console.log(response.toolCalls);

    await mcp.close();
}

main()