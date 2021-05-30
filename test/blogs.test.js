const Page = require("./helpers/Page");

let page;

beforeEach(async () => {
  page = await Page.build();

  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When log in", async () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });
  test("When login , can see create blogs form", async () => {
    const labelText = await page.getTextIn("form label");

    expect(labelText).toEqual("Blog Title");
  });

  describe("And using valid inputs", async () => {
    const myTitlte = "My Title";
    const myContent = "My Content";

    beforeEach(async () => {
      await page.type('.title input[name="title"]', myTitlte);
      await page.type('.content input[name="content"]', myContent);

      await page.click("form button");
    });

    test("Submitting takes user to review screen", async () => {
      const confirmText = await page.getTextIn("form h5");

      expect(confirmText).toEqual("Please confirm your entries");
    });
    test("Submitting and save blog takes user to blogs screen", async () => {
      await page.click("button.green");
      await page.waitFor(".card");

      const title = await page.getTextIn(".card .card-title");
      const content = await page.getTextIn(".card p");

      expect(title).toEqual(myTitlte);
      expect(content).toEqual(myContent);
    });
  });

  describe("And using invalid inputs", async () => {
    beforeEach(async () => {
      await page.click("form button");
    });

    test("The form should show an error message", async () => {
      const titleErr = await page.getTextIn(".title .red-text");
      const contentErr = await page.getTextIn(".content .red-text");

      expect(titleErr).toEqual("You must provide a value");
      expect(contentErr).toEqual("You must provide a value");
    });
  });
});

describe("When user not log in", async () => {
  test("User cant be able to create a blogs", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          title: "My Title From Fetch",
          content: "My Content From Fetch",
        },
      }).then((res) => res.json());
    });

    expect(result).toEqual({ error: "You must log in!" });
  });

  test("User cant get blogs", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
    });

    expect(result).toEqual({ error: "You must log in!" });
  });
});
