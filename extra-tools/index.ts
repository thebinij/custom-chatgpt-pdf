import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { CustomPDFLoader } from './utils/customPDFLoader';
import { DirectoryLoader } from 'langchain/document_loaders';
import { pinecone } from './utils/pinecone-client';

/* Name of directory to retrieve your files from */
const filePath = './docs';

export const run = async () => {
  try {
   /*load raw docs from the all files in the directory */
   const directoryLoader = new DirectoryLoader(filePath, {
    '.pdf': (path) => new CustomPDFLoader(path),
  });

  // const loader = new PDFLoader(filePath);
  const rawDocs = await directoryLoader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
   const embeddings = new OpenAIEmbeddings();
   const index = pinecone.Index( process.env.PINECONE_INDEX_NAME||"");;

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: "new-test-2",
      textKey: 'text',
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
