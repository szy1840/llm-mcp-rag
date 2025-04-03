import OpenAI from "openai";
import 'dotenv/config'

export default class ChatOpenAI {
    private llm: OpenAI;
    private model: string;
    private messages: OpenAI.Chat.ChatCompletionMessageParam[];
    private log: boolean;

    constructor(model: string, systemPrompt?: string, log?: boolean) {
        this.llm = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL,
        });
        this.model = model;
        this.messages = systemPrompt ? [{ role: "system", content: systemPrompt }] : [];
        this.log = log || false;
    }

    async chat(prompt?: string) {
        if (prompt) {
            this.messages.push({ role: "user", content: prompt });
        }
        const stream = await this.llm.chat.completions.create({
            model: this.model,
            messages: this.messages,
            stream: true,
        });
        let result = "";
        for await (const chunk of stream) {
            const content = chunk.choices[0].delta.content || "";
            if (this.log) process.stdout.write(content);
            result += content;
        }
        this.messages.push({ role: "assistant", content: result });
        return result;
    }

    public appendToolResult(toolCallId: string, toolOutput: string) {
        this.messages.push({
            role: "tool",
            content: toolOutput,
            tool_call_id: toolCallId,
        });
    }
}
