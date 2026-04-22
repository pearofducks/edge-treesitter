vim.filetype.add({ extension = { edge = "edge" } })

local function register_parser()
  local ok, parsers = pcall(require, "nvim-treesitter.parsers")
  if ok and type(parsers) == "table" and not parsers.edge then
    parsers.edge = {
      install_info = {
        url = "https://github.com/pearofducks/edge-treesitter",
        files = { "src/parser.c", "src/scanner.c" },
        branch = "main",
      },
      tier = 4,
    }
  end
end

register_parser()

-- Re-inject after nvim-treesitter reloads its parser table (e.g. :TSUpdate)
vim.api.nvim_create_autocmd("User", {
  pattern = "TSUpdate",
  callback = register_parser,
})
