vim.filetype.add({ extension = { edge = "edge" } })

local ok, parsers = pcall(require, "nvim-treesitter.parsers")
if ok and parsers.get_parser_configs then
  local parser_config = parsers.get_parser_configs()
  if not parser_config.edge then
    parser_config.edge = {
      install_info = {
        url = "https://github.com/pearofducks/edge-treesitter",
        files = { "src/parser.c", "src/scanner.c" },
        branch = "main",
      },
      filetype = "edge",
    }
  end
end
