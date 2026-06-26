# Spellcheck Fix

A tiny Obsidian plugin that wakes up the spellchecker on Linux, where it often
stays silent until you manually re-pick the languages.

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

- It reads the languages **you** chose in Obsidian's settings — nothing is
  hard-coded (there's only a `["en-US", "ru"]` fallback if the session reports
  none).
- It does **not** force spell-check on: if you turned it off in settings, the
  plugin does nothing.
- A command, **"Spellcheck Fix: Re-apply spellchecker languages now"**, lets you
  re-run it manually from the command palette (Ctrl/Cmd-P) if needed.

> **Note:** Chromium only checks text *as you edit it*. Already-rendered text is
> not re-checked retroactively, so to confirm it works, type a misspelled word
> (e.g. `recieve`) rather than staring at existing text.

## Installation (manual)

1. Create a folder `spellcheck-fix` inside your vault's
   `.obsidian/plugins/` directory.
2. Copy `main.js` and `manifest.json` into it.
3. In Obsidian: **Settings → Community plugins**, refresh the list, and enable
   **Spellcheck Fix**.

## Notes

- Desktop only (the bug and the fix are specific to the Electron spellchecker).
- Primarily aimed at Linux; harmless elsewhere.

## License

[MIT](LICENSE)
