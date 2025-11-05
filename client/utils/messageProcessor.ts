// utils/messageProcessor.ts
interface HistoryMessage {
  type: "human" | "ai";
  content: string;
  additional_kwargs?: any;
  response_metadata?: any;
  tool_calls?: any[];
  invalid_tool_calls?: any[];
}

interface ChatMessage {
  sender: "human" | "ai";
  message: string;
}

export const processHistoryMessages = (historyMessages: HistoryMessage[]): ChatMessage[] => {
  return historyMessages.map(msg => ({
    sender: msg.type,
    message: msg.content.trim() // Remove trailing whitespace/newlines
  }));
};
