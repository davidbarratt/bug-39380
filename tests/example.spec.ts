// test.spec.ts
import { test, expect } from "@playwright/test";
import http from "http";

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
  await page.goto(`http://localhost:3000/`);

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
  await page.goto(`http://127.0.0.1:3000/`);

  await expect(page.locator("h1")).toContainText("token=hello");

  await context.close();
});
