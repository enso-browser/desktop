/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { html } from "chrome://global/content/vendor/lit.all.mjs";
import { MozLitElement } from "chrome://global/content/lit-utils.mjs";

const lazy = {};

ChromeUtils.defineLazyGetter(lazy, "siblingElement", () => {
  // All our notifications should be attached after the media controls toolbar
  return document.getElementById("enso-media-controls-toolbar");
});

/**
 * Enso Sidebar Notification Component
 *
 * Displays and takes care of animations for notifications that
 * appear in the sidebar.
 */
class EnsoSidebarNotification extends MozLitElement {
  static properties = {
    headingL10nId: { type: String, fluent: true },
    links: { type: Array },
  };

  constructor({ headingL10nId = "", links = [] } = {}) {
    super();
    this.headingL10nId = headingL10nId;
    this.links = links;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.parentElement) {
      this.#animateIn();
    }
  }

  remove() {
    this.#animateOut().then(() => {
      super.remove();
    });
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="chrome://browser/content/enso-styles/enso-sidebar-notification.css" />
      <div class="enso-sidebar-notification-header">
        <label
          class="enso-sidebar-notification-heading"
          flex="1"
          data-l10n-id=${this.headingL10nId}></label>
        <div class="enso-sidebar-notification-close-button" @click=${() => this.remove()}>
          <img src="chrome://browser/skin/enso-icons/close.svg" />
        </div>
      </div>
      <div class="enso-sidebar-notification-body">
        ${this.links.map(
          (link) => html`
            <div
              class="enso-sidebar-notification-link-container"
              data-l10n-id="${link.l10nId}-tooltip"
              ?special=${link.special}
              @click=${() => {
                if (link.action) {
                  link.action();
                  return;
                }
                window.openLinkIn(link.url, "tab", {
                  triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),
                  forceForeground: true,
                });
                this.remove();
              }}>
              <img class="enso-sidebar-notification-link-icon" src=${link.icon} />
              <label
                class="enso-sidebar-notification-link-text"
                data-l10n-id="${link.l10nId}-label"></label>
            </div>
          `
        )}
      </div>
    `;
  }

  #animateIn() {
    this.style.opacity = "0";
    return gEnsoUIManager.motion.animate(
      this,
      {
        opacity: [0, 1],
        y: [50, 0],
      },
      {
        delay: 1,
      }
    );
  }

  #animateOut() {
    return gEnsoUIManager.motion.animate(
      this,
      {
        opacity: [1, 0],
        y: [0, 10],
      },
      {}
    );
  }
}

export default function createSidebarNotification(args) {
  if (!gEnsoVerticalTabsManager._prefsSidebarExpanded) {
    return null;
  }

  const notification = new EnsoSidebarNotification(args);

  lazy.siblingElement.insertAdjacentElement("afterend", notification);
  return notification;
}

customElements.define("enso-sidebar-notification", EnsoSidebarNotification);
