// test.spec.ts
import { test, expect } from "@playwright/test";
import http from "http";

let server: http.Server;
let port: number;

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    const cookie = req.headers.cookie ?? "(none)";
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<h1>Cookie: ${cookie}</h1>`);
  });
  await new Promise<void>((resolve) => {
    server.listen(0, "0.0.0.0", () => {
      port = (server.address() as any).port;
      resolve();
    });
  });
});

test.afterAll(() => server?.close());

test("localhost cookie is sent", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: {
      cookies: [
        {
          name: "token",
          value: "hello",
          domain: "localhost",
          path: "/",
          expires: Math.floor(Date.now() / 1000) + 3600,
          httpOnly: false,
          secure: false,
          sameSite: "Lax" as const,
        },
      ],
      origins: [],
    },
  });

  const page = await context.newPage();
  await page.goto(`http://localhost:${port}/`);

  // Expect the cookie to appear in the page content
  await expect(page.locator("h1")).toContainText("token=hello");

  await context.close();
});

test("127.0.0.1 cookie is sent (control)", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: {
      cookies: [
        {
          name: "token",
          value: "hello",
          domain: "127.0.0.1",
          path: "/",
          expires: Math.floor(Date.now() / 1000) + 3600,
          httpOnly: false,
          secure: false,
          sameSite: "Lax" as const,
        },
      ],
      origins: [],
    },
  });

  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}/`);

  await expect(page.locator("h1")).toContainText("token=hello");

  await context.close();
});