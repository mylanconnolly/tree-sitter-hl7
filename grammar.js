/**
 * @file HL7 v2 (pipe-delimited) grammar for tree-sitter
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// A grammar for highlighting, not for validation. It is deliberately flat:
// a segment is its name followed by a run of tokens (text, separators,
// escape sequences), with no nodes for fields or components. HL7 feeds run
// to tens of megabytes and millions of fields; a node per field would cost
// more memory than the highlighting is worth.
//
// It assumes the standard separators | ^ ~ \ &. A message that declares
// others in its MSH still parses, but its separators are read as text.
module.exports = grammar({
  name: "hl7",

  extras: (_) => [],

  rules: {
    // One segment per line; blank lines are allowed anywhere.
    document: ($) =>
      seq(optional($._line), repeat(seq($._newline, optional($._line)))),

    _line: ($) => choice($.header, $.segment),

    // MSH (and the batch/file headers) declare the separators, so the
    // characters after the name are data, not delimiters.
    header: ($) =>
      seq(
        alias(choice("MSH", "FHS", "BHS"), $.segment_name),
        $.field_separator,
        optional($.encoding_characters),
        repeat($._token),
      ),

    segment: ($) => seq($.segment_name, repeat($._token)),

    _token: ($) =>
      choice(
        $.field_separator,
        $.component_separator,
        $.repetition_separator,
        $.subcomponent_separator,
        $.escape_sequence,
        $.text,
      ),

    segment_name: (_) => /[A-Z][A-Z0-9]{2}/,

    // Runs of one separator are a single token: empty fields (`|||||`)
    // are the most common thing in a feed.
    field_separator: (_) => /\|+/,
    component_separator: (_) => /\^+/,
    repetition_separator: (_) => /~+/,
    subcomponent_separator: (_) => /&+/,

    encoding_characters: (_) => token.immediate(/[^|\r\nA-Za-z0-9 ]{1,6}/),

    // \F\ \S\ \T\ \R\ \E\ \Xhh..\ \.br\ \H\ \N\ and friends.
    escape_sequence: (_) => /\\[^\\|\r\n]*\\/,

    // A lone backslash that never closes is just text.
    text: (_) => choice(/[^|^~&\\\r\n]+/, "\\"),

    _newline: (_) => /\r\n|\r|\n/,
  },
});
