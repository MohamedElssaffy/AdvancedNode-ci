const Page = require("./helpers/Page");

let page;

beforeEach(async () => {
  page = await Page.build();

  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("Header Contain the correct logo text", async () => {
  const text = await page.getTextIn("a.brand-logo");

  expect(text).toEqual("Blogster");
});

test("Clicking login to start auth flow", async () => {
  await page.click(".right a");

  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/);
});

test("Where sign in must show logout button", async () => {
  await page.login();

  const text = await page.$eval(
    '.right a[href="/auth/logout"]',
    (el) => el.textContent
  );

  expect(text).toEqual("Logout");
});
