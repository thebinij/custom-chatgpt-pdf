import { ErrorMessage } from "@/types/error";

export const DEFAULT_SYSTEM_PROMPT =
  process.env.DEFAULT_SYSTEM_PROMPT ||
  `You are an AI assistant providing helpful advice. You are given the following extracted parts of a long document and a question. Provide a conversational answer based on the context provided.
  You should only provide hyperlinks that reference the context below. Do NOT make up hyperlinks.
  If you can't find the answer in the context below, just say "Hmm, I'm not sure." Don't try to make up an answer.
  If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.
  
  Question: {question}
  =========
  {context}
  =========
  Answer in Markdown:`;


export const OPENAI_API_HOST =
  process.env.OPENAI_API_HOST || "https://api.openai.com";

export const FETCHING_ERROR_MSG: ErrorMessage = {
  title: "Error fetching models.",
  code: null,
  messageLines: [
    "Make sure your OpenAI API key is set in the bottom left of the sidebar.",
    "If you completed this step, OpenAI may be experiencing issues.",
  ],
};
