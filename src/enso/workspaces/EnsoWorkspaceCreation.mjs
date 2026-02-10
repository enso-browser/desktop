/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class nsEnsoWorkspaceCreation extends MozXULElement {
  #wasInCollapsedMode = false;

  promiseInitialized = new Promise((resolve) => {
    this.resolveInitialized = resolve;
  });

  #hiddenElements = [];

  static get elementsToDisable() {
    return [
      "cmd_ensoOpenWorkspacePanel",
      "cmd_ensoOpenWorkspaceCreation",
      "cmd_ensoOpenFolderCreation",
      "cmd_ensoToggleSidebar",
      "cmd_newNavigatorTab",
      "cmd_newNavigatorTabNoEvent",
    ];
  }

  static get markup() {
    return `
        <vbox class="enso-workspace-creation" flex="1">
          <form>
            <vbox>
              <html:h1 data-l10n-id="enso-workspace-creation-header" class="enso-workspace-creation-title" />
              <html:div>
                <label data-l10n-id="enso-workspace-creation-label" class="enso-workspace-creation-label" />
              </html:div>
            </vbox>
            <vbox class="enso-workspace-creation-form">
              <hbox class="enso-workspace-creation-name-wrapper">
                <toolbarbutton class="enso-workspace-creation-icon-label" />
                <html:input
                  class="enso-workspace-creation-name"
                  type="text"
                  data-l10n-id="enso-workspace-creation-name" />
              </hbox>
              <hbox class="enso-workspace-creation-profile-wrapper">
                <label class="enso-workspace-creation-profile-label" data-l10n-id="enso-workspace-creation-profile" />
                <button class="enso-workspace-creation-profile" />
              </hbox>
              <button
                class="enso-workspace-creation-edit-theme-button"
                data-l10n-id="enso-workspaces-change-theme"
                command="cmd_ensoOpenZenThemePicker" />
              <menupopup class="enso-workspace-creation-profiles-popup" />
            </vbox>
            <vbox class="enso-workspace-creation-buttons">
              <html:div>
                <button class="enso-workspace-creation-create-button footer-button primary"
                  data-l10n-id="enso-panel-ui-workspaces-create" disabled="true" />
              </html:div>
              <button class="enso-workspace-creation-cancel-button footer-button"
                data-l10n-id="enso-general-cancel-label" />
            </vbox>
          </form>
        </vbox>
      `;
  }

  get workspaceId() {
    return this.getAttribute("workspace-id");
  }

  get previousWorkspaceId() {
    return this.getAttribute("previous-workspace-id");
  }

  get elementsToAnimate() {
    return [
      this.querySelector(".enso-workspace-creation-title"),
      this.querySelector(".enso-workspace-creation-label").parentElement,
      this.querySelector(".enso-workspace-creation-name-wrapper"),
      this.querySelector(".enso-workspace-creation-profile-wrapper"),
      this.querySelector(".enso-workspace-creation-edit-theme-button"),
      this.createButton.parentNode,
      this.cancelButton,
    ];
  }

  connectedCallback() {
    if (this.delayConnectedCallback()) {
      // If we are not ready yet, or if we have already connected, we
      // don't need to do anything.
      return;
    }

    this.appendChild(this.constructor.fragment);
    this.initializeAttributeInheritance();

    this.inputName = this.querySelector(".enso-workspace-creation-name");
    this.inputIcon = this.querySelector(".enso-workspace-creation-icon-label");
    this.inputProfile = this.querySelector(".enso-workspace-creation-profile");
    this.createButton = this.querySelector(".enso-workspace-creation-create-button");
    this.cancelButton = this.querySelector(".enso-workspace-creation-cancel-button");

    for (const element of this.elementsToAnimate) {
      element.style.opacity = 0;
    }

    this.#wasInCollapsedMode =
      document.documentElement.getAttribute("enso-sidebar-expanded") !== "true";

    gNavToolbox.setAttribute("enso-sidebar-expanded", "true");
    document.documentElement.setAttribute("enso-sidebar-expanded", "true");

    window.docShell.treeOwner
      .QueryInterface(Ci.nsIInterfaceRequestor)
      .getInterface(Ci.nsIAppWindow)
      .rollupAllPopups();

    this.handleEnsoWorkspacesChangeBind = this.handleEnsoWorkspacesChange.bind(this);

    for (const element of this.parentElement.children) {
      if (element !== this) {
        element.hidden = true;
        this.#hiddenElements.push(element);
      }
    }

    for (const element of nsEnsoWorkspaceCreation.elementsToDisable) {
      const el = document.getElementById(element);
      if (el) {
        el.setAttribute("disabled", "true");
      }
    }

    this.createButton.addEventListener("command", this.onCreateButtonCommand.bind(this));
    this.cancelButton.addEventListener("command", this.onCancelButtonCommand.bind(this));

    this.inputName.addEventListener("input", () => {
      this.createButton.disabled = !this.inputName.value.trim();
    });

    this.inputIcon.addEventListener("command", this.onIconCommand.bind(this));

    this.profilesPopup = this.querySelector(".enso-workspace-creation-profiles-popup");

    if (gEnsoWorkspaces.shouldShowContainers) {
      this.inputProfile.addEventListener("command", this.onProfileCommand.bind(this));
      this.profilesPopup.addEventListener("popupshown", this.onProfilePopupShown.bind(this));
      this.profilesPopup.addEventListener("command", this.onProfilePopupCommand.bind(this));

      this.currentProfile = {
        id: 0,
        name: "Default",
      };
    } else {
      this.inputProfile.parentNode.hidden = true;
    }

    document.getElementById("enso-sidebar-splitter").style.pointerEvents = "none";

    gEnsoUIManager.motion
      .animate(
        [gBrowser.tabContainer, gURLBar],
        {
          opacity: [1, 0],
        },
        {
          duration: 0.3,
          type: "spring",
          bounce: 0,
        }
      )
      .then(() => {
        gBrowser.tabContainer.style.visibility = "collapse";
        if (gEnsoVerticalTabsManager._hasSetSingleToolbar) {
          document.getElementById("nav-bar").style.visibility = "collapse";
        }
        this.style.visibility = "visible";
        gEnsoCompactModeManager.getAndApplySidebarWidth();
        this.resolveInitialized();
        gEnsoUIManager.motion
          .animate(
            this.elementsToAnimate,
            {
              y: [20, 0],
              opacity: [0, 1],
              filter: ["blur(2px)", "blur(0)"],
            },
            {
              duration: 0.6,
              type: "spring",
              bounce: 0,
              delay: gEnsoUIManager.motion.stagger(0.05, { startDelay: 0.2 }),
            }
          )
          .then(() => {
            this.inputName.focus();
            gEnsoWorkspaces.workspaceElement(this.workspaceId).hidden = false;
          });
      });
  }

  async onCreateButtonCommand() {
    const workspace = gEnsoWorkspaces.getActiveWorkspace();
    workspace.name = this.inputName.value.trim();
    workspace.icon = this.inputIcon.image || this.inputIcon.label || undefined;
    workspace.containerTabId = this.currentProfile;
    await gEnsoWorkspaces.saveWorkspace(workspace);

    await this.#cleanup();

    gEnsoWorkspaces._organizeWorkspaceStripLocations(workspace, true);
    gEnsoWorkspaces.updateTabsContainers();

    gBrowser.tabContainer._invalidateCachedTabs();
  }

  async onCancelButtonCommand() {
    await gEnsoWorkspaces.changeWorkspaceWithID(this.previousWorkspaceId);
  }

  onIconCommand(event) {
    gEnsoEmojiPicker
      .open(event.target)
      .then(async (emoji) => {
        const isSvg = emoji && emoji.endsWith(".svg");
        if (isSvg) {
          this.inputIcon.label = "";
          this.inputIcon.image = emoji;
          this.inputIcon.setAttribute("has-svg-icon", "true");
        } else {
          this.inputIcon.image = "";
          this.inputIcon.label = emoji || "";
          this.inputIcon.removeAttribute("has-svg-icon");
        }
      })
      .catch((error) => {
        console.warn("Error changing workspace icon:", error);
      });
  }

  set currentProfile(profile) {
    this.inputProfile.label = profile.name;
    this._profileId = profile.id;
  }

  get currentProfile() {
    return this._profileId;
  }

  onProfileCommand(event) {
    this.profilesPopup.openPopup(event.target, "after_start");
  }

  onProfilePopupShown(event) {
    return window.createUserContextMenu(event, {
      isContextMenu: true,
      showDefaultTab: true,
    });
  }

  onProfilePopupCommand(event) {
    let userContextId = parseInt(event.target.getAttribute("data-usercontextid"));
    if (isNaN(userContextId)) {
      return;
    }
    this.currentProfile = {
      id: userContextId,
      name: event.target.label,
    };
  }

  finishSetup() {
    gEnsoWorkspaces.addChangeListeners(this.handleEnsoWorkspacesChangeBind, { once: true });
  }

  async handleEnsoWorkspacesChange() {
    await gEnsoWorkspaces.removeWorkspace(this.workspaceId);
    await this.#cleanup();
  }

  async #cleanup() {
    await gEnsoUIManager.motion.animate(
      this.elementsToAnimate.reverse(),
      {
        y: [0, 20],
        opacity: [1, 0],
        filter: ["blur(0)", "blur(2px)"],
      },
      {
        duration: 0.4,
        type: "spring",
        bounce: 0,
        delay: gEnsoUIManager.motion.stagger(0.05),
      }
    );

    document.getElementById("enso-sidebar-splitter").style.pointerEvents = "";

    gEnsoWorkspaces.removeChangeListeners(this.handleEnsoWorkspacesChangeBind);
    for (const element of this.constructor.elementsToDisable) {
      const el = document.getElementById(element);
      if (el) {
        el.removeAttribute("disabled");
      }
    }

    if (this.#wasInCollapsedMode) {
      gNavToolbox.removeAttribute("enso-sidebar-expanded");
      document.documentElement.removeAttribute("enso-sidebar-expanded");
    }

    document.documentElement.removeAttribute("enso-creating-workspace");

    gBrowser.tabContainer.style.visibility = "";
    gBrowser.tabContainer.style.opacity = 0;
    if (gEnsoVerticalTabsManager._hasSetSingleToolbar) {
      document.getElementById("nav-bar").style.visibility = "";
      gURLBar.style.opacity = 0;
    }

    this.remove();
    gEnsoUIManager.updateTabsToolbar();

    const workspace = gEnsoWorkspaces.getActiveWorkspace();
    gEnsoWorkspaces._organizeWorkspaceStripLocations(workspace);
    gEnsoWorkspaces.updateTabsContainers();

    await gEnsoUIManager.motion.animate(
      [gBrowser.tabContainer, gURLBar],
      {
        opacity: [0, 1],
      },
      {
        duration: 0.3,
        type: "spring",
        bounce: 0,
      }
    );

    gBrowser.tabContainer.style.opacity = "";
    if (gEnsoVerticalTabsManager._hasSetSingleToolbar) {
      gURLBar.style.opacity = "";
    }

    for (const element of this.#hiddenElements) {
      element.hidden = false;
    }

    this.#hiddenElements = [];
  }
}

customElements.define("enso-workspace-creation", nsEnsoWorkspaceCreation);
