import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "../../src/lib/serialize-json-ld";

describe("serializeJsonLd", () => {
  it("produces valid JSON for structured data", () => {
    const json = serializeJsonLd({ "@type": "Article", headline: "Hello" });
    expect(JSON.parse(json)).toEqual({ "@type": "Article", headline: "Hello" });
  });

  it("escapes script-closing sequences to prevent XSS breakout", () => {
    const json = serializeJsonLd({
      headline: "</script><script>alert(1)</script>",
    });
    // A raw '<' is required to open the closing </script> tag - with it
    // escaped as \u003c, breakout is impossible. '>' may stay literal.
    expect(json).not.toContain("</script>");
    expect(json).toContain("\\u003c/");
  });

  it("escapes all raw angle brackets", () => {
    const json = serializeJsonLd({ html: "<img src=x onerror=alert(1)>" });
    expect(json).not.toContain("<img");
    expect(json).toContain("\\u003cimg");
  });
});
