/* Any copyright is dedicated to the Public Domain.
   https://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

add_task(async function test_Change_To_Empty() {
  // eslint-disable-next-line no-unused-vars
  const currentWorkspaceUUID = gEnsoWorkspaces.activeWorkspace;
  await gEnsoWorkspaces.createAndSaveWorkspace("Test Workspace 2");
  const workspaces = gEnsoWorkspaces.getWorkspaces();
  const secondWorkspace = workspaces.workspaces[1];

  await gEnsoWorkspaces.changeWorkspace(secondWorkspace.uuid);
  Assert.strictEqual(
    gBrowser.selectedTab,
    gEnsoWorkspaces._emptyTab,
    "The empty tab should be selected."
  );

  await gEnsoWorkspaces.removeWorkspace(gEnsoWorkspaces.activeWorkspace);
  Assert.notStrictEqual(
    gBrowser.selectedTab,
    gEnsoWorkspaces._emptyTab,
    "The empty tab should not be selected anymore."
  );

  const workspacesAfterRemove = gEnsoWorkspaces.getWorkspaces();
  Assert.strictEqual(workspacesAfterRemove.length, 1, "One workspace should exist.");
  Assert.strictEqual(gBrowser.tabs.length, 2, "There should be two tabs.");
});
