/* Any copyright is dedicated to the Public Domain.
   https://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

// verify that workspace unloading works
add_task(async function test_UnloadWorkspace_WithMultipleTabs() {
  const workspaceId = await gEnsoWorkspaces.createAndSaveWorkspace("Test Workspace 1");
  const tabs = [];
  for (let i = 0; i < 3; i++) {
    const tab = await BrowserTestUtils.openNewForegroundTab(
      window.gBrowser,
      `data:text/html,<title>Workspace Tab ${i}</title>`,
      true,
      { skipAnimation: true }
    );
    tab.setAttribute("enso-workspace-id", workspaceId);
    tabs.push(tab);
  }

  for (const tab of tabs) {
    ok(!tab.hasAttribute("pending"), "Tab should not be pending before unload");
    ok(tab.linkedPanel, "Tab should have linked panel before unload");
  }

  await gEnsoWorkspaces.unloadWorkspace();

  for (const tab of tabs) {
    ok(tab.hasAttribute("pending"), "Tab should be pending after unload");
    ok(!tab.linkedPanel, "Tab should not have linked panel after unload");
  }

  await gEnsoWorkspaces.removeWorkspace(workspaceId);
});

// verify that essential tabs are not unloaded
add_task(async function test_UnloadWorkspace_WithEssentialTabs() {
  const workspaceId = await gEnsoWorkspaces.createAndSaveWorkspace("Test Workspace 2");

  const regularTab = await BrowserTestUtils.openNewForegroundTab(
    window.gBrowser,
    "data:text/html,<title>Hi! I am a Regular Tab</title>",
    true,
    { skipAnimation: true }
  );
  regularTab.setAttribute("enso-workspace-id", workspaceId);

  const essentialTab = await BrowserTestUtils.openNewForegroundTab(
    window.gBrowser,
    "data:text/html,<title>Hi! I am an Essential Tab</title>",
    true,
    { skipAnimation: true }
  );
  essentialTab.setAttribute("enso-workspace-id", workspaceId);
  essentialTab.setAttribute("enso-essential", "true");

  await gEnsoWorkspaces.unloadWorkspace();

  ok(regularTab.hasAttribute("pending"), "Regular tab should be unloaded");
  ok(!regularTab.linkedPanel, "Regular tab should not have linked panel");

  ok(!essentialTab.hasAttribute("pending"), "Essential tab should not be unloaded");
  ok(essentialTab.linkedPanel, "Essential tab should still have linked panel");

  await gEnsoWorkspaces.removeWorkspace(workspaceId);
});

// only tabs from the targeted workspace should be unloaded
add_task(async function test_UnloadWorkspace_TargetedWorkspaceIsolation() {
  const inActiveWorkspaceId = await gEnsoWorkspaces.createAndSaveWorkspace(
    "Test In-Active Workspace"
  );
  const activeWorkspaceId = await gEnsoWorkspaces.createAndSaveWorkspace("Test Active Workspace");

  const inActiveWorkspaceTabs = [];
  for (let i = 0; i < 2; i++) {
    const tab = await BrowserTestUtils.openNewForegroundTab(
      window.gBrowser,
      `data:text/html,<title>In-Active Workspace Tab ${i}</title>`,
      true,
      { skipAnimation: true }
    );
    tab.setAttribute("enso-workspace-id", inActiveWorkspaceId);
    inActiveWorkspaceTabs.push(tab);
  }

  const activeWorkspaceTabs = [];
  for (let i = 0; i < 2; i++) {
    const tab = await BrowserTestUtils.openNewForegroundTab(
      window.gBrowser,
      `data:text/html,<title>Active Workspace Tab ${i}</title>`,
      true,
      { skipAnimation: true }
    );
    tab.setAttribute("enso-workspace-id", activeWorkspaceId);
    activeWorkspaceTabs.push(tab);
  }

  await gEnsoWorkspaces.unloadWorkspace(); // this unloads the latest created workspace -> activeWorkspaceId

  for (const tab of activeWorkspaceTabs) {
    ok(tab.hasAttribute("pending"), "Active workspace tab should be pending after unload");
    ok(!tab.linkedPanel, "Active workspace tab should not have linked panel after unload");
  }

  for (const tab of inActiveWorkspaceTabs) {
    ok(!tab.hasAttribute("pending"), "In-Active workspace tab should NOT be pending after unload");
    ok(tab.linkedPanel, "In-Active workspace tab should still have linked panel after unload");
  }

  await gEnsoWorkspaces.removeWorkspace(inActiveWorkspaceId);
  await gEnsoWorkspaces.removeWorkspace(activeWorkspaceId);
});
