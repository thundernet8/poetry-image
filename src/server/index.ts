import Koa from "koa";
import render from "@koa/ejs";
import path from "node:path";
import shot from "./shot";
import koaStatic from "koa-static";
import generate from "./generate";
import fs from "node:fs/promises";
import { format } from "date-fns";
import { mkdirp } from "mkdirp";
import Router from "koa-router";

const app = new Koa();
const router = new Router();

// 指定静态文件目录
const staticPath = path.join(__dirname, "../../public");

app.use(koaStatic(staticPath));

// template render
render(app, {
  root: path.join(__dirname, "../../view"),
  layout: "template",
  viewExt: "html",
  cache: false,
  debug: false,
});

// routes
router.get("/template", async (ctx, next) => {
  const sentences = (ctx.query.poetry || "").split(",");
  const intro = ctx.query.intro || "";
  const bg = ctx.query.bg || "";
  const color = ctx.query.color || "black";
  console.log("sentences", sentences);
  console.log("intro", intro);
  console.log("bg", bg);
  if (!sentences.length || !bg) {
    ctx.body = "Invalid params";
    ctx.status = 400;
    return next();
  }
  await ctx.render("template", {
    sentences,
    intro,
    bg,
    color: color === "white" ? "#fff" : "#232323",
  });
  return next();
});

router.get("/api/create", async (ctx, next) => {
  try {
    if (app._busy) {
      ctx.body = "任务繁忙";
      ctx.status = 429;
      return next();
    }
    app._busy = true;
    const gen = await generate();
    const buf1 = await shot(1024, 1024, gen, "black");
    const buf2 = await shot(1024, 1024, gen, "white");
    const saveDir = path.join(__dirname, `../../public`);
    await mkdirp(path.join(saveDir, "shots"));
    const p1 = `shots/${format(Date.now(), "yyyyMMddHHmmss")}-black.jpg`;
    const p2 = `shots/${format(Date.now(), "yyyyMMddHHmmss")}-white.jpg`;
    await Promise.all([
      fs.writeFile(path.join(saveDir, p1), buf1),
      fs.writeFile(path.join(saveDir, p2), buf2),
    ]);
    ctx.body = JSON.stringify(
      [p1, p2].map(
        (item) => `${ctx.request.protocol}://${ctx.request.host}/${item}`
      )
    );
  } catch (e) {
    ctx.body = JSON.stringify({
      code: 500,
      message: e.message,
      data: null,
    });
  } finally {
    app._busy = false;
  }
});

router.get("/api/list", async (ctx, next) => {
  const basePath = path.join(__dirname, "../../public/shots");
  const files = await fs.readdir(basePath, { recursive: false });
  const images = files.filter((item) => /\.(jpg|png|webp)$/.test(item));
  ctx.body = JSON.stringify(
    images.map(
      (item) => `${ctx.request.protocol}://${ctx.request.host}/shots/${item}`
    )
  );
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log("app listen at :3000");
});
