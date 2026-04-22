/**
 * @file Edge grammar for tree-sitter
 * @author tree-sitter-edge contributors
 * @license MIT
 *
 * Based on tree-sitter-blade by Emran Mashhadi Ramezan
 * Adapted for the Edge.js template engine (https://edgejs.dev)
 */

import NodeMap from "./NodeMap.ts";
import html from "../tree-sitter-html/grammar.js";

const nodes = new NodeMap();

/// <reference types="tree-sitter-cli/dsl" />

export default grammar(html, {
  name: "edge",

  rules: {
    // The entire grammar
    _node: ($) =>
      choice(
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
          $.component,
        ),
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
    edge_expression: ($) =>
      choice($._escaped, $._safe, $._passthrough),

    // {{ expression }} — HTML-escaped output
    _escaped: ($) =>
      seq(
        "{{",
        optional(alias($.text, $.javascript)),
        "}}",
      ),

    // {{{ expression }}} — raw/safe HTML output
    _safe: ($) =>
      seq(
        "{{{",
        optional(alias($.text, $.javascript)),
        "}}}",
      ),

    // @{{ expression }} — passed through to frontend (not evaluated by Edge)
    _passthrough: ($) =>
      seq(
        "@{{",
        optional(alias($.text, $.javascript)),
        "}}",
      ),

    // ==================
    // Inline directives (no body, no @end)
    // ==================
    _inline_directive: ($) =>
      choice(
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
              "@stack",
            ),
            $.directive,
          ),
          $._directive_parameter,
        ),
        // Self-closing component tags: @!component('name', props)
        // or @!componentName() or @!layout.app()
        seq(
          alias(token(/@![a-zA-Z][a-zA-Z\d.]*/), $.directive),
          $._directive_parameter,
        ),
      ),

    // ==================
    // Conditionals
    // ==================
    conditional: ($) => choice($._if, $._unless),

    conditional_keyword: ($) =>
      choice(
        alias("@else", $.directive),
        seq(
          alias("@elseif", $.directive),
          $._directive_parameter,
        ),
      ),

    _if: ($) =>
      seq(
        alias("@if", $.directive_start),
        $._conditional_directive_body,
        alias("@end", $.directive_end),
      ),

    _unless: ($) =>
      seq(
        alias("@unless", $.directive_start),
        $._conditional_directive_body,
        alias("@end", $.directive_end),
      ),

    // ==================
    // Loops
    // ==================
    loop: ($) => $._each,

    _loop_operator: ($) => alias("@else", $.directive),

    _each: ($) =>
      seq(
        alias("@each", $.directive_start),
        $._loop_directive_body,
        alias("@end", $.directive_end),
      ),

    // ==================
    // Slots
    // ==================
    slot: ($) =>
      seq(
        alias("@slot", $.directive_start),
        $._directive_parameter,
        optional(
          repeat1(
            choice(...nodes.without($.slot)),
          ),
        ),
        alias(/@end(slot)?/, $.directive_end),
      ),

    // ==================
    // Stack push directives
    // ==================
    stack_push: ($) =>
      seq(
        alias(
          choice(
            "@pushTo",
            "@pushOnceTo",
            "@pushToTop",
            "@pushOnceToTop",
          ),
          $.directive_start,
        ),
        $._directive_parameter,
        optional(
          repeat1(
            choice(...nodes.without($.stack_push)),
          ),
        ),
        alias("@end", $.directive_end),
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
    component: ($) =>
      seq(
        alias(
          choice(
            "@component",
            token(prec(-1, /@[a-zA-Z][a-zA-Z\d.]*/)),
          ),
          $.directive_start,
        ),
        $._directive_parameter,
        optional(
          repeat1(
            choice(...nodes.all()),
          ),
        ),
        alias("@end", $.directive_end),
      ),

    // ==================
    // HTML attribute overrides
    // ==================
    attribute: ($) =>
      choice(
        $._html_attribute,
        $.edge_expression,
      ),

    attribute_name: (_) => token(prec(-1, /[^<>"'/=\s]+/)),
    attribute_value: (_) => token(prec(-1, /[^<>"'/=\s]+/)),

    quoted_attribute_value: ($) =>
      choice(
        seq(
          "'",
          optional(
            repeat(
              choice(
                $.edge_expression,
                $.conditional,
                $._inline_directive,
                $.comment,
                alias($._singly_quoted_attribute_text, $.attribute_value),
              ),
            ),
          ),
          "'",
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
                alias($._doubly_quoted_attribute_text, $.attribute_value),
              ),
            ),
          ),
          '"',
        ),
      ),

    _html_attribute: ($) =>
      seq(
        $.attribute_name,
        optional(
          seq(
            "=",
            choice($.attribute_value, $.quoted_attribute_value),
          ),
        ),
      ),

    // ==================
    // Engine helpers (body rules)
    // ==================

    // Conditional body helpers
    _conditonal_body: ($) =>
      repeat1(choice(...nodes.with($.conditional_keyword).all())),

    _conditional_directive_body: ($) =>
      seq($._directive_parameter, optional($._conditonal_body)),

    // Loop body helpers
    _loop_body: ($) =>
      repeat1(
        choice(
          ...nodes.with($._loop_operator).all(),
        ),
      ),

    _loop_directive_body: ($) =>
      seq($._directive_parameter, optional($._loop_body)),

    // ==================
    // Directive parameter (parenthesis-balanced)
    // ==================
    _directive_parameter: ($) =>
      seq(
        "(",
        optional(repeat($.parameter)),
        ")",
      ),

    // Parenthesis balancing for function calls, objects, etc. inside parameters
    parameter: ($) => choice(/[^()]+/, $._nested_parentheses),
    _nested_parentheses: ($) => seq("(", repeat($.parameter), ")"),

    // ==================
    // Text
    // ==================
    text: ($) => prec.right(repeat1($._text)),

    _text: (_) =>
      choice(
        // orphan tags
        token(prec(-2, /[{}!@()?,-]/)),
        // general text (catch-all)
        token(
          prec(
            -1,
            /[^\s(){!}@-]([^<>(){!}@,?]*[^<>{!}()@?,-])?/,
          ),
        ),
        // unmatched @ followed by non-tag characters
        token(prec(-1, /@[a-zA-Z\d]*[^\(-]/)),
      ),

    _singly_quoted_attribute_text: (_) =>
      prec.right(
        repeat1(
          choice(
            token(prec(-2, /[{}]/)),
            token(prec(-1, /[^'{}]/)),
          ),
        ),
      ),

    _doubly_quoted_attribute_text: (_) =>
      prec.right(
        repeat1(
          choice(
            token(prec(-2, /[{}]/)),
            token(prec(-1, /[^"{}]/)),
          ),
        ),
      ),
  },
});
