import OpenAI from "openai";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import 'dotenv/config'
import { logTitle } from "./utils";

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
    private messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    private tools: Tool[];

    constructor(model: string, systemPrompt: string = '', tools: Tool[] = [], context: string = '') {
        this.llm = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL,
        });
        this.model = model;
        this.tools = tools;
        if (systemPrompt) this.messages.push({ role: "system", content: systemPrompt });
        if (context) this.messages.push({ role: "user", content: context });
    }

    async chat(prompt?: string): Promise<{ content: string, toolCalls: ToolCall[] }> {
        logTitle('CHAT');
        if (prompt) {
            this.messages.push({ role: "user", content: prompt });
        }
        // 每次调用都要传输完整的 messages 历史，因为 OpenAI 设计它不会在服务器维护历史消息。
        // 可能的优化方法是：消息压缩，设置消息数量上限（slice掉旧消息）
        // LangChain 使用 Memory 组件来管理历史：ConversationSummaryMemory, ConversationBufferWindowMemory
        const stream = await this.llm.chat.completions.create({
            model: this.model,
            messages: this.messages,
            stream: true,
            tools: this.getToolsDefinition(),
        });
        let content = "";
        let toolCalls: ToolCall[] = [];
        logTitle('RESPONSE');
        for await (const chunk of stream) {
            const delta = chunk.choices[0].delta;
            // 处理普通Content
            if (delta.content) {
                const contentChunk = chunk.choices[0].delta.content || "";
                content += contentChunk;
                process.stdout.write(contentChunk);
            }
            // 处理ToolCall
            if (delta.tool_calls) {
                for (const toolCallChunk of delta.tool_calls) {
                    // 第一次要创建一个toolCall
                    if (toolCalls.length <= toolCallChunk.index) {
                        toolCalls.push({ id: '', function: { name: '', arguments: '' } });
                    }
                    let currentCall = toolCalls[toolCallChunk.index];
                    // 流式响应的 tool call 的 id, name, arguments 是分开的，需要拼接起来
                    // 增量累积，所以用字符串拼接
                    if (toolCallChunk.id) currentCall.id += toolCallChunk.id;
                    if (toolCallChunk.function?.name) currentCall.function.name += toolCallChunk.function.name;
                    if (toolCallChunk.function?.arguments) currentCall.function.arguments += toolCallChunk.function.arguments;
                }
            }
        }
        // 将流式的响应拼接出本次完整的响应，并自己添加到 messages 里
        this.messages.push({ role: "assistant", content: content, tool_calls: toolCalls.map(call => ({ id: call.id, type: "function", function: call.function })) });
        return {
            content: content,
            toolCalls: toolCalls,
        };
    }

    public appendToolResult(toolCallId: string, toolOutput: string) {
        this.messages.push({
            role: "tool",
            content: toolOutput,
            tool_call_id: toolCallId
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
