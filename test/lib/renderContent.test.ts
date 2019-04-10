import * as assert from "assert";
import { join } from "path";
import { TextDocument } from "vscode";
import renderContent from "../../src/lib/renderContent";


suite("lib/renderContent", () => {
  test("render something simple", async () => {
    const html = await renderContent("Hello <b>World!</b>", null);
    assert.equal(html, "Hello <b>World!</b>");
  });

  test("render with context", async () => {
    console.log(join(__dirname, "../examples/simple.liquid"));
    const html = await renderContent("Super {{foo}}!", "{ \"foo\": \"bar\" }");
    assert.equal(html, "Super bar!");
  });

  test("render property_accessor", async () => {
    const html = await renderContent("value is {{ foo | property_accessor: 'bar' }}", JSON.stringify({
      "foo": {
        "bar": "value of bar"
      }
    }));
    assert.equal(html, "value is value of bar");
  });

  test("render connected_content", async () => {
    const html = await renderContent("{% connected_content https://reqres.in/api/users/{{user_id}} :save user %}{{user.data.first_name}} {{user.data.last_name}}", JSON.stringify({
      "user_id": 1
    }));
    assert.equal(html, "George Bluth");
  });
});
