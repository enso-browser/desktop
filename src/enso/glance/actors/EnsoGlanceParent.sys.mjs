// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

/* eslint-disable consistent-return */

export class EnsoGlanceParent extends JSWindowActorParent {
  constructor() {
    super();
  }

  async receiveMessage(message) {
    switch (message.name) {
      case "ZenGlance:GetActivationMethod": {
        return Services.prefs.getStringPref("enso.glance.activation-method", "ctrl");
      }
      case "ZenGlance:OpenGlance": {
        this.openGlance(this.browsingContext.topChromeWindow, message.data);
        break;
      }
      case "ZenGlance:CloseGlance": {
        const params = {
          onTabClose: true,
          ...message.data,
        };
        this.browsingContext.topChromeWindow.gEnsoGlanceManager.closeGlance(params);
        break;
      }
      case "ZenGlance:RecordLinkClickData": {
        this.browsingContext.topChromeWindow.gEnsoGlanceManager.lastLinkClickData = message.data;
        break;
      }
      default:
        console.warn(`[glance]: Unknown message: ${message.name}`);
    }
  }

  openGlance(window, data) {
    return window.gEnsoGlanceManager.openGlance(data);
  }
}
