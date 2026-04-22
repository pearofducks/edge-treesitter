; inherits: html

[
  (conditional)
  (loop)
  (component)
  (slot)
  (stack_push)
] @indent.begin

(conditional
  (directive_end) @indent.end)

(loop
  (directive_end) @indent.end)

(component
  (directive_end) @indent.end)

(slot
  (directive_end) @indent.end)

(stack_push
  (directive_end) @indent.end)

[
  (directive_end)
  (conditional_keyword)
] @indent.branch
