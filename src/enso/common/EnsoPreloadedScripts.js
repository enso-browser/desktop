// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// prettier-ignore
// eslint-disable-next-line no-lone-blocks
{
  Services.scriptloader.loadSubScript("chrome://browser/content/enso-components/EnsoWorkspaceBookmarksStorage.js", this);

  ChromeUtils.importESModule("chrome://browser/content/EnsoStartup.mjs", { global: "current" });
  ChromeUtils.importESModule("chrome://browser/content/enso-components/EnsoCompactMode.mjs", { global: "current" });
  ChromeUtils.importESModule("chrome://browser/content/EnsoUIManager.mjs", { global: "current" });
  ChromeUtils.importESModule("chrome://browser/content/enso-components/EnsoMods.mjs", { global: "current" });
  ChromeUtils.importESModule("chrome://browser/content/enso-components/EnsoKeyboardShortcuts.mjs", { global: "current" });
  ChromeUtils.importESModule("chrome://browser/content/enso-components/EnsoSessionStore.mjs", { global: "current" });

  Services.scriptloader.loadSubScript("chrome://browser/content/enso-components/EnsoDragAndDrop.js", this);
}
