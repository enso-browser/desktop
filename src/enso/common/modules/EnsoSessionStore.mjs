// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { nsZenPreloadedFeature } from "chrome://browser/content/enso-components/EnsoCommonUtils.mjs";

class EnsoSessionStore extends nsZenPreloadedFeature {
  init() {
    this.#waitAndCleanup();
  }

  promiseInitialized = new Promise((resolve) => {
    this._resolveInitialized = resolve;
  });

  restoreInitialTabData(tab, tabData) {
    if (tabData.ensoWorkspace) {
      tab.setAttribute("enso-workspace-id", tabData.ensoWorkspace);
    }
    // Keep for now, for backward compatibility for window sync to work.
    if (tabData.ensoSyncId || tabData.ensoPinnedId) {
      tab.setAttribute("id", tabData.ensoSyncId || tabData.ensoPinnedId);
    }
    if (typeof tabData.ensoStaticLabel === "string") {
      tab.ensoStaticLabel = tabData.ensoStaticLabel;
    }
    if (tabData.ensoHasStaticIcon && tabData.image) {
      tab.ensoStaticIcon = tabData.image;
    }
    if (tabData.ensoEssential) {
      tab.setAttribute("enso-essential", "true");
    }
    if (tabData.ensoDefaultUserContextId) {
      tab.setAttribute("ensoDefaultUserContextId", "true");
    }
    if (tabData._ensoPinnedInitialState) {
      tab._ensoPinnedInitialState = tabData._ensoPinnedInitialState;
    }
  }

  async #waitAndCleanup() {
    await SessionStore.promiseInitialized;
    this.#cleanup();
  }

  #cleanup() {
    this._resolveInitialized();
  }
}

window.gEnsoSessionStore = new EnsoSessionStore();
