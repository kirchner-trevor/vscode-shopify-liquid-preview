import * as assert from "assert";
import { join } from "path";
import { TextDocument } from "vscode";
import renderContent from "../../src/lib/renderContent";


suite("lib/renderContent", () => {
  test("render something simple", () => {
    const html = renderContent("Hello <b>World!</b>", null);
    assert.equal(html, "Hello <b>World!</b>");
  });

  test("render with context", () => {
    console.log(join(__dirname, "../examples/simple.handlebars"));
    const html = renderContent("Super {{foo}}!", "{ \"foo\": \"bar\" }");
    assert.equal(html, "Super bar!");
  });
});
