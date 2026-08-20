/**
 * JSON-LD serialization safe for embedding in a <script> tag.
 *
 * JSON.stringify alone does not escape angle brackets: content such as
 * `</script>` inside a string would terminate the script element early
 * and allow injection. Escaping `<` as `\u003c` keeps the JSON valid
 * while making breakout impossible.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
