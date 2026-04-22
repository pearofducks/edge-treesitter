# tree-sitter-edge

Tree-sitter grammar for [Edge.js](https://edgejs.dev) templates, with built-in Neovim support.

## Neovim Installation

Requires the [tree-sitter CLI](https://tree-sitter.github.io/tree-sitter/creating-parsers#installation) for first-time parser compilation.

### lazy.nvim

```lua
{ "pearofducks/edge-treesitter" }
```

### vim.pack.add

```lua
vim.pack.add({ "https://github.com/pearofducks/edge-treesitter" })
```

The parser is compiled automatically on first load. Restart Neovim after initial install.

## Included TS features

- **Filetype detection** for `.edge` files
- **Syntax highlighting** via tree-sitter (inherits HTML highlighting)
- **JavaScript injection** inside `{{ }}`, `{{{ }}}`, and directive parameters
- **Code folding** for `@if`, `@each`, `@component`, `@slot`, `@pushTo` blocks
- **Indentation** for Edge block directives
- **Comment toggling** (`gcc` etc.) using `{{-- --}}` format
- **`gf` support** for `resources/views/` paths with `.edge` suffix

## Supported Syntax

| Construct | Example |
|-----------|---------|
| Escaped output | `{{ user.name }}` |
| Raw output | `{{{ html.safe(content) }}}` |
| Passthrough | `@{{ frontendVar }}` |
| Comments | `{{-- text --}}` |
| Conditionals | `@if(expr)` / `@elseif(expr)` / `@else` / `@end` |
| Unless | `@unless(expr)` / `@end` |
| Loops | `@each(item in list)` / `@else` / `@end` |
| Partials | `@include('path')`, `@includeIf(cond, 'path')` |
| Components | `@component('name', props)` / `@end` |
| Component tags | `@modal()` / `@end`, `@layout.app()` / `@end` |
| Self-closing | `@!component('name', props)`, `@!button()` |
| Slots | `@slot('name')` / `@end` |
| Stacks | `@stack('name')`, `@pushTo('name')` / `@end` |
| Variables | `@let(x = value)`, `@eval(expr)`, `@inject(state)` |
| Debugger | `@debugger` |

## Development

### Prerequisites

- [Node.js](https://nodejs.org)
- [Deno](https://deno.land) (for bundling the TypeScript grammar source)
- [tree-sitter CLI](https://tree-sitter.github.io/tree-sitter/creating-parsers#installation)

### Build

The grammar source is written in TypeScript at `main/grammar.ts` and bundled to `grammar.js` via esbuild.

```sh
npm install --ignore-scripts
deno task bundle          # bundle main/grammar.ts → grammar.js
tree-sitter generate      # generate src/parser.c from grammar.js
```

### Test

```sh
tree-sitter test
```

Tests live in `test/corpus/`. Each `.txt` file contains test cases with input Edge templates and expected AST output.

### Parse a file

```sh
tree-sitter parse example.edge
```

### Playground

```sh
tree-sitter build --wasm
tree-sitter playground
```

### Adding a new Edge tag

1. Add the tag to the appropriate rule in `main/grammar.ts`:
   - **Inline directive** (no body): add to the `_inline_directive` choice list
   - **Block directive** (has `@end`): add a new rule or extend `component` (catch-all)
   - **Keyword** (no arguments): add to the `keyword` rule
2. Run `deno task bundle && tree-sitter generate`
3. Add a test case in `test/corpus/`
4. Run `tree-sitter test`

### How the grammar works

The grammar inherits from `tree-sitter-html` (included as a git submodule) and adds Edge-specific rules on top. HTML elements, attributes, script/style tags are all parsed by the HTML grammar. Edge constructs (`@if`, `{{ }}`, etc.) are additional node types injected into the HTML document tree.

Key design decisions:

- **Component catch-all**: any `@word()` or `@word.sub()` that doesn't match a known built-in tag is parsed as a `component` node. This handles Edge's component-as-tag feature where filenames become tag names. Known tags (`@if`, `@each`, `@slot`, etc.) have higher precedence.
- **Universal `@end`**: Edge closes all block-level tags with `@end` (unlike Blade's `@endif`, `@endforeach`, etc.). The `@slot` tag also accepts `@endslot`.
- **JavaScript injection**: expressions inside `{{ }}`, `{{{ }}}`, and directive parameters are aliased as `javascript` nodes, enabling language injection in editors.

## Credits

Grammar structure based on [tree-sitter-blade](https://github.com/EmranMR/tree-sitter-blade) by Emran Mashhadi Ramezan.

## License

MIT
