import { OpenAIModel } from "./openai";
import { PineConeEnv } from "./pinecone";

export interface Message {
  role: Role;
  content: string;
  source: string;
}

export type Role = "assistant" | "user";

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

export interface MetaData {
  pdf_numpages: number;
  source: string;
  text: string;
}

export interface SourceDocument {
  filename: string;
  data: string;
  score:number;
}

export interface ResponseStream {
  message: Message;
  sourceDocs: SourceDocument[];
  deleteCount?: number;
}
