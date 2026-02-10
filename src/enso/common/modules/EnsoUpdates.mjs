// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import createSidebarNotification from "chrome://browser/content/enso-components/EnsoSidebarNotification.mjs";

const ENSO_UPDATE_PREF = "enso.updates.last-version";
const ENSO_BUILD_ID_PREF = "enso.updates.last-build-id";
const ENSO_UPDATE_SHOW = "enso.updates.show-update-notification";

export default function checkForEnsoUpdates() {
  const version = Services.appinfo.version;
  const lastVersion = Services.prefs.getStringPref(ENSO_UPDATE_PREF, "");
  Services.prefs.setStringPref(ENSO_UPDATE_PREF, version);
  if (
    version !== lastVersion &&
    !gEnsoUIManager.testingEnabled &&
    Services.prefs.getBoolPref(ENSO_UPDATE_SHOW, true)
  ) {
    const updateUrl = Services.prefs.getStringPref("app.releaseNotesURL.prompt", "");
    createSidebarNotification({
      headingL10nId: "enso-sidebar-notification-updated-heading",
      links: [
        {
          url: Services.urlFormatter.formatURL(updateUrl.replace("%VERSION%", version)),
          l10nId: "enso-sidebar-notification-updated",
          special: true,
          icon: "chrome://browser/skin/enso-icons/heart-circle-fill.svg",
        },
        {
          action: () => {
            Services.obs.notifyObservers(window, "restart-in-safe-mode");
          },
          l10nId: "enso-sidebar-notification-restart-safe-mode",
          icon: "chrome://browser/skin/enso-icons/security-broken.svg",
        },
      ],
    });
  }
}

export async function createWindowUpdateAnimation() {
  const appID = Services.appinfo.appBuildID;
  if (
    Services.prefs.getStringPref(ENSO_BUILD_ID_PREF, "") === appID ||
    gEnsoUIManager.testingEnabled
  ) {
    return;
  }
  Services.prefs.setStringPref(ENSO_BUILD_ID_PREF, appID);
  await gEnsoWorkspaces.promiseInitialized;
  const appWrapper = document.getElementById("enso-main-app-wrapper");
  const element = document.createElement("div");
  element.id = "enso-update-animation";
  const elementBorder = document.createElement("div");
  elementBorder.id = "enso-update-animation-border";
  requestIdleCallback(() => {
    if (gReduceMotion) {
      return;
    }
    appWrapper.appendChild(element);
    appWrapper.appendChild(elementBorder);
    Promise.all([
      gEnsoUIManager.motion.animate(
        "#enso-update-animation",
        {
          top: ["100%", "-50%"],
          opacity: [0.5, 1],
        },
        {
          duration: 0.35,
        }
      ),
      gEnsoUIManager.motion.animate(
        "#enso-update-animation-border",
        {
          "--background-top": ["150%", "-50%"],
        },
        {
          duration: 0.35,
          delay: 0.08,
        }
      ),
    ]).then(() => {
      element.remove();
      elementBorder.remove();
    });
  });
}
