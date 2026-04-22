from unittest import TestCase

import tree_sitter_edge
from tree_sitter import Language, Parser

class TestLanguage(TestCase):
    def test_grammar(self):
        language = Language(tree_sitter_edge.language())
        parser = Parser(language)
        tree = parser.parse(b"{{ user.name }}")
        self.assertFalse(tree.root_node.has_error)
