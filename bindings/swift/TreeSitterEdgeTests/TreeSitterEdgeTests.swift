import XCTest
import SwiftTreeSitter
import TreeSitterEdge

final class TreeSitterEdgeTests: XCTestCase {
    func testGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_edge())
        try parser.setLanguage(language);

        let source = "{{ user.name }}";

        let tree = try XCTUnwrap(parser.parse(source))
        let root = try XCTUnwrap(tree.rootNode)

        XCTAssertFalse(root.hasError)
    }
}
