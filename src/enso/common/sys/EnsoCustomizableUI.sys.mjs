// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { AppConstants } from "resource://gre/modules/AppConstants.sys.mjs";

export const EnsoCustomizableUI = new (class {
  constructor() {}

  TYPE_TOOLBAR = "toolbar";
  defaultSidebarIcons = ["downloads-button", "enso-workspaces-button", "enso-create-new-button"];

  startup(CustomizableUIInternal) {
    CustomizableUIInternal.registerArea(
      "enso-sidebar-top-buttons",
      {
        type: this.TYPE_TOOLBAR,
        defaultPlacements: ["enso-toggle-compact-mode"],
        defaultCollapsed: null,
        overflowable: true,
      },
      true
    );
    CustomizableUIInternal.registerArea(
      "enso-sidebar-foot-buttons",
      {
        type: this.TYPE_TOOLBAR,
        defaultPlacements: this.defaultSidebarIcons,
        defaultCollapsed: null,
      },
      true
    );
  }

  // We do not have access to the window object here
  init(window) {
    this.#addSidebarButtons(window);
    this.#modifyToolbarButtons(window);
  }

  #addSidebarButtons(window) {
    const kDefaultSidebarWidth = AppConstants.platform === "macosx" ? "230px" : "186px";
    const toolbox = window.gNavToolbox;

    // Set a splitter to navigator-toolbox
    const splitter = window.document.createXULElement("splitter");
    splitter.setAttribute("id", "enso-sidebar-splitter");
    splitter.setAttribute("orient", "horizontal");
    splitter.setAttribute("resizebefore", "sibling");
    splitter.setAttribute("resizeafter", "none");
    toolbox.insertAdjacentElement("afterend", splitter);

    const sidebarBox = window.MozXULElement.parseXULToFragment(`
      <toolbar id="enso-sidebar-top-buttons"
        fullscreentoolbar="true"
        class="browser-toolbar customization-target"
        brighttext="true"
        data-l10n-id="tabs-toolbar"
        customizable="true"
        context="toolbar-context-menu"
        flex="1"
        skipintoolbarset="true"
        customizationtarget="enso-sidebar-top-buttons-customization-target"
        overflowable="true"
        default-overflowbutton="nav-bar-overflow-button"
        default-overflowtarget="widget-overflow-list"
        default-overflowpanel="widget-overflow"
        addon-webext-overflowbutton="enso-site-data-icon-button"
        addon-webext-overflowtarget="overflowed-extensions-list"
        mode="icons">
        <hbox id="enso-sidebar-top-buttons-customization-target" class="customization-target" flex="1">
          <toolbaritem id="enso-toggle-compact-mode" removable="true" data-l10n-id="enso-toggle-compact-mode-button">
            <toolbarbutton
              class="toolbarbutton-1"
              command="cmd_toggleCompactModeIgnoreHover"
              data-l10n-id="enso-toggle-compact-mode-button"
              flex="1" />
          </toolbaritem>
          <html:div id="enso-sidebar-top-buttons-separator" skipintoolbarset="true" overflows="false"></html:div>
        </hbox>
      </toolbar>
    `);
    toolbox.prepend(sidebarBox);
    new window.MutationObserver((e) => {
      if (e[0].type !== "attributes" || e[0].attributeName !== "width") {
        return;
      }
      this._dispatchResizeEvent(window);
    }).observe(toolbox, {
      attributes: true, //configure it to listen to attribute changes
    });

    // remove all styles except for the width, since we are xulstoring the complet style list
    const width = toolbox.style.width || kDefaultSidebarWidth;
    toolbox.removeAttribute("style");
    toolbox.style.width = width;
    toolbox.setAttribute("width", width);

    splitter.addEventListener("dblclick", (e) => {
      if (e.button !== 0) {
        return;
      }
      toolbox.style.width = kDefaultSidebarWidth;
      toolbox.setAttribute("width", kDefaultSidebarWidth);
    });

    const newTab = window.document.getElementById("vertical-tabs-newtab-button");
    newTab.classList.add("enso-sidebar-action-button");

    for (let id of this.defaultSidebarIcons) {
      const elem = window.document.getElementById(id);
      if (!elem || elem.id === "enso-workspaces-button") {
        continue;
      }
      elem.setAttribute("removable", "true");
    }

    this.#initCreateNewButton(window);
    this.#moveWindowButtons(window);
  }

  #initCreateNewButton(window) {
    const button = window.document.getElementById("enso-create-new-button");
    // If we use "mousedown" event for private windows (which open a new tab on "click"), we might end up with
    // the urlbar flicking and therefore we use "command" event to avoid that.
    let isPrivateMode = window.gEnsoWorkspaces.privateWindowOrDisabled;
    button.addEventListener(isPrivateMode ? "command" : "mousedown", (event) => {
      if (isPrivateMode) {
        window.document.getElementById("cmd_newNavigatorTab").doCommand();
        return;
      }
      if (button.hasAttribute("open")) {
        return;
      }
      const popup = window.document.getElementById("ensoCreateNewPopup");
      popup.openPopup(
        button,
        "before_start",
        0,
        0,
        true /* isContextMenu */,
        false /* attributesOverride */,
        event
      );
    });
  }

  #moveWindowButtons(window) {
    const windowControls = window.document.getElementsByClassName("titlebar-buttonbox-container");
    const toolboxIcons = window.document.getElementById(
      "enso-sidebar-top-buttons-customization-target"
    );
    if (
      window.AppConstants.platform === "macosx" ||
      window.matchMedia("(-moz-gtk-csd-reversed-placement)").matches
    ) {
      for (let i = 0; i < windowControls.length; i++) {
        if (i === 0) {
          toolboxIcons.prepend(windowControls[i]);
          continue;
        }
        windowControls[i].remove();
      }
    }
  }

  #modifyToolbarButtons(window) {
    const wrapper = window.document.getElementById("enso-sidebar-foot-buttons");
    const elementsToHide = ["new-tab-button"];
    for (let id of elementsToHide) {
      const elem = window.document.getElementById(id);
      if (elem) {
        wrapper.prepend(elem);
      }
    }
    window.document.getElementById("stop-reload-button").removeAttribute("overflows");
  }

  _dispatchResizeEvent(window) {
    window.dispatchEvent(new window.Event("resize"));
  }

  registerToolbarNodes(window) {
    window.CustomizableUI.registerToolbarNode(
      window.document.getElementById("enso-sidebar-top-buttons")
    );
    window.CustomizableUI.registerToolbarNode(
      window.document.getElementById("enso-sidebar-foot-buttons")
    );
  }
})();
