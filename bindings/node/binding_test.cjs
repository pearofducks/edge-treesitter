/// <reference types="node" />
const assert = require("node:assert");
const { describe, it } = require("node:test");

const Parser = require("tree-sitter");
const edge = require("../..");

describe("grammar", () => {
  const parser = new Parser();
  parser.setLanguage(edge);

  it("should be named edge", () => {
    assert.strictEqual(parser.getLanguage().name, "edge");
  });

  it("should parse source code", () => {
    const sourceCode = "{{ user.name }}";
    const tree = parser.parse(sourceCode);
    assert(!tree.rootNode.hasError);
  });
});
