package tree_sitter_edge_test

import (
	"testing"

	tree_sitter_edge "github.com/pear/tree-sitter-edge/bindings/go"
	tree_sitter "github.com/tree-sitter/go-tree-sitter"
)

func TestGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_edge.Language())
	if language == nil {
		t.Errorf("Error loading Edge grammar")
	}

	sourceCode := []byte("{{ user.name }}")
	parser := tree_sitter.NewParser()
	defer parser.Close()
	parser.SetLanguage(language)

	tree := parser.Parse(sourceCode, nil)
	if tree == nil || tree.RootNode().HasError() {
		t.Errorf("Error parsing Edge")
	}
}
