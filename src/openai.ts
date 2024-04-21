import OpenAI from "openai";
import fs from "node:fs/promises";
import path from "node:path";

export async function generateDalleImage(prompt: string) {
  console.log("image prompt", prompt);
  const openai = new OpenAI({
    baseURL:
      process.env.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL_FALLBACK,
    apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_FALLBACK,
  });

  const ret = await openai.images.generate({
    size: "1024x1024",
    style: "vivid",
    response_format: "b64_json",
    quality: "standard",
    model: "dall-e-3",
    prompt: prompt,
  });

  const image = ret.data[0];
  console.log("Image revised prompt", image.revised_prompt);
  const binary = Buffer.from(image.b64_json.slice(23), "base64");
  // const binary = await fs.readFile(path.join(__dirname, "../public/1.jpg"));

  return binary;
}
