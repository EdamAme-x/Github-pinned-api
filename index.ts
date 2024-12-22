import { Context, Hono } from "@hono";
import {
  DOMParser,
} from "@deno_dom";

const app = new Hono();

app.get("/favicon.ico", (c: Context) => c.text("Guard"))

app.get("/:username", async (c: Context) => {
    const username = c.req.param("username");

    if (username.trim() === "") {
        return c.text("EMPTY USERNAME / SEE https://github.com/EdamAme-x");
    }

    const url = `https://github.com/${username.split("/")[0]}`;

    const resp = await fetch(url, {
        method: "GET"
    });

    const result = await resp.text();

    const html = new DOMParser().parseFromString(result, "text/html");

    const results = html?.querySelectorAll("div ol[class] > li:nth-child(n)");
    const resultJSON: {
        title: string,
        url: string,
        star: string,
        description: string
    }[] = [];

    for (const result of results || []) {
        // @ts-ignore: <lib side error>
        const titleElement = result.querySelector("div > div > div > div span > a");
        // @ts-ignore: <lib side error>
        const urlElement = result.querySelector("div > div > div > div span > a");
        // @ts-ignore: <lib side error>
        const starElement = result.querySelector("div > div > p:nth-child(3) > a:nth-child(2)");
        // @ts-ignore: <lib side error>
        const descriptionElement = result.querySelector("div > div > p");

        const oneResult = {
            title: titleElement?.innerText.replaceAll("\n", "").replaceAll(" ", "") ?? "EdamAme-x/EdamAme-x",
            url: "https://github.com/" + urlElement?.innerText.replaceAll("\n", "").replaceAll(" ", "") ?? "EdamAme-x/EdamAme-x",
            star: starElement?.innerText.replaceAll("\n", "").replaceAll(" ", "") ?? "0",
            description: descriptionElement?.innerText.replaceAll("\n", "").trim() ?? "missing"
        };
        resultJSON.push(oneResult);
    }

    return c.json(resultJSON, {
      headers: {
        "access-control-allow-origin": "*"
      }
    });
});

const { serve } = Deno;

serve(app.fetch);
