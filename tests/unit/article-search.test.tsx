// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import ArticleSearch, {
  type SearchableArticle,
} from "../../src/components/islands/ArticleSearch";

afterEach(cleanup);

const articles: SearchableArticle[] = [
  {
    id: "islands-mental-model",
    title: "Islands: interactivity as an opt-in",
    description: "Why Astro ships zero JavaScript by default.",
    topics: ["islands"],
  },
  {
    id: "rendering-is-per-route",
    title: "Rendering is a per-route decision",
    description: "Static and server rendering side by side.",
    topics: ["rendering"],
  },
];

describe("ArticleSearch island", () => {
  it("renders the input and the article count hint", () => {
    render(<ArticleSearch articles={articles} />);
    expect(
      screen.getByRole("searchbox", { name: "Search articles" }),
    ).toBeTruthy();
    expect(screen.getByText(/2 articles searchable/)).toBeTruthy();
  });

  it("filters by title as the user types", async () => {
    const user = userEvent.setup();
    render(<ArticleSearch articles={articles} />);
    await user.type(screen.getByRole("searchbox"), "islands");
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe(
      "/articles/islands-mental-model/",
    );
  });

  it("matches topic names too", async () => {
    const user = userEvent.setup();
    render(<ArticleSearch articles={articles} />);
    await user.type(screen.getByRole("searchbox"), "rendering");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("shows an accessible empty state for no matches", async () => {
    const user = userEvent.setup();
    render(<ArticleSearch articles={articles} />);
    await user.type(screen.getByRole("searchbox"), "zzzz");
    expect(screen.getByText(/No articles match/)).toBeTruthy();
  });

  it("hides results again when the query is cleared", async () => {
    const user = userEvent.setup();
    render(<ArticleSearch articles={articles} />);
    const input = screen.getByRole("searchbox");
    await user.type(input, "islands");
    await user.clear(input);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText(/2 articles searchable/)).toBeTruthy();
  });
});
