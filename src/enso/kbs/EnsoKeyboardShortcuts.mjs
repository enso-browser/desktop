// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { nsZenMultiWindowFeature } from "chrome://browser/content/enso-components/EnsoCommonUtils.mjs";

const KEYCODE_MAP = {
  F1: "VK_F1",
  F2: "VK_F2",
  F3: "VK_F3",
  F4: "VK_F4",
  F5: "VK_F5",
  F6: "VK_F6",
  F7: "VK_F7",
  F8: "VK_F8",
  F9: "VK_F9",
  F10: "VK_F10",
  F11: "VK_F11",
  F12: "VK_F12",
  F13: "VK_F13",
  F14: "VK_F14",
  F15: "VK_F15",
  F16: "VK_F16",
  F17: "VK_F17",
  F18: "VK_F18",
  F19: "VK_F19",
  F20: "VK_F20",
  F21: "VK_F21",
  F22: "VK_F22",
  F23: "VK_F23",
  F24: "VK_F24",
  TAB: "VK_TAB",
  ENTER: "VK_RETURN",
  ESCAPE: "VK_ESCAPE",
  SPACE: "VK_SPACE",
  ARROWLEFT: "VK_LEFT",
  ARROWRIGHT: "VK_RIGHT",
  ARROWUP: "VK_UP",
  ARROWDOWN: "VK_DOWN",
  DELETE: "VK_DELETE",
  BACKSPACE: "VK_BACK",
  HOME: "VK_HOME",
  NUM_LOCK: "VK_NUMLOCK",
  SCROLL_LOCK: "VK_SCROLL",
};

const defaultKeyboardGroups = {
  windowAndTabManagement: [
    "enso-window-new-shortcut",
    "enso-new-unsynced-window-shortcut",
    "enso-tab-new-shortcut",
    "enso-key-enter-full-screen",
    "enso-key-exit-full-screen",
    "enso-quit-app-shortcut",
    "enso-close-all-unpinned-tabs-shortcut",
    "enso-close-tab-shortcut",
    "enso-close-shortcut",
    "id:key_selectTab1",
    "id:key_selectTab2",
    "id:key_selectTab3",
    "id:key_selectTab4",
    "id:key_selectTab5",
    "id:key_selectTab6",
    "id:key_selectTab7",
    "id:key_selectTab8",
    "id:key_selectLastTab",
  ],
  navigation: [
    "enso-nav-back-shortcut-alt",
    "enso-nav-fwd-shortcut-alt",
    "enso-nav-reload-shortcut-2",
    "enso-nav-reload-shortcut-skip-cache",
    "enso-nav-reload-shortcut",
    "enso-key-stop",
    "enso-private-browsing-shortcut",
    "id:goHome",
    "id:key_gotoHistory",
    "id:goBackKb",
    "id:goForwardKb",
  ],
  searchAndFind: [
    "enso-search-focus-shortcut",
    "enso-search-focus-shortcut-alt",
    "enso-find-shortcut",
    "enso-search-find-again-shortcut-2",
    "enso-search-find-again-shortcut",
    "enso-search-find-again-shortcut-prev",
  ],
  pageOperations: [
    "enso-text-action-copy-url-markdown-shortcut",
    "enso-text-action-copy-url-shortcut",
    "enso-location-open-shortcut",
    "enso-location-open-shortcut-alt",
    "enso-save-page-shortcut",
    "enso-print-shortcut",
    "enso-page-source-shortcut",
    "enso-page-info-shortcut",
    "enso-reader-mode-toggle-shortcut-other",
    "enso-picture-in-picture-toggle-shortcut",
  ],
  historyAndBookmarks: [
    "enso-history-show-all-shortcut",
    "enso-bookmark-this-page-shortcut",
    "enso-bookmark-show-library-shortcut",
  ],
  mediaAndDisplay: [
    "enso-mute-toggle-shortcut",
    "enso-full-zoom-reduce-shortcut",
    "enso-full-zoom-enlarge-shortcut",
    "enso-full-zoom-reset-shortcut",
    "enso-bidi-switch-direction-shortcut",
    "enso-screenshot-shortcut",
  ],
  devTools: [
    /*Filled automatically*/
  ],
};

const fixedL10nIds = {
  cmd_findPrevious: "enso-search-find-again-shortcut-prev",
  "Browser:ReloadSkipCache": "enso-nav-reload-shortcut-skip-cache",
  cmd_close: "enso-close-tab-shortcut",
  "History:RestoreLastClosedTabOrWindowOrSession": "enso-restore-last-closed-tab-shortcut",
};

const ENSO_MAIN_KEYSET_ID = "mainKeyset";
const ENSO_DEVTOOLS_KEYSET_ID = "devtoolsKeyset";
window.ENSO_KEYSET_ID = "ensoKeyset";

const ENSO_COMPACT_MODE_SHORTCUTS_GROUP = "enso-compact-mode";
const ENSO_WORKSPACE_SHORTCUTS_GROUP = "enso-workspace";
const ENSO_OTHER_SHORTCUTS_GROUP = "enso-other";
const ENSO_SPLIT_VIEW_SHORTCUTS_GROUP = "enso-split-view";
const FIREFOX_SHORTCUTS_GROUP = "enso-kbs-invalid";
window.VALID_SHORTCUT_GROUPS = [
  ENSO_COMPACT_MODE_SHORTCUTS_GROUP,
  ENSO_WORKSPACE_SHORTCUTS_GROUP,
  ENSO_SPLIT_VIEW_SHORTCUTS_GROUP,
  ENSO_OTHER_SHORTCUTS_GROUP,
  ...Object.keys(defaultKeyboardGroups),
  "other",
];

export class nsKeyShortcutModifiers {
  #control = false;
  #alt = false;
  #shift = false;
  #meta = false;
  #accel = false;

  constructor(ctrl, alt, shift, meta, accel) {
    this.#control = ctrl;
    this.#alt = alt;
    this.#shift = shift;
    this.#meta = meta;
    this.#accel = accel;

    if (AppConstants.platform != "macosx") {
      // Replace control with accel, to make it more consistent
      this.#accel = ctrl || accel;
      this.#control = false;
    }
  }

  static parseFromJSON(modifiers) {
    if (!modifiers) {
      return new nsKeyShortcutModifiers(false, false, false, false, false);
    }

    return new nsKeyShortcutModifiers(
      modifiers.control,
      modifiers.alt,
      modifiers.shift,
      modifiers.meta,
      modifiers.accel
    );
  }

  static parseFromXHTMLAttribute(modifiers) {
    if (!modifiers) {
      return new nsKeyShortcutModifiers(false, false, false, false, false);
    }

    return new nsKeyShortcutModifiers(
      modifiers.includes("control"),
      modifiers.includes("alt"),
      modifiers.includes("shift"),
      modifiers.includes("meta"),
      modifiers.includes("accel")
    );
  }

  // used to avoid any future changes to the object
  static fromObject({ ctrl = false, alt = false, shift = false, meta = false, accel = false }) {
    return new nsKeyShortcutModifiers(ctrl, alt, shift, meta, accel);
  }

  toDisplayString() {
    let str = "";
    const separation = AppConstants.platform == "macosx" ? " " : "+";
    if (this.#control && !this.#accel) {
      str += AppConstants.platform == "macosx" ? "⌃" : "Ctrl";
      str += separation;
    }
    if (this.#meta) {
      str += AppConstants.platform == "macosx" ? "⌘" : "Win";
      str += separation;
    }
    if (this.#accel) {
      str += AppConstants.platform == "macosx" ? "⌘" : "Ctrl";
      str += separation;
    }
    if (this.#alt) {
      str += AppConstants.platform == "macosx" ? "⌥" : "Alt";
      str += separation;
    }
    if (this.#shift) {
      str += "⇧";
      str += separation;
    }
    return str;
  }

  equals(other) {
    if (!other) {
      return false;
    }
    // If we are on macos, we can have accel and meta at the same time
    return (
      this.#alt == other.#alt &&
      this.#shift == other.#shift &&
      this.#control == other.#control &&
      (AppConstants.platform == "macosx"
        ? (this.#meta || this.#accel) == (other.#meta || other.#accel) &&
          this.#control == other.#control
        : // In other platforms, we can have control and accel counting as the same thing
          this.#meta == other.#meta &&
          (this.#control || this.#accel) == (other.#control || other.#accel))
    );
  }

  toString() {
    let str = "";
    if (this.#control) {
      str += "control,";
    }
    if (this.#accel) {
      str += "accel,";
    }
    if (this.#shift) {
      str += "shift,";
    }
    if (this.#alt) {
      str += "alt,";
    }
    if (this.#meta) {
      str += "meta,";
    }
    return str.slice(0, -1);
  }

  toJSONString() {
    return {
      control: this.#control,
      alt: this.#alt,
      shift: this.#shift,
      meta: this.#meta,
      accel: this.#accel,
    };
  }

  areAnyActive() {
    return this.#control || this.#alt || this.#shift || this.#meta || this.#accel;
  }

  get control() {
    return this.#control;
  }

  get alt() {
    return this.#alt;
  }

  get shift() {
    return this.#shift;
  }

  get meta() {
    return this.#meta;
  }

  get accel() {
    return this.#accel;
  }
}

class KeyShortcut {
  #id = "";
  #key = "";
  #keycode = "";
  #group = FIREFOX_SHORTCUTS_GROUP;
  #modifiers = new nsKeyShortcutModifiers(false, false, false, false, false);
  #action = "";
  #l10nId = "";
  #disabled = false;
  #reserved = false;
  #internal = false;

  constructor(
    id,
    key,
    keycode,
    group,
    modifiers,
    action,
    l10nId,
    disabled = false,
    reserved = false,
    internal = false
  ) {
    this.#id = id;
    this.#key = key?.toLowerCase();
    this.#keycode = keycode;

    if (!window.VALID_SHORTCUT_GROUPS.includes(group)) {
      throw new Error("Illegal group value: " + group);
    }

    this.#group = group;
    this.#modifiers = modifiers;
    this.#action = action;
    this.#l10nId = KeyShortcut.sanitizeL10nId(l10nId, action);
    this.#disabled = disabled;
    this.#reserved = reserved;
    this.#internal = internal;
  }

  isEmpty() {
    return !this.#key && !this.getRealKeycode();
  }

  static parseFromSaved(json) {
    let rv = [];
    for (let key of json) {
      rv.push(this.#parseFromJSON(key));
    }

    return rv;
  }

  static getGroupFromL10nId(l10nId, id) {
    // Find inside defaultKeyboardGroups
    for (let group of Object.keys(defaultKeyboardGroups)) {
      for (let shortcut of defaultKeyboardGroups[group]) {
        if (shortcut == l10nId || shortcut == "id:" + id) {
          return group;
        }
      }
    }
    return "other";
  }

  static #parseFromJSON(json) {
    return new KeyShortcut(
      json.id,
      json.key,
      json.keycode,
      json.group,
      nsKeyShortcutModifiers.parseFromJSON(json.modifiers),
      json.action,
      json.l10nId,
      json.disabled,
      json.reserved,
      json.internal
    );
  }

  static parseFromXHTML(key, { group = undefined } = {}) {
    return new KeyShortcut(
      key.getAttribute("id"),
      key.getAttribute("key"),
      key.getAttribute("keycode"),
      group ??
        KeyShortcut.getGroupFromL10nId(
          KeyShortcut.sanitizeL10nId(key.getAttribute("data-l10n-id")),
          key.getAttribute("id")
        ),
      nsKeyShortcutModifiers.parseFromXHTMLAttribute(key.getAttribute("modifiers")),
      key.getAttribute("command"),
      key.getAttribute("data-l10n-id"),
      key.getAttribute("disabled") == "true",
      key.getAttribute("reserved") == "true",
      key.getAttribute("internal") == "true"
    );
  }

  static sanitizeL10nId(id, action) {
    if (!id || id.startsWith("enso-")) {
      return id;
    }
    // Check if any action is on the list of fixed l10n ids
    if (fixedL10nIds[action]) {
      return fixedL10nIds[action];
    }
    return `enso-${id}`;
  }

  set shouldBeEmpty(value) {
    if (value) {
      this.clearKeybind();
    }
  }

  toXHTMLElement(aWindow) {
    let key = aWindow.document.createXULElement("key");
    return this.replaceWithChild(key);
  }

  replaceWithChild(key) {
    key.id = this.#id;
    if (this.#keycode) {
      key.setAttribute("keycode", this.#keycode);
      key.removeAttribute("key");
    } else {
      // note to "mr. macos": Better use setAttribute, because without it, there's a
      //  risk of malforming the XUL element.
      key.setAttribute("key", this.#key);
      key.removeAttribute("keycode");
    }
    key.setAttribute("group", this.#group);

    // note to "mr. macos": We add the `enso-` prefix because Firefox hasnt been built with the
    // shortcuts in mind, it will simply just override the shortcuts with whatever the default is.
    //  note that this l10n id is not used for actually translating the key's label, but rather to
    //  identify the default keybinds.
    if (this.#l10nId) {
      // key.setAttribute('data-l10n-id', this.#l10nId);
    }
    key.setAttribute("modifiers", this.#modifiers.toString());
    if (this.#action) {
      key.setAttribute("command", this.#action);
    }
    if (this.#disabled) {
      key.setAttribute("disabled", this.#disabled);
    }
    if (this.#reserved) {
      key.setAttribute("reserved", this.#reserved);
    }
    if (this.#internal) {
      key.setAttribute("internal", this.#internal);
    }
    key.setAttribute("enso-keybind", "true");

    return key;
  }

  _modifyInternalAttribute(value) {
    this.#internal = value;
  }

  getRealKeycode() {
    if (this.#keycode === "") {
      return null;
    }
    return this.#keycode;
  }

  getID() {
    return this.#id;
  }

  getAction() {
    return this.#action;
  }

  // Only used for migration!
  _setAction(action) {
    this.#action = action;
  }

  getL10NID() {
    return this.#l10nId;
  }

  getGroup() {
    return this.#group;
  }

  getModifiers() {
    return this.#modifiers;
  }

  getKeyName() {
    return this.#key?.toLowerCase();
  }

  getKeyCode() {
    return this.getRealKeycode();
  }

  getKeyNameOrCode() {
    return this.#key ? this.getKeyName() : this.getKeyCode();
  }

  isDisabled() {
    return this.#disabled;
  }

  setDisabled(value) {
    this.#disabled = value;
  }

  isReserved() {
    return this.#reserved;
  }

  isInternal() {
    return this.#internal;
  }

  isInvalid() {
    return this.#key == "" && this.#keycode == "" && this.#l10nId == null;
  }

  setModifiers(modifiers) {
    if ((!modifiers) instanceof nsKeyShortcutModifiers) {
      throw new Error("Only nsKeyShortcutModifiers allowed");
    }
    this.#modifiers = modifiers;
  }

  toJSONForm() {
    return {
      id: this.#id,
      key: this.#key,
      keycode: this.#keycode,
      group: this.#group,
      l10nId: this.#l10nId,
      modifiers: this.#modifiers.toJSONString(),
      action: this.#action,
      disabled: this.#disabled,
      reserved: this.#reserved,
      internal: this.#internal,
    };
  }

  toDisplayString() {
    let str = this.#modifiers.toDisplayString();

    if (this.#key) {
      str += this.#key.toUpperCase();
    } else if (this.#keycode) {
      // Get the key from the value
      for (let [key, value] of Object.entries(KEYCODE_MAP)) {
        if (value == this.#keycode) {
          const normalizedKey = key.toLowerCase();
          switch (normalizedKey) {
            case "arrowleft":
              str += "←";
              break;
            case "arrowright":
              str += "→";
              break;
            case "arrowup":
              str += "↑";
              break;
            case "arrowdown":
              str += "↓";
              break;
            case "escape":
              str += AppConstants.platform == "macosx" ? "⎋" : "Esc";
              break;
            case "enter":
              str += AppConstants.platform == "macosx" ? "↩" : "Enter";
              break;
            case "space":
              str += AppConstants.platform == "macosx" ? "␣" : "Space";
              break;
            default:
              str += normalizedKey;
          }
          break;
        }
      }
    } else {
      return "";
    }
    return str;
  }

  isUserEditable() {
    if (!this.#id || this.#internal || (this.#group == FIREFOX_SHORTCUTS_GROUP && this.#disabled)) {
      return false;
    }
    return true;
  }

  clearKeybind() {
    this.#key = "";
    this.#keycode = "";
    this.#modifiers = new nsKeyShortcutModifiers(false, false, false, false);
  }

  setNewBinding(shortcut) {
    for (let keycode of Object.keys(KEYCODE_MAP)) {
      if (keycode == shortcut.toUpperCase()) {
        this.#keycode = KEYCODE_MAP[keycode];
        this.#key = "";
        return;
      }
    }

    this.#keycode = ""; // Clear the keycode
    this.#key = shortcut;
  }
}

class nsEnsoKeyboardShortcutsLoader {
  constructor() {}

  get shortcutsFile() {
    return PathUtils.join(PathUtils.profileDir, "enso-keyboard-shortcuts.json");
  }

  async save(data) {
    await IOUtils.writeJSON(this.shortcutsFile, data);
  }

  async loadObject() {
    try {
      return await IOUtils.readJSON(this.shortcutsFile);
    } catch (e) {
      // Recreate shortcuts file
      Services.prefs.clearUserPref("enso.keyboard.shortcuts.version");
      console.warn("Error loading shortcuts file", e);
      return null;
    }
  }

  async load() {
    return (await this.loadObject())?.shortcuts;
  }

  async remove() {
    await IOUtils.remove(this.shortcutsFile);
  }

  static zenGetDefaultShortcuts() {
    // DO NOT CHANGE ANYTHING HERE
    // For adding new default shortcuts, add them to inside the migration function
    //  and increment the version number.

    let keySet = document.getElementById(ENSO_MAIN_KEYSET_ID);
    let newShortcutList = [];

    const correctDefaultShortcut = (shortcut) => {
      if (shortcut.getID() === "key_savePage") {
        shortcut.setModifiers(
          nsKeyShortcutModifiers.fromObject({ accel: true, alt: true, shift: true })
        );
      }
    };

    // Firefox's standard keyset. Reverse order to keep the order of the keys
    for (let i = keySet.children.length - 1; i >= 0; i--) {
      let key = keySet.children[i];
      let parsed = KeyShortcut.parseFromXHTML(key);
      correctDefaultShortcut(parsed);
      newShortcutList.push(parsed);
    }

    // Compact mode's keyset
    newShortcutList.push(
      new KeyShortcut(
        "enso-compact-mode-toggle",
        "S",
        "",
        ENSO_COMPACT_MODE_SHORTCUTS_GROUP,
        nsKeyShortcutModifiers.fromObject({ accel: true }),
        "cmd_ensoCompactModeToggle",
        "enso-compact-mode-shortcut-toggle"
      )
    );
    newShortcutList.push(
      new KeyShortcut(
        "enso-compact-mode-show-sidebar",
        "S",
        "",
        ENSO_COMPACT_MODE_SHORTCUTS_GROUP,
        nsKeyShortcutModifiers.fromObject({ accel: true, alt: true }),
        "cmd_ensoCompactModeShowSidebar",
        "enso-compact-mode-shortcut-show-sidebar"
      )
    );

    // Workspace shortcuts
    for (let i = 10; i > 0; i--) {
      newShortcutList.push(
        new KeyShortcut(
          `enso-workspace-switch-${i}`,
          AppConstants.platform == "macosx" ? `${i === 10 ? 0 : i}` : "",
          "",
          ENSO_WORKSPACE_SHORTCUTS_GROUP,
          nsKeyShortcutModifiers.fromObject(
            AppConstants.platform == "macosx" ? { ctrl: true } : {}
          ),
          `cmd_ensoWorkspaceSwitch${i}`,
          `enso-workspace-shortcut-switch-${i}`
        )
      );
    }
    newShortcutList.push(
      new KeyShortcut(
        "enso-workspace-forward",
        "",
        "VK_RIGHT",
        ENSO_WORKSPACE_SHORTCUTS_GROUP,
        nsKeyShortcutModifiers.fromObject({ alt: true, accel: true }),
        "cmd_ensoWorkspaceForward",
        "enso-workspace-shortcut-forward"
      )
    );
    newShortcutList.push(
      new KeyShortcut(
        "enso-workspace-backward",
        "",
        "VK_LEFT",
        ENSO_WORKSPACE_SHORTCUTS_GROUP,
        nsKeyShortcutModifiers.fromObject({ alt: true, accel: true }),
        "cmd_ensoWorkspaceBackward",
        "enso-workspace-shortcut-backward"
      )
    );

    // Split view
    newShortcutList.push(
      new KeyShortcut(
        "enso-split-view-grid",
        "G",
        "",
        ENSO_SPLIT_VIEW_SHORTCUTS_GROUP,
        nsKeyShortcutModifiers.fromObject({ accel: true, alt: true }),
        "cmd_ensoSplitViewGrid",
        "enso-split-view-shortcut-grid"
      )
    );
    newShortcutList.push(
      new KeyShortcut(
        "enso-split-view-vertical",
        "V",
        "",
        ENSO_SPLIT_VIEW_SHORTCUTS_GROUP,
        nsKeyShortcutModifiers.fromObject({ accel: true, alt: true }),
        "cmd_ensoSplitViewVertical",
        "enso-split-view-shortcut-vertical"
      )
    );
    newShortcutList.push(
      new KeyShortcut(
        "enso-split-view-horizontal",
        "H",
        "",
        ENSO_SPLIT_VIEW_SHORTCUTS_GROUP,
        nsKeyShortcutModifiers.fromObject({ accel: true, alt: true }),
        "cmd_ensoSplitViewHorizontal",
        "enso-split-view-shortcut-horizontal"
      )
    );
    newShortcutList.push(
      new KeyShortcut(
        "enso-split-view-unsplit",
        "U",
        "",
        ENSO_SPLIT_VIEW_SHORTCUTS_GROUP,
        nsKeyShortcutModifiers.fromObject({ accel: true, alt: true }),
        "cmd_ensoSplitViewUnsplit",
        "enso-split-view-shortcut-unsplit"
      )
    );

    return newShortcutList;
  }

  // Make sure to stay in sync with https://searchfox.org/mozilla-central/source/devtools/startup/DevToolsStartup.sys.mjs#879
  static IGNORED_DEVTOOLS_SHORTCUTS = [
    "key_toggleToolboxF12",
    "profilerStartStop",
    "profilerStartStopAlternate",
    "profilerCapture",
    "profilerCaptureAlternate",
    "javascriptTracingToggle",
  ];

  static ensoGetDefaultDevToolsShortcuts() {
    let keySet = document.getElementById(ENSO_DEVTOOLS_KEYSET_ID);
    let newShortcutList = [];
    for (let i = keySet.children.length - 1; i >= 0; i--) {
      let key = keySet.children[i];
      if (this.IGNORED_DEVTOOLS_SHORTCUTS.includes(key.id)) {
        continue;
      }
      let parsed = KeyShortcut.parseFromXHTML(key, { group: "devTools" });
      // Move "inspector" shortcut to use "L" key instead of "I"
      if (parsed.getID() == "key_inspector" || parsed.getID() == "key_inspectorMac") {
        parsed.setNewBinding("L");
      }
      newShortcutList.push(parsed);
    }

    return newShortcutList;
  }
}

class nsEnsoKeyboardShortcutsVersioner {
  static LATEST_KBS_VERSION = 14;

  constructor() {}

  get version() {
    return Services.prefs.getIntPref("enso.keyboard.shortcuts.version", 0);
  }

  set version(version) {
    Services.prefs.setIntPref("enso.keyboard.shortcuts.version", version);
  }

  getVersionedData(data) {
    return {
      shortcuts: data,
    };
  }

  isVersionUpToDate() {
    return this.version == nsEnsoKeyboardShortcutsVersioner.LATEST_KBS_VERSION;
  }

  isVersionOutdated() {
    return this.version < nsEnsoKeyboardShortcutsVersioner.LATEST_KBS_VERSION;
  }

  migrateIfNeeded(data) {
    if (!data) {
      // Rebuid the shortcuts, just in case
      this.version = 0;
    }

    if (this.isVersionUpToDate()) {
      return data;
    }

    if (this.isVersionOutdated()) {
      const version = this.version;
      console.warn(
        "Zen CKS: Migrating shortcuts from version",
        version,
        "to",
        nsEnsoKeyboardShortcutsVersioner.LATEST_KBS_VERSION
      );
      const newData = this.migrate(data, version);
      this.version = nsEnsoKeyboardShortcutsVersioner.LATEST_KBS_VERSION;
      return newData;
    }

    console.error("Unknown keyboard shortcuts version");
    this.version = 0;
    return this.migrateIfNeeded(data);
  }

  fillDefaultIfNotPresent(data) {
    for (let shortcut of nsEnsoKeyboardShortcutsLoader.ensoGetDefaultShortcuts()) {
      // If it has an ID and we dont find it in the data, we add it
      if (shortcut.getID() && !data.find((s) => s.getID() == shortcut.getID())) {
        data.push(shortcut);
      }
    }
    return data;
  }

  fixedKeyboardShortcuts(data) {
    // Apply migrations and ensure defaults exist
    let out = this.fillDefaultIfNotPresent(this.migrateIfNeeded(data));

    return out;
  }

  // eslint-disable-next-line complexity
  migrate(data, version) {
    if (version < 1) {
      // Migrate from 0 to 1
      // Here, we do a complet reset of the shortcuts,
      // since nothing seems to work properly.
      data = nsEnsoKeyboardShortcutsLoader.ensoGetDefaultShortcuts();
    }
    if (version < 2) {
      // Migrate from 1 to 2
      // In this new version, we are resolving the conflicts between
      //  shortcuts having keycode and key at the same time.
      // If there's both, we remove the keycodes.
      for (let shortcut of data) {
        if (shortcut.getKeyCode() && shortcut.getKeyName()) {
          shortcut.setNewBinding(shortcut.getKeyName());
        }
      }
      data.push(
        new KeyShortcut(
          "enso-pinned-tab-reset-shortcut",
          "",
          "",
          ENSO_OTHER_SHORTCUTS_GROUP,
          nsKeyShortcutModifiers.fromObject({}),
          "cmd_ensoPinnedTabReset",
          "enso-pinned-tab-shortcut-reset"
        )
      );
    }
    if (version < 3) {
      // Migrate from 2 to 3
      // In this new version, there was this *really* annoying bug. Shortcuts
      //  detection for internal keys was not working properly, so every internal
      //  shortcut was being saved as a user-editable shortcut.
      // This migration will fix this issue.
      const defaultShortcuts = nsEnsoKeyboardShortcutsLoader.ensoGetDefaultShortcuts();
      // Get the default shortcut, compare the id and set the internal flag if needed
      for (let shortcut of data) {
        for (let defaultShortcut of defaultShortcuts) {
          if (shortcut.getID() == defaultShortcut.getID()) {
            shortcut._modifyInternalAttribute(defaultShortcut.isInternal());
          }
        }
      }
    }
    if (version < 4) {
      // Migrate from 3 to 4
      // In this new version, we are just removing the 'enso-toggle-sidebar' shortcut
      //  since it's not used anymore.
      data = data.filter((shortcut) => shortcut.getID() != "enso-toggle-sidebar");
    }
    if (version < 5) {
      // Migrate from 4 to 5
      // Here, we are adding the 'enso-toggle-sidebar' shortcut back, but with a new action
      data.push(
        new KeyShortcut(
          "enso-toggle-sidebar",
          "",
          "",
          ENSO_OTHER_SHORTCUTS_GROUP,
          nsKeyShortcutModifiers.fromObject({}),
          "cmd_ensoToggleSidebar",
          "enso-sidebar-shortcut-toggle"
        )
      );
    }
    if (version < 6) {
      // Migrate from 5 to 6
      // In this new version, we add the "Copy URL" shortcut to the default shortcuts
      data.push(
        new KeyShortcut(
          "enso-copy-url",
          "C",
          "",
          ENSO_OTHER_SHORTCUTS_GROUP,
          nsKeyShortcutModifiers.fromObject({ accel: true, shift: true }),
          "cmd_ensoCopyCurrentURL",
          "enso-text-action-copy-url-shortcut"
        )
      );
    }
    if (version < 7) {
      // Migrate from 6 to 7
      // In this new version, we add the devtools shortcuts
      const listener = (event) => {
        event.stopPropagation();

        const devToolsShortcuts = nsEnsoKeyboardShortcutsLoader.ensoGetDefaultDevToolsShortcuts();
        gEnsoKeyboardShortcutsManager.updatedDefaultDevtoolsShortcuts(devToolsShortcuts);

        window.removeEventListener("enso-devtools-keyset-added", listener);
      };

      // We need to load after an event because the devtools keyset is not in the DOM yet
      // and we need to wait for it to be added.
      gEnsoKeyboardShortcutsManager._hasToLoadDefaultDevtools = true;
      window.addEventListener("enso-devtools-keyset-added", listener);
    }
    if (version < 8) {
      // Migrate from 7 to 8
      // In this new version, we add the "Copy URL as Markdown" shortcut to the default shortcuts
      data.push(
        new KeyShortcut(
          "enso-copy-url-markdown",
          "C",
          "",
          ENSO_OTHER_SHORTCUTS_GROUP,
          nsKeyShortcutModifiers.fromObject({ accel: true, shift: true, alt: true }),
          "cmd_ensoCopyCurrentURLMarkdown",
          "enso-text-action-copy-url-markdown-shortcut"
        )
      );
    }
    if (version < 9) {
      // Migrate from version 8 to 9
      // Due to security concerns, replace "code:" actions with corresponding <command> IDs
      // we also remove 'enso-toggle-web-panel' since it's not used anymore
      data = data.filter((shortcut) => shortcut.getID() != "enso-toggle-web-panel");
      for (let shortcut of data) {
        if (shortcut.getAction()?.startsWith("code:")) {
          const id = shortcut.getID();

          // Map old shortcut IDs to new <command> IDs
          const commandMap = {
            "enso-compact-mode-toggle": "cmd_ensoCompactModeToggle",
            "enso-compact-mode-show-sidebar": "cmd_ensoCompactModeShowSidebar",
            "enso-workspace-forward": "cmd_ensoWorkspaceForward",
            "enso-workspace-backward": "cmd_ensoWorkspaceBackward",
            "enso-split-view-grid": "cmd_ensoSplitViewGrid",
            "enso-split-view-vertical": "cmd_ensoSplitViewVertical",
            "enso-split-view-horizontal": "cmd_ensoSplitViewHorizontal",
            "enso-split-view-unsplit": "cmd_ensoSplitViewUnsplit",
            "enso-copy-url": "cmd_ensoCopyCurrentURL",
            "enso-copy-url-markdown": "cmd_ensoCopyCurrentURLMarkdown",
            "enso-pinned-tab-reset-shortcut": "cmd_ensoPinnedTabReset",
            "enso-toggle-sidebar": "cmd_ensoToggleSidebar",
          };

          // Dynamically handle workspace switch shortcuts (enso-workspace-switch-1 to 10)
          if (id?.startsWith("enso-workspace-switch-")) {
            const num = id.replace("enso-workspace-switch-", "");
            commandMap[id] = `cmd_ensoWorkspaceSwitch${num}`;
          }

          // Replace action if a corresponding command exists
          if (commandMap[id]) {
            shortcut._setAction(commandMap[id]);
          }
        }
      }
    }
    if (version < 10) {
      // Migrate from version 9 to 10
      // 1) Add the new pin/unpin tab toggle shortcut with Ctrl+Shift+D
      data.push(
        new KeyShortcut(
          "enso-toggle-pin-tab",
          "D",
          "",
          ENSO_OTHER_SHORTCUTS_GROUP,
          nsKeyShortcutModifiers.fromObject({ accel: true, shift: true }),
          "cmd_ensoTogglePinTab",
          "enso-toggle-pin-tab-shortcut"
        )
      );

      // 2) Add shortcut to expand Glance into a full tab: Default Accel+O
      data.push(
        new KeyShortcut(
          "enso-glance-expand",
          "O",
          "",
          ENSO_OTHER_SHORTCUTS_GROUP,
          nsKeyShortcutModifiers.fromObject({ accel: true }),
          "cmd_ensoGlanceExpand",
          ""
        )
      );
    }

    if (version < 11) {
      // Migrate from version 10 to 11
      data.push(
        new KeyShortcut(
          "enso-new-empty-split-view",
          "*",
          "",
          ENSO_SPLIT_VIEW_SHORTCUTS_GROUP,
          nsKeyShortcutModifiers.fromObject({ accel: true, shift: true }),
          "cmd_ensoNewEmptySplit",
          "enso-new-empty-split-view-shortcut"
        )
      );
    }

    if (version < 12) {
      // Hard-remove deprecated or conflicting defaults regardless of version
      // - Remove the built-in "Open File" keybinding; menu item remains available
      // - Remove default "Bookmark All Tabs" keybinding (Ctrl+Shift+D) to avoid conflict
      // - Remove "Stop" keybinding to avoid conflict with Firefox's built-in binding
      const shouldBeEmptyShortcuts = ["openFileKb", "bookmarkAllTabsKb", "key_stop"];
      for (let shortcut of data) {
        if (shouldBeEmptyShortcuts.includes(shortcut.getID?.())) {
          shortcut.shouldBeEmpty = true;
        }
      }

      // Also remove enso-compact-mode-show-toolbar
      data = data.filter((shortcut) => shortcut.getID() != "enso-compact-mode-show-toolbar");
    }

    if (version < 13) {
      // Migrate from version 12 to 13
      // Add shortcut to close all unpinned tabs: Default Accel+Shift+K
      data.push(
        new KeyShortcut(
          "enso-close-all-unpinned-tabs",
          "K",
          "",
          ENSO_WORKSPACE_SHORTCUTS_GROUP,
          nsKeyShortcutModifiers.fromObject({ accel: true, shift: true }),
          "cmd_ensoCloseUnpinnedTabs",
          "enso-close-all-unpinned-tabs-shortcut"
        )
      );
    }

    if (version < 15) {
      // Migrate from version 13 to 14
      // Add shortcut to open a new unsynced window: Default accelt+shift+N
      data.push(
        new KeyShortcut(
          "enso-new-unsynced-window",
          "N",
          "",
          ENSO_OTHER_SHORTCUTS_GROUP,
          nsKeyShortcutModifiers.fromObject({ accel: true, shift: true }),
          "cmd_ensoNewNavigatorUnsynced",
          "enso-new-unsynced-window-shortcut"
        )
      );
      // Also, change the default for new empty split from + to * on mac
      // and disable the "Restore closed window" shortcut by default due to conflicts
      let emptySplitFound = false,
        undoCloseWindowFound = false;
      for (let shortcut of data) {
        if (shortcut.getID() == "enso-new-empty-split-view" && AppConstants.platform == "macosx") {
          if (shortcut.getKeyName() == "+") {
            shortcut.setNewBinding("*");
          }
          emptySplitFound = true;
        } else if (shortcut.getID() == "key_undoCloseWindow") {
          shortcut.shouldBeEmpty = true;
          shortcut.setDisabled(true);
          undoCloseWindowFound = true;
        }
        if (emptySplitFound && undoCloseWindowFound) {
          break;
        }
      }
    }

    return data;
  }
}

window.gEnsoKeyboardShortcutsManager = {
  loader: new nsEnsoKeyboardShortcutsLoader(),
  _hasToLoadDevtools: false,
  _inlineCommands: [],

  beforeInit() {
    if (!this.inBrowserView) {
      return;
    }
    // Create the main keyset before calling the async init function,
    // This is because other browser-sets needs this element and the JS event
    //  handled wont wait for the async function to finish.
    void this.getZenKeyset();

    this._hasCleared = Services.prefs.getBoolPref(
      "enso.keyboard.shortcuts.disable-mainkeyset-clear",
      false
    );
    window.addEventListener("enso-devtools-keyset-added", this._hasAddedDevtoolShortcuts.bind(this));

    this.init();
  },

  async init() {
    if (this.inBrowserView) {
      const loadedShortcuts = await this._loadSaved();

      this._currentShortcutList = this.versioner.fixedKeyboardShortcuts(loadedShortcuts);
      this._applyShortcuts();

      await this._saveShortcuts();
      window.dispatchEvent(new Event("EnsoKeyboardShortcutsReady", { bubbles: true }));
    }
  },

  get inBrowserView() {
    return window.location.href == "chrome://browser/content/browser.xhtml";
  },

  async _loadSaved() {
    var innerLoad = async () => {
      let data = await this.loader.load();
      if (!data || !data.length) {
        return null;
      }

      try {
        return KeyShortcut.parseFromSaved(data);
      } catch (e) {
        console.error("Zen CKS: Error parsing saved shortcuts. Resetting to defaults...", e);
        gNotificationBox.appendNotification(
          "enso-shortcuts-corrupted",
          {
            label: { "l10n-id": "enso-shortcuts-corrupted" },
            image: "chrome://browser/skin/notification-icons/persistent-storage-blocked.svg",
            priority: gNotificationBox.PRIORITY_WARNING_HIGH,
          },
          []
        );
        return null;
      }
    };

    const loadedShortcuts = await innerLoad();
    this.versioner = new nsEnsoKeyboardShortcutsVersioner(loadedShortcuts);
    return loadedShortcuts;
  },

  getZenKeyset(browser = window) {
    if (!browser.gEnsoKeyboardShortcutsManager._ensoKeyset) {
      const existingKeyset = browser.document.getElementById(ENSO_KEYSET_ID);
      if (existingKeyset) {
        browser.gEnsoKeyboardShortcutsManager._ensoKeyset = existingKeyset;
        return browser.gEnsoKeyboardShortcutsManager._ensoKeyset;
      }

      throw new Error("Zen keyset not found");
    }
    return browser.gEnsoKeyboardShortcutsManager._ensoKeyset;
  },

  getZenDevtoolsKeyset() {
    // note: we use `this` here because we are in the context of the browser
    if (!this._ensoDevtoolsKeyset) {
      const id = `enso-${ENSO_DEVTOOLS_KEYSET_ID}`;
      const existingKeyset = document.getElementById(id);
      if (existingKeyset) {
        this._ensoDevtoolsKeyset = existingKeyset;
        return existingKeyset;
      }

      this._ensoDevtoolsKeyset = document.createXULElement("keyset");
      this._ensoDevtoolsKeyset.id = id;

      const mainKeyset = document.getElementById(ENSO_DEVTOOLS_KEYSET_ID);
      mainKeyset.before(this._ensoDevtoolsKeyset);
    }
    return this._ensoDevtoolsKeyset;
  },

  clearMainKeyset(element) {
    if (this._hasCleared) {
      return;
    }
    this._hasCleared = true;
    const children = element.children;
    for (let i = children.length - 1; i >= 0; i--) {
      const key = children[i];
      if (key.getAttribute("internal") == "true") {
        continue;
      }
      key.remove();
    }

    // Restore the keyset, https://searchfox.org/mozilla-central/rev/a59018f9ff34170810b43e12bf6f09a1512de7ab/dom/events/GlobalKeyListener.cpp#478
    // eslint-disable-next-line no-shadow
    const parent = element.parentElement;
    element.remove();
    parent.prepend(element);
  },

  async updatedDefaultDevtoolsShortcuts(shortcuts) {
    this._hasToLoadDefaultDevtools = false;
    this._currentShortcutList = this._currentShortcutList.concat(shortcuts);
    await this._saveShortcuts();
    this._hasAddedDevtoolShortcuts();
  },

  _hasAddedDevtoolShortcuts() {
    if (this._hasToLoadDevtools || this._hasToLoadDefaultDevtools) {
      return;
    }
    this._hasToLoadDevtools = true;
    this.triggerShortcutRebuild();
  },

  _applyShortcuts() {
    for (const browser of nsZenMultiWindowFeature.browsers) {
      let mainKeyset = browser.document.getElementById(ENSO_MAIN_KEYSET_ID);
      if (!mainKeyset) {
        throw new Error("Main keyset not found");
      }
      browser.gEnsoKeyboardShortcutsManager.clearMainKeyset(mainKeyset);

      const keyset = this.getZenKeyset(browser);
      keyset.innerHTML = "";

      // We dont check this anymore since we are skiping internal keys
      //if (mainKeyset.children.length > 0) {
      //  throw new Error('Child list not empty');
      //}

      for (let key of this._currentShortcutList) {
        if (key.isInternal()) {
          continue;
        }
        let child = key.toXHTMLElement(browser);
        keyset.appendChild(child);
      }

      this._applyDevtoolsShortcuts(browser);
      mainKeyset.after(keyset);
    }
  },

  _applyDevtoolsShortcuts(browser) {
    if (!browser.gEnsoKeyboardShortcutsManager?._hasToLoadDevtools) {
      return;
    }
    let devtoolsKeyset = browser.gEnsoKeyboardShortcutsManager.getZenDevtoolsKeyset(browser);
    for (let key of this._currentShortcutList) {
      if (key.getGroup() != "devTools") {
        continue;
      }
      if (nsEnsoKeyboardShortcutsLoader.IGNORED_DEVTOOLS_SHORTCUTS.includes(key.getID())) {
        continue;
      }
      const originalKey = browser.document.getElementById(key.getID());
      // We do not want to remove and create a new key in these cases,
      // because it will lose the event listeners.
      key.replaceWithChild(originalKey);
      // Move the key to the main keyset if it's not there, this is because
      //  changing modifiers will not work if they are under the devtools keyset
      //  for some really weird reason.
      if (originalKey.parentElement.id === ENSO_DEVTOOLS_KEYSET_ID) {
        devtoolsKeyset.prepend(originalKey);
      }
    }

    const originalDevKeyset = browser.document.getElementById(ENSO_DEVTOOLS_KEYSET_ID);
    originalDevKeyset.after(devtoolsKeyset);
  },

  async resetAllShortcuts() {
    await this.loader.remove();
    Services.prefs.clearUserPref("enso.keyboard.shortcuts.version");
  },

  async _saveShortcuts() {
    let json = [];
    for (const shortcut of this._currentShortcutList) {
      json.push(shortcut.toJSONForm());
    }

    await this.loader.save(this.versioner.getVersionedData(json));
  },

  triggerShortcutRebuild() {
    this._applyShortcuts();
  },

  async setShortcut(action, shortcut, modifiers) {
    if (!action) {
      throw new Error("Action cannot be null");
    }

    // Unsetting shortcut
    for (let targetShortcut of this._currentShortcutList) {
      if (targetShortcut.getID() != action) {
        continue;
      }
      if (!shortcut && !modifiers) {
        targetShortcut.clearKeybind();
      } else {
        targetShortcut.setNewBinding(shortcut);
        targetShortcut.setModifiers(modifiers);
      }
    }

    await this._saveShortcuts();
    this.triggerShortcutRebuild();
  },

  async getModifiableShortcuts() {
    let rv = [];

    if (!this._currentShortcutList) {
      this._currentShortcutList = await this._loadSaved();
    }

    for (let shortcut of this._currentShortcutList) {
      if (shortcut.isUserEditable()) {
        rv.push(shortcut);
      }
    }

    return rv;
  },

  checkForConflicts(shortcut, modifiers, id) {
    const realShortcut = shortcut.toLowerCase();
    for (let targetShortcut of this._currentShortcutList) {
      if (targetShortcut.getID() == id) {
        continue;
      }

      if (
        targetShortcut.getModifiers().equals(modifiers) &&
        targetShortcut.getKeyNameOrCode()?.toLowerCase() == realShortcut
      ) {
        return {
          hasConflicts: true,
          conflictShortcut: targetShortcut,
        };
      }
    }

    return {
      hasConflicts: false,
    };
  },

  getShortcutFromCommand(command) {
    for (let targetShortcut of this._currentShortcutList) {
      if (targetShortcut.getAction() == command) {
        return targetShortcut;
      }
    }
    return null;
  },

  /**
   * Get the shortcut as a display format for a given action/command.
   *
   * @param {string} command The action/command to search for
   * @returns {string|null} The shortcut as a string or null if not found
   */
  getShortcutDisplayFromCommand(command) {
    if (!command) {
      return null;
    }
    const shortcut = this.getShortcutFromCommand(command);
    if (shortcut) {
      return shortcut.toDisplayString();
    }
    return null;
  },
};
