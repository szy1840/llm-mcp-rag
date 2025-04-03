import MCPClient from "./MCPClient";
import Agent from "./Agent";
import path from "path";

const URL = 'https://news.ycombinator.com/'
const outPath = path.join(process.cwd(), 'src');
const TASK = `
Summarize the content of ${URL} and save it as a markdown file to ${outPath}.
You can choose the file name.
`

const fetchMCP = new MCPClient("mcp-server-fetch", "uvx", ['mcp-server-fetch']);
const fileMCP = new MCPClient("mcp-server-file", "npx", ['-y', '@modelcontextprotocol/server-filesystem', outPath]);

async function main() {
    const agent = new Agent('gpt-4o-mini', [fetchMCP, fileMCP]);
    await agent.init();
    await agent.invoke(TASK);
    await agent.close();
}

main()