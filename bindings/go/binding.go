package tree_sitter_edge

// #cgo CFLAGS: -I../../src -std=c11 -fPIC
// #include "../../src/parser.c"
// #include "../../src/scanner.c"
import "C"

import "unsafe"

// Get the tree-sitter Language for the Edge grammar.
func Language() unsafe.Pointer {
	return unsafe.Pointer(C.tree_sitter_edge())
}
