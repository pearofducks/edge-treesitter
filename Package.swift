// swift-tools-version:5.3
import PackageDescription

let package = Package(
  name: "TreeSitterEdge",
  products: [
    .library(name: "TreeSitterEdge", targets: ["TreeSitterEdge"]),
  ],
  dependencies: [
    .package(url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.9.0"),
  ],
  targets: [
    .target(
      name: "TreeSitterEdge",
      path: ".",
      sources: [
        "src/parser.c",
        "src/scanner.c",
      ],
      resources: [
        .copy("queries")
      ],
      publicHeadersPath: "bindings/swift",
      cSettings: [.headerSearchPath("src")]
    ),
    .testTarget(
      name: "TreeSitterEdgeTests",
      dependencies: [
        .product(name: "SwiftTreeSitter", package: "swift-tree-sitter"),
        "TreeSitterEdge",
      ],
      path: "bindings/swift/TreeSitterEdgeTests"
    )
  ]
)
