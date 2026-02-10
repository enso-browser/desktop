// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

document.addEventListener(
  "MozBeforeInitialXULLayout",
  () => {
    // <commandset id="mainCommandSet"> defined in browser-sets.inc
    // eslint-disable-next-line complexity
    document.getElementById("ensoCommandSet").addEventListener("command", (event) => {
      switch (event.target.id) {
        case "cmd_ensoCompactModeToggle":
          gEnsoCompactModeManager.toggle();
          break;
        case "cmd_ensoCompactModeShowSidebar":
          gEnsoCompactModeManager.toggleSidebar();
          break;
        case "cmd_toggleCompactModeIgnoreHover":
          gEnsoCompactModeManager.toggle(true);
          break;
        case "cmd_ensoWorkspaceForward":
          gEnsoWorkspaces.changeWorkspaceShortcut();
          break;
        case "cmd_ensoWorkspaceBackward":
          gEnsoWorkspaces.changeWorkspaceShortcut(-1);
          break;
        case "cmd_ensoSplitViewGrid":
          gEnsoViewSplitter.toggleShortcut("grid");
          break;
        case "cmd_ensoSplitViewVertical":
          gEnsoViewSplitter.toggleShortcut("vsep");
          break;
        case "cmd_ensoSplitViewHorizontal":
          gEnsoViewSplitter.toggleShortcut("hsep");
          break;
        case "cmd_ensoSplitViewUnsplit":
          gEnsoViewSplitter.toggleShortcut("unsplit");
          break;
        case "cmd_ensoSplitViewContextMenu":
          gEnsoViewSplitter.contextSplitTabs();
          break;
        case "cmd_ensoCopyCurrentURLMarkdown":
          gEnsoCommonActions.copyCurrentURLAsMarkdownToClipboard();
          break;
        case "cmd_ensoCopyCurrentURL":
          gEnsoCommonActions.copyCurrentURLToClipboard();
          break;
        case "cmd_ensoPinnedTabReset":
          gEnsoPinnedTabManager.resetPinnedTab(gBrowser.selectedTab);
          break;
        case "cmd_ensoPinnedTabResetNoTab":
          gEnsoPinnedTabManager.resetPinnedTab();
          break;
        case "cmd_ensoToggleSidebar":
          gEnsoVerticalTabsManager.toggleExpand();
          break;
        case "cmd_ensoOpenZenThemePicker":
          gEnsoThemePicker.openThemePicker(event);
          break;
        case "cmd_ensoChangeWorkspaceTab":
          gEnsoWorkspaces.changeTabWorkspace(
            event.sourceEvent.target.getAttribute("enso-workspace-id")
          );
          break;
        case "cmd_ensoToggleTabsOnRight":
          gEnsoVerticalTabsManager.toggleTabsOnRight();
          break;
        case "cmd_ensoSplitViewLinkInNewTab":
          gEnsoViewSplitter.splitLinkInNewTab();
          break;
        case "cmd_ensoNewEmptySplit":
          setTimeout(() => {
            gEnsoViewSplitter.createEmptySplit();
          }, 0);
          break;
        case "cmd_ensoReplacePinnedUrlWithCurrent":
          gEnsoPinnedTabManager.replacePinnedUrlWithCurrent();
          break;
        case "cmd_contextZenAddToEssentials":
          gEnsoPinnedTabManager.addToEssentials();
          break;
        case "cmd_contextZenRemoveFromEssentials":
          gEnsoPinnedTabManager.removeEssentials();
          break;
        case "cmd_ensoCtxDeleteWorkspace":
          gEnsoWorkspaces.contextDeleteWorkspace(event);
          break;
        case "cmd_ensoChangeWorkspaceName":
          gEnsoVerticalTabsManager.renameTabStart({
            target: gEnsoWorkspaces.activeWorkspaceIndicator.querySelector(
              ".enso-current-workspace-indicator-name"
            ),
          });
          break;
        case "cmd_ensoChangeWorkspaceIcon":
          gEnsoWorkspaces.changeWorkspaceIcon();
          break;
        case "cmd_ensoReorderWorkspaces":
          gEnsoUIManager.showToast("enso-workspaces-how-to-reorder-title", {
            timeout: 9000,
            descriptionId: "enso-workspaces-how-to-reorder-desc",
          });
          break;
        case "cmd_ensoOpenWorkspaceCreation":
          gEnsoWorkspaces.openWorkspaceCreation(event);
          break;
        case "cmd_ensoOpenFolderCreation":
          gEnsoFolders.createFolder([], {
            renameFolder: true,
          });
          break;
        case "cmd_ensoTogglePinTab": {
          const currentTab = gBrowser.selectedTab;
          if (currentTab && !currentTab.hasAttribute("enso-empty-tab")) {
            if (currentTab.pinned) {
              gBrowser.unpinTab(currentTab);
            } else {
              gBrowser.pinTab(currentTab);
            }
          }
          break;
        }
        case "cmd_ensoCloseUnpinnedTabs":
          gEnsoWorkspaces.closeAllUnpinnedTabs();
          break;
        case "cmd_ensoUnloadWorkspace": {
          gEnsoWorkspaces.unloadWorkspace();
          break;
        }
        case "cmd_ensoNewNavigatorUnsynced":
          OpenBrowserWindow({ ensoSyncedWindow: false });
          break;
        default:
          gEnsoGlanceManager.handleMainCommandSet(event);
          if (event.target.id.startsWith("cmd_ensoWorkspaceSwitch")) {
            const index = parseInt(event.target.id.replace("cmd_ensoWorkspaceSwitch", ""), 10) - 1;
            gEnsoWorkspaces.shortcutSwitchTo(index);
          }
          break;
      }
    });
  },
  { once: true }
);
