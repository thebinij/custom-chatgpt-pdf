## GPT_LANGCHAIN

**Docker**

Build locally:

```shell
docker build -t thebinij/chatgpt:<tag> .
docker run -e OPENAI_API_KEY=xxxxxxxx -p 3000:3000 thebinij/chatgpt:<tag>
```

Run Direcly using Docker Hub

```shell
docker run -e OPENAI_API_KEY=xxxxxxxx -p 3000:3000 thebinij/custom-chatgpt:latest
```
