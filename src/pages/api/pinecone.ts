import { PineConeEnv, PineconeStats } from "@/types/pinecone";

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { indexURL, apikey } = (await req.json()) as PineConeEnv;
    const cleanedIndexURL = indexURL.startsWith("https://") ? indexURL.slice(8) : indexURL;
    
    const response = await fetch(
      `https://${cleanedIndexURL}/describe_index_stats`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "Api-Key": apikey,
        },
      }
    );
    if (response.status === 401) {
      return new Response(response.body, {
        status: 500,
        headers: response.headers,
      });
    } else if (response.status !== 200) {
      console.error(
        `PINECONE API returned an error ${
          response.status
        }: ${await response.text()}`
      );
      throw new Error("PINECONE API returned an error");
    }
    const pineconeStats: PineconeStats = await response.json();

    return new Response(JSON.stringify(pineconeStats), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
