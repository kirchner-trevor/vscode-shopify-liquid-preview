import * as assert from "assert";
import { join } from "path";
import { TextDocument } from "vscode";
import renderContent from "../../src/lib/renderContent";


suite("lib/renderContent", () => {
  test("render something simple", () => {
    const html = renderContent(<TextDocument>{
      getText: () => "Hello <b>World!</b>"
    });
    assert.equal(html, "Hello <b>World!</b>");
  });

  test("render with context", () => {
    console.log(join(__dirname, "../examples/simple.handlebars"));
    const html = renderContent(<TextDocument>{
      getText: () => "Super {{foo}}!",
      fileName: join(__dirname, "../examples/simple.handlebars")
    });
    assert.equal(html, "Super bar!");
  });
});
