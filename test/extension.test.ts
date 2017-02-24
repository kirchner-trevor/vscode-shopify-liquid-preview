import * as assert from "assert";
import * as extension from "../src/extension";

suite('extension', () => {
  test('activation', () => {
    assert.ok(extension.activate);
  });
});
