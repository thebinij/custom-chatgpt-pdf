## CUSTOM_GPT_BOT

### Build locally:

```shell
docker build -t thebinij/chatgpt:<tag> .
docker run -e OPENAI_API_KEY=xxxxxxxx -p 3030:3000 thebinij/chatgpt:<tag>
```

### Run Direcly using Docker Hub

```shell
docker run -d -e OPENAI_API_KEY=xxxxxxxx -p 3030:3000 thebinij/custom-chatgpt:latest
```


### Upload To Docker (Multiplatform)

```shell
docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t thebinij/custom-chatgpt:latest --push .
```



### Demo Video
[![Demo Video](https://img.youtube.com/vi/zT5Q1mz1iuY/0.jpg)](https://www.youtube.com/watch?v=zT5Q1mz1iuY)
