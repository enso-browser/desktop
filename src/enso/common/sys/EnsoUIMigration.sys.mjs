/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppConstants } from "resource://gre/modules/AppConstants.sys.mjs";

const lazy = {};

ChromeUtils.defineESModuleGetters(lazy, {
  SessionStore: "resource:///modules/sessionstore/SessionStore.sys.mjs",
});

class nsEnsoUIMigration {
  PREF_NAME = "enso.ui.migration.version";
  MIGRATION_VERSION = 6;

  init(isNewProfile) {
    if (!isNewProfile) {
      try {
        this._migrate();
      } catch (e) {
        console.error("EnsoUIMigration: Error during migration", e);
      }
    }
    this.clearVariables();
    if (this.shouldRestart) {
      Services.startup.quit(Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart);
    }
  }

  get _migrationVersion() {
    return Services.prefs.getIntPref(this.PREF_NAME, 0);
  }

  set _migrationVersion(value) {
    Services.prefs.setIntPref(this.PREF_NAME, value);
  }

  _migrate() {
    for (let i = 0; i <= this.MIGRATION_VERSION; i++) {
      if (this._migrationVersion < i) {
        this[`_migrateV${i}`]?.();
      }
    }
  }

  clearVariables() {
    this._migrationVersion = this.MIGRATION_VERSION;
  }

  _migrateV1() {
    // If there's an userChrome.css or userContent.css existing, we set
    // 'toolkit.legacyUserProfileCustomizations.stylesheets' back to true
    // We do this to avoid existing user stylesheets to be ignored
    const profileDir = Services.dirsvc.get("ProfD", Ci.nsIFile);
    const userChromeFile = profileDir.clone();
    userChromeFile.append("chrome");
    userChromeFile.append("userChrome.css");
    const userContentFile = profileDir.clone();
    userContentFile.append("chrome");
    userContentFile.append("userContent.css");
    Services.prefs.setBoolPref(
      "enso.workspaces.separate-essentials",
      Services.prefs.getBoolPref("enso.workspaces.container-specific-essentials-enabled", false)
    );
    const theme = Services.prefs.getIntPref("layout.css.prefers-color-scheme.content-override", 0);
    Services.prefs.setIntPref("enso.view.window.scheme", theme);
    if (userChromeFile.exists() || userContentFile.exists()) {
      Services.prefs.setBoolPref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
      console.warn("EnsoUIMigration: User stylesheets detected, enabling legacy stylesheets.");
      this.shouldRestart = true;
    }
  }

  _migrateV2() {
    if (AppConstants.platform !== "linux") {
      Services.prefs.setIntPref("enso.theme.gradient-legacy-version", 0);
    }
  }

  _migrateV3() {
    if (Services.prefs.getStringPref("enso.theme.accent-color", "").startsWith("system")) {
      Services.prefs.setStringPref("enso.theme.accent-color", "AccentColor");
    }
  }

  _migrateV4() {
    // Fix spelling mistake in preference name
    Services.prefs.setBoolPref(
      "enso.theme.use-system-colors",
      Services.prefs.getBoolPref("enso.theme.use-sysyem-colors", false)
    );
  }

  _migrateV5() {
    Services.prefs.setBoolPref("enso.site-data-panel.show-callout", true);
  }

  _migrateV6() {
    lazy.SessionStore.promiseAllWindowsRestored.then(() => {
      const win = Services.wm.getMostRecentWindow("navigator:browser");
      win.setTimeout(async () => {
        const [title, message, learnMore, accept] = await win.document.l10n.formatMessages([
          "enso-window-sync-migration-dialog-title",
          "enso-window-sync-migration-dialog-message",
          "enso-window-sync-migration-dialog-learn-more",
          "enso-window-sync-migration-dialog-accept",
        ]);

        // buttonPressed will be 0 for cancel, 1 for "more info"
        let buttonPressed = Services.prompt.confirmEx(
          win,
          title.value,
          message.value,
          Services.prompt.BUTTON_POS_0 * Services.prompt.BUTTON_TITLE_IS_STRING +
            Services.prompt.BUTTON_POS_1 * Services.prompt.BUTTON_TITLE_IS_STRING,
          learnMore.value,
          accept.value,
          null,
          null,
          {}
        );
        // User has clicked on "Learn More"
        if (buttonPressed === 0) {
          win.openTrustedLinkIn("https://docs.enso-browser.app/user-manual/window-sync", "tab");
        }
      }, 1000);
    });
  }
}

export var gEnsoUIMigration = new nsEnsoUIMigration();
