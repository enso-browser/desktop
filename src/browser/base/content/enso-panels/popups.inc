# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

<menupopup id="ensoCreateNewPopup">
  <menuitem data-l10n-id="enso-panel-ui-workspaces-create" command="cmd_ensoOpenWorkspaceCreation" image="chrome://browser/skin/enso-icons/duplicate-tab.svg" />
  <menuitem data-l10n-id="enso-panel-ui-folder-create" command="cmd_ensoOpenFolderCreation" image="chrome://browser/skin/enso-icons/folder.svg" />
  <menuseparator/>
  <menuitem data-l10n-id="enso-panel-ui-new-empty-split" command="cmd_ensoNewEmptySplit" image="chrome://browser/skin/enso-icons/split.svg" />
  <menuitem data-l10n-id="tabs-toolbar-new-tab" command="cmd_newNavigatorTab" image="chrome://browser/skin/enso-icons/plus.svg" />
</menupopup>

<menupopup id="ensoWorkspaceMoreActions">
  <menuitem id="context_ensoEditWorkspace" data-l10n-id="enso-workspaces-panel-change-name" command="cmd_zenChangeWorkspaceName"/>
  <menuitem id="context_ensoEditWorkspaceIcon" data-l10n-id="enso-workspaces-panel-change-icon" command="cmd_zenChangeWorkspaceIcon"/>
  <menuitem class="ensoToolbarThemePicker"
          id="context_zenChangeWorkspaceTheme"
          data-l10n-id="enso-workspaces-change-theme"
          command="cmd_ensoOpenZenThemePicker"/>
  <menu id="context_ensoWorkspacesOpenInContainerTab"
    data-l10n-id="enso-workspaces-panel-context-default-profile"
    selection-type="single"
    node-type="link"
    hide-if-private-browsing="true"
    hide-if-usercontext-disabled="true">
    <menupopup />
  </menu>
  <menuitem id="context_zenUnloadWorkspace" data-l10n-id="enso-workspaces-panel-unload" command="cmd_zenUnloadWorkspace"/>
  <menuseparator id="context_ensoWorkspacesSeparator"/>
  <menuseparator/>
  <menuitem id="context_zenReorderWorkspaces" data-l10n-id="enso-workspaces-panel-context-reorder" command="cmd_zenReorderWorkspaces"/>
  <menuseparator/>
  <menuitem data-l10n-id="enso-panel-ui-workspaces-create" command="cmd_ensoOpenWorkspaceCreation"/>
  <menuitem id="context_zenDeleteWorkspace" data-l10n-id="enso-workspaces-panel-context-delete" command="cmd_zenCtxDeleteWorkspace"/>
</menupopup>

<menupopup id="ensoFolderActions">
  <menuitem id="context_ensoFolderRename" data-l10n-id="enso-folders-panel-rename-folder"/>
  <menuitem id="context_ensoFolderChangeIcon" data-l10n-id="tab-context-enso-edit-icon"/>
  <menuseparator />
  <menuitem id="context_ensoFolderUnloadAll" data-l10n-id="enso-folders-unload-folder"/>
  <menuitem id="context_ensoFolderNewSubfolder" data-l10n-id="enso-folders-new-subfolder"/>
  <menuseparator />
  <menu id="context_zenChangeFolderSpace"
    data-l10n-id="enso-folders-panel-change-folder-space">
    <menupopup />
  </menu>
  <menuitem id="context_ensoFolderToSpace" data-l10n-id="enso-folders-panel-convert-folder-to-space" />
  <menuseparator />
  <menuitem id="context_ensoFolderUnpack" data-l10n-id="enso-folders-panel-unpack-folder"/>
  <menuitem id="context_ensoFolderDelete" data-l10n-id="enso-folders-panel-delete-folder"/>
</menupopup>

<menupopup id="ensoSiteDataActions">
  <menuitem id="context_zenClearSiteData" data-l10n-id="identity-clear-site-data"/>
  <menuseparator />
  <menuitem command="Tools:Addons" data-l10n-id="enso-site-data-manage-addons"/>
  <menuitem id="context_ensoOpenGetAddons" data-l10n-id="enso-site-data-get-addons"/>
  <menuseparator />
  <menuitem id="context_ensoOpenSiteSettings" data-l10n-id="enso-site-data-site-settings"/>
</menupopup>

<menupopup id="ensoMoveTabsToSyncedWorkspacePopup">
# Popup to move tabs to a synced workspace.
# This would be automatically populated with the list of available synced workspaces.
</menupopup>
