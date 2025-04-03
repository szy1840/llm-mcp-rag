import OpenAI from "openai";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import 'dotenv/config'

export interface ToolCall {
    id: string;
    function: {
        name: string;
        arguments: string;
    };
}

export default class ChatOpenAI {
    private llm: OpenAI;
    private model: string;
    private messages: OpenAI.Chat.ChatCompletionMessageParam[];
    private log: boolean;
    private tools: Tool[];

    constructor(model: string, systemPrompt?: string, tools?: Tool[], log?: boolean) {
        this.llm = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL,
        });
        this.model = model;
        this.messages = systemPrompt ? [{ role: "system", content: systemPrompt }] : [];
        this.log = log || false;
        this.tools = tools || [];
    }

    async chat(prompt?: string): Promise<{ content: string, toolCalls: ToolCall[] }> {
        if (prompt) {
            this.messages.push({ role: "user", content: prompt });
        }
        const stream = await this.llm.chat.completions.create({
            model: this.model,
            messages: this.messages,
            stream: true,
            tools: this.getToolsDefinition(),
        });
        let content = "";
        let toolCalls: ToolCall[] = [];
        for await (const chunk of stream) {
            const delta = chunk.choices[0].delta;
            // 处理普通Content
            if (delta.content) {
                const contentChunk = chunk.choices[0].delta.content || "";
                if (this.log) process.stdout.write(contentChunk);
                content += contentChunk;
            }
            // 处理ToolCall
            if (delta.tool_calls) {
                for (const toolCallChunk of delta.tool_calls) {
                    // 第一次要创建一个toolCall
                    if (toolCalls.length <= toolCallChunk.index) {
                        toolCalls.push({ id: toolCallChunk.index.toString(), function: { name: '', arguments: '' } });
                    }
                    let currentCall = toolCalls[toolCallChunk.index];
                    if (toolCallChunk.id) currentCall.id += toolCallChunk.id;
                    if (toolCallChunk.function?.name) currentCall.function.name += toolCallChunk.function.name;
                    if (toolCallChunk.function?.arguments) currentCall.function.arguments += toolCallChunk.function.arguments;
                }
            }
        }
        if (content !== "") this.messages.push({ role: "assistant", content: content });
        return {
            content: content,
            toolCalls: toolCalls,
        };
    }

    public appendToolResult(toolCallId: string, toolOutput: string) {
        this.messages.push({
            role: "tool",
            content: toolOutput,
            tool_call_id: toolCallId,
        });
    }

    private getToolsDefinition(): OpenAI.Chat.Completions.ChatCompletionTool[] {
        return this.tools.map((tool) => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
            },
        }));
    }
}
