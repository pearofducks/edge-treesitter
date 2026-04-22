var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// tree-sitter-html/grammar.js
var require_grammar = __commonJS({
  "tree-sitter-html/grammar.js"(exports, module) {
    module.exports = grammar({
      name: "html",
      extras: ($) => [
        $.comment,
        /\s+/
      ],
      externals: ($) => [
        $._start_tag_name,
        $._script_start_tag_name,
        $._style_start_tag_name,
        $._end_tag_name,
        $.erroneous_end_tag_name,
        "/>",
        $._implicit_end_tag,
        $.raw_text,
        $.comment
      ],
      rules: {
        document: ($) => repeat($._node),
        doctype: ($) => seq(
          "<!",
          alias($._doctype, "doctype"),
          /[^>]+/,
          ">"
        ),
        _doctype: (_) => /[Dd][Oo][Cc][Tt][Yy][Pp][Ee]/,
        _node: ($) => choice(
          $.doctype,
          $.entity,
          $.text,
          $.element,
          $.script_element,
          $.style_element,
          $.erroneous_end_tag
        ),
        element: ($) => choice(
          seq(
            $.start_tag,
            repeat($._node),
            choice($.end_tag, $._implicit_end_tag)
          ),
          $.self_closing_tag
        ),
        script_element: ($) => seq(
          alias($.script_start_tag, $.start_tag),
          optional($.raw_text),
          $.end_tag
        ),
        style_element: ($) => seq(
          alias($.style_start_tag, $.start_tag),
          optional($.raw_text),
          $.end_tag
        ),
        start_tag: ($) => seq(
          "<",
          alias($._start_tag_name, $.tag_name),
          repeat($.attribute),
          ">"
        ),
        script_start_tag: ($) => seq(
          "<",
          alias($._script_start_tag_name, $.tag_name),
          repeat($.attribute),
          ">"
        ),
        style_start_tag: ($) => seq(
          "<",
          alias($._style_start_tag_name, $.tag_name),
          repeat($.attribute),
          ">"
        ),
        self_closing_tag: ($) => seq(
          "<",
          alias($._start_tag_name, $.tag_name),
          repeat($.attribute),
          "/>"
        ),
        end_tag: ($) => seq(
          "</",
          alias($._end_tag_name, $.tag_name),
          ">"
        ),
        erroneous_end_tag: ($) => seq(
          "</",
          $.erroneous_end_tag_name,
          ">"
        ),
        attribute: ($) => seq(
          $.attribute_name,
          optional(seq(
            "=",
            choice(
              $.attribute_value,
              $.quoted_attribute_value
            )
          ))
        ),
        attribute_name: (_) => /[^<>"'/=\s]+/,
        attribute_value: (_) => /[^<>"'=\s]+/,
        // An entity can be named, numeric (decimal), or numeric (hexacecimal). The
        // longest entity name is 29 characters long, and the HTML spec says that
        // no more will ever be added.
        entity: (_) => /&(#([xX][0-9a-fA-F]{1,6}|[0-9]{1,5})|[A-Za-z]{1,30});?/,
        quoted_attribute_value: ($) => choice(
          seq("'", optional(alias(/[^']+/, $.attribute_value)), "'"),
          seq('"', optional(alias(/[^"]+/, $.attribute_value)), '"')
        ),
        text: (_) => /[^<>&\s]([^<>&]*[^<>&\s])?/
      }
    });
  }
});

// main/NodeMap.ts
var NodeMap = class {
  cachedNodes;
  extraNodes;
  constructor() {
    this.cachedNodes = /* @__PURE__ */ new Map();
    this.extraNodes = /* @__PURE__ */ new Set();
  }
  /**
   * The method used to collect, cache and return the entire grammar
   * new nodes needing cached can be added at a later point
   */
  add(...nodes2) {
    if (this.size() != 0) {
      nodes2.forEach((node) => {
        if (!this.has(node)) {
          this.set(node);
        }
      });
      return this.cachedNodes.values();
    }
    nodes2.forEach((node) => this.set(node));
    return this.cachedNodes.values();
  }
  /**
   * Map the node to the cache
   */
  set(node) {
    this.cachedNodes.set(node.name, node);
  }
  /**
   * returns all the cached nodes, including the extra nodes specified
   */
  all() {
    return this.extraNodes.size == 0 ? this.cachedNodes.values() : this.mergedWith(...this.cachedNodes.values());
  }
  /**
   * rule specific nodes to be used temporarily.
   */
  with(...nodes2) {
    nodes2.forEach((node) => this.extraNodes.add(node));
    return this;
  }
  /**
   * Checks if a node already exists
   */
  has(node) {
    return this.cachedNodes.has(node.name);
  }
  /**
   * Return cached nodes without the specified nodes.
   *
   * If extra nodes are provided, it will be merged and returned as well
   */
  without(...nodes2) {
    const temp = new Map(this.cachedNodes);
    nodes2.forEach((node) => temp.delete(node.name));
    return this.extraNodes.size == 0 ? temp.values() : this.mergedWith(...temp.values());
  }
  /**
   * returns the size of the Data Structure
   */
  size() {
    return this.cachedNodes.size;
  }
  /**
   * Return the merged node set and clears the extraNodes.
   */
  mergedWith(...nodes2) {
    const temp = new Set(this.extraNodes);
    this.extraNodes.clear();
    return temp.union(new Set(nodes2));
  }
};

// main/grammar.ts
var import_grammar = __toESM(require_grammar());
var nodes = new NodeMap();
var grammar_default = grammar(import_grammar.default, {
  name: "edge",
  rules: {
    // The entire grammar
    _node: ($) => choice(
      ...nodes.add(
        // tree-sitter-html
        $.doctype,
        $.entity,
        $.text,
        $.element,
        $.script_element,
        $.style_element,
        $.erroneous_end_tag,
        // tree-sitter-edge
        $.keyword,
        $.edge_expression,
        $._inline_directive,
        $.comment,
        $.loop,
        $.conditional,
        // nested block directives
        $.slot,
        $.stack_push,
        $.component
      )
    ),
    // ==================
    // Comments
    // ==================
    // {{-- inline or multiline comment --}}
    // https://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    comment: (_) => token(seq("{{--", /[^-]*-+([^}-][^-]*-+)*/, "}}")),
    // ==================
    // Keywords (no-argument tags)
    // ==================
    keyword: ($) => alias("@debugger", $.directive),
    // ==================
    // Edge Expressions (mustache interpolation)
    // ==================
    edge_expression: ($) => choice($._escaped, $._safe, $._passthrough),
    // {{ expression }} — HTML-escaped output
    _escaped: ($) => seq(
      "{{",
      optional(alias($.text, $.javascript)),
      "}}"
    ),
    // {{{ expression }}} — raw/safe HTML output
    _safe: ($) => seq(
      "{{{",
      optional(alias($.text, $.javascript)),
      "}}}"
    ),
    // @{{ expression }} — passed through to frontend (not evaluated by Edge)
    _passthrough: ($) => seq(
      "@{{",
      optional(alias($.text, $.javascript)),
      "}}"
    ),
    // ==================
    // Inline directives (no body, no @end)
    // ==================
    _inline_directive: ($) => choice(
      // Known inline directives with parameters
      seq(
        alias(
          choice(
            "@include",
            "@includeIf",
            "@let",
            "@eval",
            "@inject",
            "@newError",
            "@stack"
          ),
          $.directive
        ),
        $._directive_parameter
      ),
      // Self-closing component tags: @!component('name', props)
      // or @!componentName() or @!layout.app()
      seq(
        alias(token(/@![a-zA-Z][a-zA-Z\d.]*/), $.directive),
        $._directive_parameter
      )
    ),
    // ==================
    // Conditionals
    // ==================
    conditional: ($) => choice($._if, $._unless),
    conditional_keyword: ($) => choice(
      alias("@else", $.directive),
      seq(
        alias("@elseif", $.directive),
        $._directive_parameter
      )
    ),
    _if: ($) => seq(
      alias("@if", $.directive_start),
      $._conditional_directive_body,
      alias("@end", $.directive_end)
    ),
    _unless: ($) => seq(
      alias("@unless", $.directive_start),
      $._conditional_directive_body,
      alias("@end", $.directive_end)
    ),
    // ==================
    // Loops
    // ==================
    loop: ($) => $._each,
    _loop_operator: ($) => alias("@else", $.directive),
    _each: ($) => seq(
      alias("@each", $.directive_start),
      $._loop_directive_body,
      alias("@end", $.directive_end)
    ),
    // ==================
    // Slots
    // ==================
    slot: ($) => seq(
      alias("@slot", $.directive_start),
      $._directive_parameter,
      optional(
        repeat1(
          choice(...nodes.without($.slot))
        )
      ),
      alias(/@end(slot)?/, $.directive_end)
    ),
    // ==================
    // Stack push directives
    // ==================
    stack_push: ($) => seq(
      alias(
        choice(
          "@pushTo",
          "@pushOnceTo",
          "@pushToTop",
          "@pushOnceToTop"
        ),
        $.directive_start
      ),
      $._directive_parameter,
      optional(
        repeat1(
          choice(...nodes.without($.stack_push))
        )
      ),
      alias("@end", $.directive_end)
    ),
    // ==================
    // Components (catch-all for @tagName() blocks)
    // ==================
    // Any @word() or @word.sub() that isn't matched by a more specific rule
    // is treated as a component-as-tag. This covers:
    //   @component('name', props) ... @end
    //   @modal() ... @end
    //   @layout.app() ... @end
    //   @form.input() ... @end
    component: ($) => seq(
      alias(
        choice(
          "@component",
          token(prec(-1, /@[a-zA-Z][a-zA-Z\d.]*/))
        ),
        $.directive_start
      ),
      $._directive_parameter,
      optional(
        repeat1(
          choice(...nodes.all())
        )
      ),
      alias("@end", $.directive_end)
    ),
    // ==================
    // HTML attribute overrides
    // ==================
    attribute: ($) => choice(
      $._html_attribute,
      $.edge_expression
    ),
    attribute_name: (_) => token(prec(-1, /[^<>"'/=\s]+/)),
    attribute_value: (_) => token(prec(-1, /[^<>"'/=\s]+/)),
    quoted_attribute_value: ($) => choice(
      seq(
        "'",
        optional(
          repeat(
            choice(
              $.edge_expression,
              $.conditional,
              $._inline_directive,
              $.comment,
              alias($._singly_quoted_attribute_text, $.attribute_value)
            )
          )
        ),
        "'"
      ),
      seq(
        '"',
        optional(
          repeat(
            choice(
              $.edge_expression,
              $.conditional,
              $._inline_directive,
              $.comment,
              alias($._doubly_quoted_attribute_text, $.attribute_value)
            )
          )
        ),
        '"'
      )
    ),
    _html_attribute: ($) => seq(
      $.attribute_name,
      optional(
        seq(
          "=",
          choice($.attribute_value, $.quoted_attribute_value)
        )
      )
    ),
    // ==================
    // Engine helpers (body rules)
    // ==================
    // Conditional body helpers
    _conditonal_body: ($) => repeat1(choice(...nodes.with($.conditional_keyword).all())),
    _conditional_directive_body: ($) => seq($._directive_parameter, optional($._conditonal_body)),
    // Loop body helpers
    _loop_body: ($) => repeat1(
      choice(
        ...nodes.with($._loop_operator).all()
      )
    ),
    _loop_directive_body: ($) => seq($._directive_parameter, optional($._loop_body)),
    // ==================
    // Directive parameter (parenthesis-balanced)
    // ==================
    _directive_parameter: ($) => seq(
      "(",
      optional(repeat($.parameter)),
      ")"
    ),
    // Parenthesis balancing for function calls, objects, etc. inside parameters
    parameter: ($) => choice(/[^()]+/, $._nested_parentheses),
    _nested_parentheses: ($) => seq("(", repeat($.parameter), ")"),
    // ==================
    // Text
    // ==================
    text: ($) => prec.right(repeat1($._text)),
    _text: (_) => choice(
      // orphan tags
      token(prec(-2, /[{}!@()?,-]/)),
      // general text (catch-all)
      token(
        prec(
          -1,
          /[^\s(){!}@-]([^<>(){!}@,?]*[^<>{!}()@?,-])?/
        )
      ),
      // unmatched @ followed by non-tag characters
      token(prec(-1, /@[a-zA-Z\d]*[^\(-]/))
    ),
    _singly_quoted_attribute_text: (_) => prec.right(
      repeat1(
        choice(
          token(prec(-2, /[{}]/)),
          token(prec(-1, /[^'{}]/))
        )
      )
    ),
    _doubly_quoted_attribute_text: (_) => prec.right(
      repeat1(
        choice(
          token(prec(-2, /[{}]/)),
          token(prec(-1, /[^"{}]/))
        )
      )
    )
  }
});
export {
  grammar_default as default
};
/**
 * @file HTML grammar for tree-sitter
 * @author Max Brunsfeld <maxbrunsfeld@gmail.com>
 * @author Amaan Qureshi <amaanq12@gmail.com>
 * @license MIT
 */
/**
 * @file Edge grammar for tree-sitter
 * @author tree-sitter-edge contributors
 * @license MIT
 *
 * Based on tree-sitter-blade by Emran Mashhadi Ramezan
 * Adapted for the Edge.js template engine (https://edgejs.dev)
 */
