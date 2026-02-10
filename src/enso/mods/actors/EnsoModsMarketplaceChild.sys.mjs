// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

export class EnsoModsMarketplaceChild extends JSWindowActorChild {
  constructor() {
    super();
  }

  handleEvent(event) {
    if (event.type === "DOMContentLoaded") {
      const verifier = this.contentWindow.document.querySelector(
        'meta[name="enso-content-verified"]'
      );

      if (verifier) {
        verifier.setAttribute("content", "verified");
      }

      this.initiateModsMarketplace();

      this.contentWindow.document.addEventListener(
        "ZenCheckForModUpdates",
        this.checkForModUpdates.bind(this)
      );
    }
  }

  // This function will be called from about:preferences
  checkForModUpdates(event) {
    event.preventDefault();

    this.sendAsyncMessage("EnsoModsMarketplace:CheckForUpdates");
  }

  initiateModsMarketplace() {
    this.contentWindow.setTimeout(() => {
      this.addButtons();
      this.injectMarketplaceAPI();
    }, 0);
  }

  get actionButton() {
    return this.contentWindow.document.getElementById("install-theme");
  }

  get actionButtonUninstall() {
    return this.contentWindow.document.getElementById("install-theme-uninstall");
  }

  async isThemeInstalled(themeId) {
    return await this.sendQuery("EnsoModsMarketplace:IsModInstalled", { themeId });
  }

  async receiveMessage(message) {
    switch (message.name) {
      case "EnsoModsMarketplace:ModChanged": {
        const modId = message.data.modId;
        const actionButton = this.actionButton;
        const actionButtonInstalled = this.actionButtonUninstall;

        if (actionButton && actionButtonInstalled) {
          actionButton.disabled = false;
          actionButtonInstalled.disabled = false;

          if (await this.isThemeInstalled(modId)) {
            actionButton.classList.add("hidden");
            actionButtonInstalled.classList.remove("hidden");
          } else {
            actionButton.classList.remove("hidden");
            actionButtonInstalled.classList.add("hidden");
          }
        }

        break;
      }

      case "EnsoModsMarketplace:CheckForUpdatesFinished": {
        const updates = message.data.updates;

        this.contentWindow.document.dispatchEvent(
          new CustomEvent("EnsoModsMarketplace:CheckForUpdatesFinished", { detail: { updates } })
        );

        break;
      }
    }
  }

  injectMarketplaceAPI() {
    Cu.exportFunction(this.handleModInstallationEvent.bind(this), this.contentWindow, {
      defineAs: "EnsoInstallMod",
    });
  }

  async addButtons() {
    const actionButton = this.actionButton;
    const actionButtonUninstall = this.actionButtonUninstall;
    const errorMessage = this.contentWindow.document.getElementById("install-theme-error");
    if (!actionButton || !actionButtonUninstall) {
      return;
    }

    errorMessage.classList.add("hidden");

    const themeId = actionButton.getAttribute("enso-theme-id");
    if (await this.isThemeInstalled(themeId)) {
      actionButtonUninstall.classList.remove("hidden");
    } else {
      actionButton.classList.remove("hidden");
    }

    actionButton.addEventListener("click", this.handleModInstallationEvent.bind(this));
    actionButtonUninstall.addEventListener("click", this.handleModUninstallEvent.bind(this));
  }

  async handleModUninstallEvent(event) {
    const button = event.target;
    button.disabled = true;

    const modId = button.getAttribute("enso-theme-id");

    this.sendAsyncMessage("EnsoModsMarketplace:UninstallMod", { modId });
  }

  async handleModInstallationEvent(event) {
    // Object can be an event or a theme id
    let modId;

    if (event.target) {
      const button = event.target;
      button.disabled = true;

      modId = button.getAttribute("enso-theme-id");
    } else {
      // Backwards compatibility is... Interesting
      modId = event.themeId ?? event.modId ?? event.id;
    }

    this.sendAsyncMessage("EnsoModsMarketplace:InstallMod", { modId });
  }
}
