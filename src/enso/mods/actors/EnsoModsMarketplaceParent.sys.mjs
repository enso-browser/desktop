// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

export class EnsoModsMarketplaceParent extends JSWindowActorParent {
  constructor() {
    super();
  }

  get modsManager() {
    return this.browsingContext.topChromeWindow.gEnsoMods;
  }

  async receiveMessage(message) {
    switch (message.name) {
      case "EnsoModsMarketplace:InstallMod": {
        const modId = message.data.modId;
        const mod = await this.modsManager.requestMod(modId);

        console.warn(`[EnsoModsMarketplaceParent]: Installing mod ${mod.id}`);

        mod.enabled = true;

        const mods = await this.modsManager.getMods();
        mods[mod.id] = mod;

        await this.modsManager.updateMods(mods);
        await this.updateChildProcesses(mod.id);

        break;
      }
      case "EnsoModsMarketplace:UninstallMod": {
        const modId = message.data.modId;
        console.warn(`[EnsoModsMarketplaceParent]: Uninstalling mod ${modId}`);

        const mods = await this.modsManager.getMods();

        delete mods[modId];

        await this.modsManager.removeMod(modId);
        await this.modsManager.updateMods(mods);

        await this.updateChildProcesses(modId);

        break;
      }
      case "EnsoModsMarketplace:CheckForUpdates": {
        const updates = await this.modsManager.checkForModsUpdates();
        this.sendAsyncMessage("EnsoModsMarketplace:CheckForUpdatesFinished", { updates });
        break;
      }

      case "EnsoModsMarketplace:IsModInstalled": {
        const themeId = message.data.themeId;
        const themes = await this.modsManager.getMods();

        return Boolean(themes?.[themeId]);
      }
    }
    return undefined;
  }

  async updateChildProcesses(modId) {
    this.sendAsyncMessage("EnsoModsMarketplace:ModChanged", { modId });
  }
}
