/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { XPCOMUtils } from "resource://gre/modules/XPCOMUtils.sys.mjs";

const lazy = {};

XPCOMUtils.defineLazyPreferenceGetter(lazy, "currentTheme", "enso.view.window.scheme", 2);

function isNotEmptyTab(window) {
  return !window.gBrowser.selectedTab.hasAttribute("enso-empty-tab");
}

const globalActionsTemplate = [
  {
    label: "Toggle Compact Mode",
    command: "cmd_ensoCompactModeToggle",
    icon: "chrome://browser/skin/enso-icons/sidebar.svg",
  },
  {
    label: "Open Theme Picker",
    command: "cmd_ensoOpenZenThemePicker",
    icon: "chrome://browser/skin/enso-icons/edit-theme.svg",
  },
  {
    label: "New Split View",
    command: "cmd_ensoNewEmptySplit",
    icon: "chrome://browser/skin/enso-icons/split.svg",
  },
  {
    label: "New Folder",
    command: "cmd_ensoOpenFolderCreation",
    icon: "chrome://browser/skin/enso-icons/folder.svg",
  },
  {
    label: "Copy Current URL",
    command: "cmd_ensoCopyCurrentURL",
    icon: "chrome://browser/skin/enso-icons/link.svg",
  },
  {
    label: "Settings",
    command: (window) => window.openPreferences(),
    icon: "chrome://browser/skin/enso-icons/settings.svg",
  },
  {
    label: "Open Private Window",
    command: "Tools:PrivateBrowsing",
    icon: "chrome://browser/skin/enso-icons/private-window.svg",
  },
  {
    label: "Open New Window",
    command: "cmd_newNavigator",
    icon: "chrome://browser/skin/enso-icons/window.svg",
  },
  {
    label: "New Blank Window",
    command: "cmd_ensoNewNavigatorUnsynced",
    icon: "chrome://browser/skin/enso-icons/window.svg",
  },
  {
    label: "Pin Tab",
    command: "cmd_ensoTogglePinTab",
    icon: "chrome://browser/skin/enso-icons/pin.svg",
    isAvailable: (window) => {
      const tab = window.gBrowser.selectedTab;
      return !tab.hasAttribute("enso-empty-tab") && !tab.pinned;
    },
  },
  {
    label: "Unpin Tab",
    command: "cmd_ensoTogglePinTab",
    icon: "chrome://browser/skin/enso-icons/unpin.svg",
    isAvailable: (window) => {
      const tab = window.gBrowser.selectedTab;
      return !tab.hasAttribute("enso-empty-tab") && tab.pinned;
    },
  },
  {
    label: "Next Space",
    command: "cmd_ensoWorkspaceForward",
    icon: "chrome://browser/skin/enso-icons/forward.svg",
    isAvailable: (window) => {
      return window.gEnsoWorkspaces._workspaceCache.length > 1;
    },
  },
  {
    label: "Previous Space",
    command: "cmd_ensoWorkspaceBackward",
    icon: "chrome://browser/skin/enso-icons/back.svg",
    isAvailable: (window) => {
      // This also covers the case of being in private mode
      return window.gEnsoWorkspaces._workspaceCache.length > 1;
    },
  },
  {
    label: "Close Tab",
    command: "cmd_close",
    icon: "chrome://browser/skin/enso-icons/close.svg",
    isAvailable: (window) => {
      return isNotEmptyTab(window);
    },
  },
  {
    label: "Reload Tab",
    command: "Browser:Reload",
    icon: "chrome://browser/skin/enso-icons/reload.svg",
  },
  {
    label: "Reload Tab Without Cache",
    command: "Browser:ReloadSkipCache",
    icon: "chrome://browser/skin/enso-icons/reload.svg",
  },
  {
    label: "Next Tab",
    command: "Browser:NextTab",
    icon: "chrome://browser/skin/enso-icons/forward.svg",
  },
  {
    label: "Previous Tab",
    command: "Browser:PrevTab",
    icon: "chrome://browser/skin/enso-icons/back.svg",
  },
  {
    label: "Capture Screenshot",
    command: "Browser:Screenshot",
    icon: "chrome://browser/skin/enso-icons/screenshot.svg",
    isAvailable: (window) => {
      return isNotEmptyTab(window);
    },
  },
  {
    label: "Toggle Tabs on right",
    command: "cmd_ensoToggleTabsOnRight",
    icon: "chrome://browser/skin/enso-icons/sidebars-right.svg",
  },
  {
    label: "Add to Essentials",
    command: (window) => window.gEnsoPinnedTabManager.addToEssentials(window.gBrowser.selectedTab),
    isAvailable: (window) => {
      return (
        window.gEnsoPinnedTabManager.canEssentialBeAdded(window.gBrowser.selectedTab) &&
        !window.gBrowser.selectedTab.hasAttribute("enso-essential")
      );
    },
    icon: "chrome://browser/skin/enso-icons/essential-add.svg",
  },
  {
    label: "Remove from Essentials",
    command: (window) => window.gEnsoPinnedTabManager.removeEssentials(window.gBrowser.selectedTab),
    isAvailable: (window) => window.gBrowser.selectedTab.hasAttribute("enso-essential"),
    icon: "chrome://browser/skin/enso-icons/essential-remove.svg",
  },
  {
    label: "Find in Page",
    command: "cmd_find",
    icon: "chrome://browser/skin/enso-icons/search-page.svg",
    isAvailable: (window) => {
      return isNotEmptyTab(window);
    },
  },
  {
    label: "Manage Extensions",
    command: "Tools:Addons",
    icon: "chrome://browser/skin/enso-icons/extension.svg",
  },
  {
    label: "Switch to Automatic Appearance",
    command: () => Services.prefs.setIntPref("enso.view.window.scheme", 2),
    icon: "chrome://browser/skin/enso-icons/sparkles.svg",
    isAvailable: () => {
      return lazy.currentTheme !== 2;
    },
  },
  {
    label: "Switch to Light Mode",
    command: () => Services.prefs.setIntPref("enso.view.window.scheme", 1),
    icon: "chrome://browser/skin/enso-icons/face-sun.svg",
    isAvailable: () => {
      return lazy.currentTheme !== 1;
    },
  },
  {
    label: "Switch to Dark Mode",
    command: () => Services.prefs.setIntPref("enso.view.window.scheme", 0),
    icon: "chrome://browser/skin/enso-icons/moon-stars.svg",
    isAvailable: () => {
      return lazy.currentTheme !== 0;
    },
  },
  {
    label: "Print",
    command: "cmd_print",
    icon: "chrome://browser/skin/enso-icons/print.svg",
    isAvailable: (window) => {
      return isNotEmptyTab(window);
    },
  },
];

export const globalActions = globalActionsTemplate.map((action) => ({
  isAvailable: (window) => {
    return window.document.getElementById(action.command)?.getAttribute("disabled") !== "true";
  },
  commandId:
    typeof action.command === "string"
      ? action.command
      : `enso:global-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`,
  extraPayload: {},
  ...action,
}));
