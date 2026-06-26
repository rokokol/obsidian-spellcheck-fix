'use strict';

const { Plugin } = require('obsidian');

// Workaround for Linux/Electron: the spellchecker state is restored from the
// Chromium profile (Preferences) at startup but does not actually attach to the
// window's webContents until setSpellCheckerLanguages() is called again. Obsidian
// trusts the persisted state and never re-applies it, so spell-check stays dormant
// until you manually re-pick the languages. The "kick" below re-assigns the
// languages, which wakes it up. It operates on the Electron session (not the
// editor DOM), so we just run it once the workspace is ready.
module.exports = class SpellcheckFix extends Plugin {
  onload() {
    this.app.workspace.onLayoutReady(() => this.reapply());

    this.addCommand({
      id: 'reapply-spellchecker-languages',
      name: 'Re-apply spellchecker languages now',
      callback: () => this.reapply(),
    });
  }

  reapply() {
    // Respect the user's choice: if spell-check is turned off in Obsidian's
    // settings, do nothing — never force it back on.
    if (this.app.vault.getConfig('spellcheck') === false) return;
    try {
      const ses = require('@electron/remote').session.defaultSession;
      const current = ses.getSpellCheckerLanguages() || [];
      // Re-applying the *same* language list is a no-op, so it would not wake the
      // dormant spellchecker. We need a real change. With 2+ languages we just
      // reverse the order — that is a genuine diff, so a single synchronous call
      // re-attaches the spellchecker with no delay (which language is "primary"
      // barely matters for a ru/en mix). With <2 languages reversing changes
      // nothing, so we fall back to the toggle-through-empty trick.
      if (current.length >= 2) {
        ses.setSpellCheckerLanguages([...current].reverse());
        console.log('[spellcheck-fix] woke spellchecker via reorder:', current);
      } else {
        const langs = current.length ? current : ['en-US', 'ru'];
        ses.setSpellCheckerLanguages([]);
        const handle = window.setTimeout(() => {
          ses.setSpellCheckerLanguages(langs);
          console.log('[spellcheck-fix] re-applied spellchecker languages:', langs);
        }, 200);
        this.register(() => window.clearTimeout(handle));
      }
    } catch (e) {
      console.error('[spellcheck-fix] failed to re-apply spellchecker languages', e);
    }
  }
};
