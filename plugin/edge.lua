vim.filetype.add({ extension = { edge = "edge" } })

local plugin_dir = vim.fn.fnamemodify(debug.getinfo(1, "S").source:sub(2), ":p:h:h")
local parser_dir = vim.fs.joinpath(plugin_dir, "parser")
local parser_so = vim.fs.joinpath(parser_dir, "edge.so")

if vim.fn.filereadable(parser_so) == 0 then
  vim.fn.mkdir(parser_dir, "p")
  local result = vim.system(
    { "tree-sitter", "build", "-o", parser_so },
    { cwd = plugin_dir }
  ):wait()
  if result.code == 0 then
    vim.notify("[edge-treesitter] Parser compiled successfully.", vim.log.levels.INFO)
  else
    vim.notify("[edge-treesitter] Parser compilation failed: " .. (result.stderr or ""), vim.log.levels.ERROR)
  end
end
