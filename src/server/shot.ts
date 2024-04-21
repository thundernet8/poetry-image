import puppeteer from "puppeteer";
import type { Response } from "../types";

export default async function shot(
  width: number,
  height: number,
  data: Response & { imagePath: string },
  color?: "white" | "black"
) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width,
    height,
    deviceScaleFactor: 2,
  });

  const intro = `《${data.origin}》${data.author}`;
  const bg = `http://127.0.0.1:3000/${data.imagePath}`;
  const url = `http://127.0.0.1:3000/template?poetry=${data.content
    .split(/[，。]/)
    .filter(Boolean)
    .join(",")}&intro=${encodeURIComponent(intro)}&bg=${bg}&color=${
    color || "black"
  }`;

  console.log("Shot url: ", url);
  page.goto(url);

  await page.waitForNetworkIdle({
    timeout: 30000,
  });

  await new Promise((resolve) => {
    setTimeout(resolve, 100);
  });

  const container = await page.$(".container");
  const buf = await container!.screenshot({
    type: "jpeg",
    quality: 100,
  });
  console.log(buf.byteLength);
  await page.close();
  await browser.close();

  return buf;
}
