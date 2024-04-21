import path from "node:path";
import fs from "node:fs/promises";
import { mkdirp } from "mkdirp";
import { format } from "date-fns";
import type { Response, SentenceResponse } from "../types";
import { SENTENCE_API } from "../const";
import { generateDalleImage } from "../openai";

async function getSentence(): Promise<SentenceResponse> {
  try {
    const res = await fetch(SENTENCE_API);
    const data: SentenceResponse = await res.json();
    return data;
  } catch (e: any) {
    throw new Error("Request Sentence failed: " + e.message);
  }
}

async function getImageBySentence(): Promise<Response> {
  const res = await getSentence();
  console.log("getSentence Result: ", res);

  const prompt = `${res.content}, textless`;
  try {
    const image = await generateDalleImage(prompt);
    return {
      image,
      content: res.content,
      origin: res.origin,
      author: res.author,
      category: res.category,
    };
  } catch (error: any) {
    throw new Error(`Dalle Image create failed: ${error.message}`);
  }
}

export default async function generate() {
  const res: Response = await getImageBySentence();
  console.log("Create image: ", res);

  const basePath = format(Date.now(), "yyyyMMddHHmmss");
  console.log("__dirname", __dirname);
  const saveDir = path.join(__dirname, "../../public", basePath);
  await mkdirp(saveDir);

  const imageFileName = `1.jpg`;
  const imageFilePath = path.join(saveDir, imageFileName);
  await fs.writeFile(imageFilePath, res.image);

  return {
    ...res,
    image: null,
    imagePath: `${basePath}/${imageFileName}`,
  };
}
