# poetry-image

## 项目介绍

参考自[daily-poetry-image](https://github.com/liruifengv/daily-poetry-image)

- 使用 OpenAI Dalle 3 API 替换非正式渠道的 Bing Image
- 将诗句及作者信息嵌入图片

## 运行

### 测试

```bash
yarn dev
```

### Docker

```bash
docker build . -t poetry:0.0.1
docker run -p 3000:3000 poetry:0.0.1 -e OPENAI_API_KEY='your api key' -e OPENAI_BASE_URL='https://example.com/v1'
```

## 接口

- `/api/create` 获取随机诗句并生成图片，并发度限制 1
- `/api/list` 获取已经创建的图片地址列表
