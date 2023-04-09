import { ChatBody, Message } from '@/types/chat';
import { OpenAIError, OpenAIStream,OpenAIEmbeddings, createSystemPrompt } from '@/utils/server';
import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';
// @ts-expect-error
import wasm from '../../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';
import { initPinecone } from '@/utils/pinecone-client';


export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, pineconeEnv, openAIkey} = (await req.json()) as ChatBody;
    const URL = pineconeEnv.indexURL;
    const parts = URL.split("."); // Split the URL by dot
    const indexname = parts[0].split("-")[0]
    const envrionment = parts[2];
    const pinecone = await initPinecone(envrionment,pineconeEnv.apikey)

    const currentQuestion = messages[messages.length-1]
    const index = pinecone.Index(indexname);
    
    /* create vectorstore*/
    const vectorStore = await OpenAIEmbeddings(openAIkey,currentQuestion)
    const vector= vectorStore.data[0].embedding 

     const queryRequest = {
      vector: vector,
      topK: 5,
      includeValues: false,
      includeMetadata: true,
      namespace: "pdf-test",
    };
   
    const queryResponse = await index.query({ queryRequest });

    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );

    type MetaData= {
      pdf_numpages: number;
      source:string;
      text: string;
    }
    let contexts = []

    console.log(queryResponse.matches)

    if(queryResponse.matches){
      for (let i= queryResponse.matches?.length-1; i>=0;i--){
        const metadata = queryResponse.matches[i].metadata as MetaData
        if(metadata.text && metadata.text.length>0){
          contexts.push(metadata.text)
        }
      }
    }

    let promptToSend = createSystemPrompt(currentQuestion.content,contexts)

    const prompt_tokens = encoding.encode(promptToSend);
  
    let tokenCount = prompt_tokens.length;
    let oldMessages: Message[] = [];
    
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

    encoding.free();

    const stream = await OpenAIStream(model, promptToSend, openAIkey, oldMessages);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAIError) {
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      return new Response('Error', { status: 500 });
    }
  }
};
export default handler;


