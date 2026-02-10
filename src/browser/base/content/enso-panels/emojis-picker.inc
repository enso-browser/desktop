# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

<panel type="arrow" orient="vertical" id="PanelUI-enso-emojis-picker" position="bottomright topright" side="bottom">
  <hbox id="PanelUI-enso-picker-header">
    <toolbarbutton class="toolbarbutton-1" />
    <hbox id="PanelUI-enso-emojis-buttons-wrapper">
      <toolbarbutton id="PanelUI-enso-emojis-picker-change-emojis" class="selected" data-l10n-id="enso-icons-picker-emoji" />
      <toolbarbutton id="PanelUI-enso-emojis-picker-change-svg" data-l10n-id="enso-icons-picker-svg" />
    </hbox>
    <toolbarbutton id="PanelUI-enso-emojis-picker-none" class="toolbarbutton-1" />
  </hbox>
  <hbox id="PanelUI-enso-emojis-picker-pages">
    <vbox emojis="true">
      <hbox id="PanelUI-enso-emojis-picker-header">
        <html:input type="search" id="PanelUI-enso-emojis-picker-search" placeholder="Search emojis" />
      </hbox>
      <hbox id="PanelUI-enso-emojis-picker-list" />
    </vbox>
    <hbox svgs="true" id="PanelUI-enso-emojis-picker-svgs" />
  </hbox>
</panel>
