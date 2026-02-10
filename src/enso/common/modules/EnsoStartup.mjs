// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import checkForEnsoUpdates, {
  createWindowUpdateAnimation,
} from "chrome://browser/content/EnsoUpdates.mjs";

class EnsoStartup {
  #watermarkIgnoreElements = ["enso-toast-container"];
  #hasInitializedLayout = false;

  isReady = false;

  init() {
    this.openWatermark();
    this.#initBrowserBackground();
    this.#changeSidebarLocation();
    this.#ensoInitBrowserLayout();
  }

  #initBrowserBackground() {
    const background = document.createXULElement("box");
    background.id = "enso-browser-background";
    background.classList.add("enso-browser-generic-background");
    const grain = document.createXULElement("box");
    grain.classList.add("enso-browser-grain");
    background.appendChild(grain);
    document.getElementById("browser").prepend(background);
    const toolbarBackground = background.cloneNode(true);
    toolbarBackground.removeAttribute("id");
    toolbarBackground.classList.add("enso-toolbar-background");
    document.getElementById("titlebar").prepend(toolbarBackground);
  }

  #ensoInitBrowserLayout() {
    if (this.#hasInitializedLayout) {
      return;
    }
    this.#hasInitializedLayout = true;
    gEnsoKeyboardShortcutsManager.beforeInit();
    try {
      const kNavbarItems = ["nav-bar", "PersonalToolbar"];
      const kNewContainerId = "enso-appcontent-navbar-container";
      let newContainer = document.getElementById(kNewContainerId);
      for (let id of kNavbarItems) {
        const node = document.getElementById(id);
        if (!node) {
          console.error("Could not find node with id: " + id);
          continue;
        }
        newContainer.appendChild(node);
      }

      // Fix notification deck
      const deckTemplate = document.getElementById("tab-notification-deck-template");
      if (deckTemplate) {
        document.getElementById("enso-appcontent-wrapper").prepend(deckTemplate);
      }

      gEnsoWorkspaces.init();
      setTimeout(() => {
        gEnsoUIManager.init();
        this.#checkForWelcomePage();
      }, 0);
    } catch (e) {
      console.error("EnsoThemeModifier: Error initializing browser layout", e);
    }
    if (gBrowserInit.delayedStartupFinished) {
      this.delayedStartupFinished();
    } else {
      Services.obs.addObserver(this, "browser-delayed-startup-finished");
    }
  }

  observe(aSubject, aTopic) {
    // This nsIObserver method allows us to defer initialization until after
    // this window has finished painting and starting up.
    if (aTopic == "browser-delayed-startup-finished" && aSubject == window) {
      Services.obs.removeObserver(this, "browser-delayed-startup-finished");
      this.delayedStartupFinished();
    }
  }

  delayedStartupFinished() {
    gEnsoWorkspaces.promiseInitialized.then(async () => {
      await delayedStartupPromise;
      await SessionStore.promiseAllWindowsRestored;
      delete gEnsoUIManager.promiseInitialized;
      gEnsoCompactModeManager.init();
      // Fix for https://github.com/enso-browser/desktop/issues/7605, specially in compact mode
      if (gURLBar.hasAttribute("breakout-extend")) {
        gURLBar.focus();
      }
      // A bit of a hack to make sure the tabs toolbar is updated.
      // Just in case we didn't get the right size.
      gEnsoUIManager.updateTabsToolbar();
      this.closeWatermark();
      document.getElementById("tabbrowser-arrowscrollbox").setAttribute("orient", "vertical");
      this.isReady = true;
    });
  }

  openWatermark() {
    if (!Services.prefs.getBoolPref("enso.watermark.enabled", false)) {
      document.documentElement.removeAttribute("enso-before-loaded");
      return;
    }
    for (let elem of document.querySelectorAll("#browser > *, #urlbar")) {
      elem.style.opacity = 0;
    }
  }

  closeWatermark() {
    document.documentElement.removeAttribute("enso-before-loaded");
    if (Services.prefs.getBoolPref("enso.watermark.enabled", false)) {
      let elementsToIgnore = this.#watermarkIgnoreElements.map((id) => "#" + id).join(", ");
      gEnsoUIManager.motion
        .animate(
          "#browser > *:not(" + elementsToIgnore + "), #urlbar, #tabbrowser-tabbox > *",
          {
            opacity: [0, 1],
          },
          {
            duration: 0.1,
          }
        )
        .then(() => {
          for (let elem of document.querySelectorAll(
            "#browser > *, #urlbar, #tabbrowser-tabbox > *"
          )) {
            elem.style.removeProperty("opacity");
          }
        });
    }
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new window.Event("resize")); // To recalculate the layout
    });
  }

  #changeSidebarLocation() {
    const kElementsToAppend = ["sidebar-splitter", "sidebar-box"];

    const browser = document.getElementById("browser");
    browser.prepend(gNavToolbox);

    const sidebarPanelWrapper = document.getElementById("tabbrowser-tabbox");
    for (let id of kElementsToAppend) {
      const elem = document.getElementById(id);
      if (elem) {
        sidebarPanelWrapper.prepend(elem);
      }
    }
  }

  #checkForWelcomePage() {
    if (!Services.prefs.getBoolPref("enso.welcome-screen.seen", false)) {
      Services.prefs.setBoolPref("enso.welcome-screen.seen", true);
      Services.prefs.setStringPref("enso.updates.last-build-id", Services.appinfo.appBuildID);
      Services.prefs.setStringPref("enso.updates.last-version", Services.appinfo.version);
      Services.scriptloader.loadSubScript(
        "chrome://browser/content/enso-components/EnsoWelcome.mjs",
        window
      );
    } else {
      this.#createUpdateAnimation();
    }
  }

  async #createUpdateAnimation() {
    checkForEnsoUpdates();
    return await createWindowUpdateAnimation();
  }
}

window.gEnsoStartup = new EnsoStartup();

window.addEventListener(
  "MozBeforeInitialXULLayout",
  () => {
    gEnsoStartup.init();
  },
  { once: true }
);
