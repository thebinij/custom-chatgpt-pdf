## GPT_LANGCHAIN

**Docker**

Build locally:

```shell
docker build -t chatgpt-ui .
docker run -e OPENAI_API_KEY=xxxxxxxx -p 3000:3000 chatgpt-ui
```

From Docker Hub

```shell
docker run -e OPENAI_API_KEY=xxxxxxxx -p 3000:3000 thebinij/custom-chatgpt:latest
```