import { PineConeVar } from '@/types/pinecone';
import { PineconeClient } from '@pinecone-database/pinecone';

export async function initPinecone(pineconeVar:PineConeVar) {
  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment: pineconeVar.environment ?? '', //this is in the dashboard
      apiKey: pineconeVar.apikey?? '',
    });

    return pinecone;
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to initialize Pinecone Client');
  }
}


