import { test, expect } from "@playwright/test";

// Server runs in a separate Docker container at localhost:3000 (shared network namespace)

test("localhost cookie is sent (Docker)", async ({ browser }) => {
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
  await page.goto("http://localhost:3000/");
  await expect(page.locator("#cookie")).toContainText("token=hello");
  await context.close();
});

