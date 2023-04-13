import { ChatBody, Message, MetaData, SourceDocument } from "@/types/chat";
import {
  OpenAIError,
  OpenAIStream,
  OpenAIEmbeddings,
  createSystemPrompt,
  parseEnv,
} from "@/utils/server";
import tiktokenModel from "@dqbd/tiktoken/encoders/cl100k_base.json";
import { Tiktoken, init } from "@dqbd/tiktoken/lite/init";
// @ts-expect-error
import wasm from "../../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module";
import { initPinecone } from "@/utils/pinecone-client";

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, pineconeEnv, openAIkey } =
      (await req.json()) as ChatBody;
    const { indexname, environment, apikey } = parseEnv(pineconeEnv);
    const pinecone = await initPinecone(environment, apikey);
    const index = pinecone.Index(indexname);
    const currentQuestion = messages[messages.length - 1];

    /* create vectorstore*/
    const vectorStore = await OpenAIEmbeddings(openAIkey, currentQuestion);
    const vector = vectorStore.data[0].embedding;

    const queryRequest = {
      vector: vector,
      topK: 3,
      includeValues: false,
      includeMetadata: true,
      namespace: "new-test-2",
    };

    const queryResponse = await index.query({ queryRequest });

    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str
    );

    let contexts = [];
    let sourceDocs: SourceDocument[] = [];

    if (queryResponse.matches) {
      for (let i = queryResponse.matches?.length - 1; i >= 0; i--) {
        const metadata = queryResponse.matches[i].metadata as MetaData;
        const score = queryResponse.matches[i].score;

        if (metadata.source && metadata.text && metadata.text.length > 0) {
          const filename = metadata.source.substring(
            metadata.source.lastIndexOf("/") + 1
          );
          const similarity = sanitizeParagraph(metadata.text);
          // Skip if score is low and contexts has already got higher score similarity
          if(score && score <0.60 && contexts.length>0){
            continue;
          }
          sourceDocs.push({
            filename: filename,
            data: similarity,
            score: score || 0,
          });
          contexts.push(similarity);
        }
      }
    }

    let promptToSend = createSystemPrompt(currentQuestion.content, contexts);

    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let oldMessages: Message[] = [];

    encoding.free();

 
    const stream = await OpenAIStream(
      model,
      promptToSend,
      openAIkey,
      oldMessages,
      sourceDocs
    );
    return new Response(stream);
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAIError) {
      return new Response("Error", { status: 500, statusText: error.message });
    } else {
      return new Response("Error", { status: 500 });
    }
  }
};
export default handler;
// for (let i = messages.length - 1; i >= 0; i--) {
//   const message = messages[i];
//   if(currentQuestion==message) continue;
//   const tokens = encoding.encode(message.content);

//   if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
//     break;
//   }
//   tokenCount += tokens.length;
//   oldMessages = [message, ...oldMessages];
// }

function sanitizeParagraph(str: string) {
  // Trim the input string and use a regular expression to match the first sentence
  const firstSentence = str.trim().match(/^(.*?[.?!])\s+/);
  // If the first sentence is found and does not start with a capital letter
  if (
    firstSentence &&
    firstSentence[1][0] !== firstSentence[1][0].toUpperCase()
  ) {
    // Cut off the first sentence from the input string and return the trimmed result
    return str.substring(firstSentence[0].length).trim();
  }
  return str.trim();
}
