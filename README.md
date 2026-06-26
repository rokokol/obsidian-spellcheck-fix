# Spellcheck Fix

A tiny Obsidian plugin that wakes up the spellchecker. In big vaults it can stucks.

## The problem

On Linux (Electron/Chromium), Obsidian's spellchecker frequently does nothing:
no red squiggles under misspelled words, even though everything looks correctly
configured. A common "fix" people discover is to open
**Settings → Editor → Spellcheck languages**, remove a language and add it back —
after which it works, but only until the next restart.

The reason: at startup Chromium restores the spellchecker state from its profile
(the languages are there, the dictionaries are downloaded, the checker reports as
enabled), but the checker never actually **attaches** to the window until
`session.setSpellCheckerLanguages()` is called again. Obsidian trusts the
persisted state and never re-applies it, so spell-check stays dormant. Manually
re-selecting the languages is exactly what calls that method — hence "works until
restart".

## What this plugin does

Once the workspace is ready, it re-applies the spellchecker languages, which
re-attaches the dormant checker. That's the whole trick.

Re-applying the *same* language list is a no-op, so it would not wake anything —
the call has to be a real change:

- **With two or more languages**, it reverses their order. That's a genuine
  change, so a single call re-attaches the checker instantly with no delay.
  (Which language is "primary" barely matters for a mixed setup, and the order
  simply flips on each launch.)
- **With a single language**, reversing changes nothing, so it briefly clears the
  list and restores it ~200&nbsp;ms later — the clear-then-restore is the real
  change that wakes the checker.

Other details:

- It reads the languages **you** chose in Obsidian's settings — nothing is
  hard-coded (there's only a `["en-US", "ru"]` fallback if the session reports
  none).
- A command, **"Spellcheck Fix: Re-apply spellchecker languages now"**, lets you
  re-run it manually from the command palette (Ctrl/Cmd-P) if needed.

> [!note]
> Chromium only checks text *as you edit it*. Already-rendered text is not re-checked retroactively, so to confirm it works, start typing rather than staring at existing text.

## Installation (manual)

1. Create a folder `spellcheck-fix` inside your vault's
   `.obsidian/plugins/` directory.
2. Copy `main.js` and `manifest.json` into it.
3. In Obsidian: **Settings → Community plugins**, refresh the list, and enable
   **Spellcheck Fix**.

## Notes

- Desktop only (the bug and the fix are specific to the Electron spellchecker).
- Primarily aimed at Linux; harmless elsewhere.
