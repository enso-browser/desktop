// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const WINDOW_SCHEME_PREF = "enso.view.window.scheme";
const WINDOW_SCHEME_MAPPING = {
  dark: 0,
  light: 1,
  auto: 2,
};

export class nsZenMenuBar {
  constructor() {
    window.addEventListener(
      "EnsoKeyboardShortcutsReady",
      () => {
        this.#init();
      },
      { once: true }
    );
  }

  #init() {
    this.#initViewMenu();
    this.#initSpacesMenu();
    this.#initAppMenu();
    this.#hideWindowRestoreMenus();
  }

  #initViewMenu() {
    let appearanceMenu = window.MozXULElement.parseXULToFragment(`
      <menu data-l10n-id="enso-menubar-appearance">
        <menupopup>
          <menuitem data-l10n-id="enso-menubar-appearance-description" disabled="true" />
          <menuitem data-l10n-id="enso-menubar-appearance-auto" data-type="auto" type="radio" checked="true" />
          <menuitem data-l10n-id="enso-menubar-appearance-light" data-type="light" type="radio" />
          <menuitem data-l10n-id="enso-menubar-appearance-dark" data-type="dark" type="radio" />
        </menupopup>
      </menu>`);
    const menu = appearanceMenu.querySelector("menu");
    menu.addEventListener("command", (event) => {
      const type = event.target.getAttribute("data-type");
      const schemeValue = WINDOW_SCHEME_MAPPING[type];
      Services.prefs.setIntPref(WINDOW_SCHEME_PREF, schemeValue);
    });
    const viewMenu = document.getElementById("view-menu");
    const parentPopup = viewMenu.querySelector("menupopup");
    parentPopup.prepend(document.createXULElement("menuseparator"));
    parentPopup.prepend(menu);

    const sibling = document.getElementById("viewSidebarMenuMenu");
    const togglePinnedItem = window.MozXULElement.parseXULToFragment(
      '<menuitem data-l10n-id="enso-menubar-toggle-pinned-tabs" />'
    ).querySelector("menuitem");
    if (!gEnsoWorkspaces.privateWindowOrDisabled) {
      sibling.after(togglePinnedItem);
    }

    parentPopup.addEventListener("popupshowing", () => {
      const currentScheme = Services.prefs.getIntPref(WINDOW_SCHEME_PREF);
      for (const [type, value] of Object.entries(WINDOW_SCHEME_MAPPING)) {
        let menuItem = menu.querySelector(`menuitem[data-type="${type}"]`);
        if (value === currentScheme) {
          menuItem.setAttribute("checked", "true");
        } else {
          menuItem.removeAttribute("checked");
        }
      }
      const pinnedAreCollapsed =
        gEnsoWorkspaces.activeWorkspaceElement?.hasCollapsedPinnedTabs ?? false;
      const args = { pinnedAreCollapsed };
      document.l10n.setArgs(togglePinnedItem, args);
    });

    togglePinnedItem.addEventListener("command", () => {
      gEnsoWorkspaces.activeWorkspaceElement?.collapsiblePins.toggle();
    });
  }

  #initSpacesMenu() {
    let spacesMenubar = window.MozXULElement.parseXULToFragment(`
      <menu id="enso-spaces-menubar" data-l10n-id="enso-panel-ui-spaces-label">
        <menupopup>
          <menuitem data-l10n-id="enso-panel-ui-workspaces-create" command="cmd_ensoOpenWorkspaceCreation"/>
          <menuitem data-l10n-id="enso-workspaces-change-theme" command="cmd_ensoOpenZenThemePicker"/>
          <menuitem data-l10n-id="enso-workspaces-panel-change-name" command="cmd_ensoChangeWorkspaceName"/>
          <menuitem data-l10n-id="enso-workspaces-panel-change-icon" command="cmd_ensoChangeWorkspaceIcon"/>
          <menuseparator/>
          <menuitem 
            data-l10n-id="enso-panel-ui-workspaces-change-forward"
            command="cmd_ensoWorkspaceForward"
            key="enso-workspace-forward"/>
          <menuitem
            data-l10n-id="enso-panel-ui-workspaces-change-back"
            command="cmd_ensoWorkspaceBack"
            key="enso-workspace-backward"/>
        </menupopup>
      </menu>`);
    document.getElementById("view-menu").after(spacesMenubar);
    document.getElementById("enso-spaces-menubar").addEventListener("popupshowing", () => {
      if (AppConstants.platform === "linux") {
        // On linux, there seems to be a bug where the menu freezes up and makes the browser
        // suppiciously unresponsive if we try to update the menu while it's opening.
        // See https://github.com/enso-browser/desktop/issues/12024
        return;
      }
      gEnsoWorkspaces.updateWorkspacesChangeContextMenu();
    });
  }

  #initAppMenu() {
    const openUnsyncedWindowItem = window.MozXULElement.parseXULToFragment(
      `<toolbarbutton id="appMenu-new-enso-unsynced-window-button"
                class="subviewbutton"
                data-l10n-id="enso-appmenu-new-blank-window"
                key="enso-new-unsynced-window"
                command="cmd_ensoNewNavigatorUnsynced"/>`
    ).querySelector("toolbarbutton");
    PanelMultiView.getViewNode(document, "appMenu-new-window-button2").after(
      openUnsyncedWindowItem
    );
    document.getElementById("menu_newNavigator").after(
      window.MozXULElement.parseXULToFragment(`
        <menuitem id="menu_new_enso_unsynced_window"
                class="subviewbutton"
                data-l10n-id="enso-menubar-new-blank-window"
                key="enso-new-unsynced-window"
                command="cmd_ensoNewNavigatorUnsynced"/>`)
    );
  }

  #hideWindowRestoreMenus() {
    if (!Services.prefs.getBoolPref("enso.window-sync.enabled", true)) {
      return;
    }
    const itemsToHide = ["appMenuRecentlyClosedWindows", "historyUndoWindowMenu"];
    for (const id of itemsToHide) {
      const element = PanelMultiView.getViewNode(document, id);
      element.setAttribute("hidden", "true");
    }
  }
}
