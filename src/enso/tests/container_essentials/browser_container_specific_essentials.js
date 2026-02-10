/* Any copyright is dedicated to the Public Domain.
   https://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

add_task(async function test_Check_Creation() {
  await gEnsoWorkspaces.createAndSaveWorkspace("Container Profile 1", undefined, false, 1);
  const workspaces = gEnsoWorkspaces.getWorkspaces();
  Assert.strictEqual(workspaces.length, 2, "Two workspaces should exist.");

  await gEnsoWorkspaces.changeWorkspace(workspaces[1]);
  let newTab = BrowserTestUtils.addTab(gBrowser, "about:blank", {
    skipAnimation: true,
    userContextId: 1,
  });
  ok(newTab, "New tab should be opened.");
  gEnsoPinnedTabManager.addToEssentials(newTab);
  ok(
    newTab.hasAttribute("enso-essential") && newTab.parentNode.getAttribute("container") == "1",
    "New tab should be marked as essential."
  );
  ok(
    gBrowser.tabs.find(
      (t) => t.hasAttribute("enso-essential") && t.getAttribute("usercontextid") == 1
    ),
    "New tab should be marked as essential."
  );
  const newWorkspaceUUID = gEnsoWorkspaces.activeWorkspace;

  // Change to the original workspace, there should be no essential tabs
  await gEnsoWorkspaces.changeWorkspace(workspaces[0]);
  ok(
    !gBrowser.tabs.find(
      (t) => t.hasAttribute("enso-essential") && t.getAttribute("usercontextid") == 1
    ),
    "No essential tabs should be found in the original workspace."
  );

  await gEnsoWorkspaces.removeWorkspace(newWorkspaceUUID);
});
