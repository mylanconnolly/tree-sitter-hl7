# tree-sitter-hl7

A [tree-sitter](https://tree-sitter.github.io) grammar for HL7 v2
(pipe-delimited) messages, meant for syntax highlighting.

```
MSH|^~\&|LAB|HOSP|||20240131||ORU^R01|MSG00001|P|2.5.1
PID|1||12345^^^HOSP^MR||DOE^JOHN
OBX|1|NM|GLU^Glucose^L||95|mg/dL|70-99|N|||F
```

## Shape of the tree

The grammar is flat on purpose. A segment is its name followed by a run of
tokens; there are no nodes for fields or components:

```
(segment
  (segment_name)
  (field_separator)
  (text)
  (component_separator)
  (text))
```

Feeds run to tens of megabytes and millions of fields, and every node
costs memory. Even this flat tree needs about 2.5 GB and 5 seconds for a
60 MB file, so an editor should parse only the lines it shows. That is
always safe: each line parses the same on its own as it does in context.

Node types: `header` (MSH, FHS, BHS), `segment`, `segment_name`,
`field_separator`, `component_separator`, `repetition_separator`,
`subcomponent_separator`, `encoding_characters`, `escape_sequence`, `text`.
A run of one separator (`|||`) is a single node.

## Limits

- The standard separators `| ^ ~ \ &` are assumed. A message that declares
  others in MSH parses with errors or with its separators read as text.
- Lines may end in CR, LF or CRLF.
- It checks nothing about HL7 itself: any three-character name is a
  segment.

## Develop

```
tree-sitter generate
tree-sitter test
```

`src/` is generated and committed so the grammar can be compiled without
the tree-sitter CLI.

## License

MIT. See `LICENSE`.
