import { OpenAIModel } from "./openai";
import { PineConeEnv } from "./pinecone";

export interface Message {
    role: Role;
    content: string;
  }
  
  export type Role = 'assistant' | 'user';
  
  export interface ChatBody {
    model: OpenAIModel;
    messages: Message[];
    openAIkey: string;
    pineconeEnv: PineConeEnv;
  }
  
  export interface Conversation {
    id: string;
    name: string;
    messages: Message[];
    model: OpenAIModel;
  }
  