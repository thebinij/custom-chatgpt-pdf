import { ErrorMessage } from "@/types/error";

export const DEFAULT_SYSTEM_PROMPT =
  process.env.DEFAULT_SYSTEM_PROMPT || "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.";

export const OPENAI_API_HOST =
  process.env.OPENAI_API_HOST || 'https://api.openai.com';

export const FETCHING_ERROR_MSG: ErrorMessage ={
  title: "Error fetching models.",
  code: null,
  messageLines: [
    "Make sure your OpenAI API key is set in the bottom left of the sidebar.",
    "If you completed this step, OpenAI may be experiencing issues.",
  ],
}