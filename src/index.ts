import ChatOpenAI from "./ChatOpenAI";

async function main() {
    const llm = new ChatOpenAI("gpt-4o-mini", "You are a helpful assistant.", true);
    const result = await llm.chat("Hello, how are you?");
}

main()