/* Any copyright is dedicated to the Public Domain.
   https://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

add_task(async function test_Glance_Select_Parent() {
  await openGlanceOnTab(async (glanceTab) => {
    ok(
      glanceTab.hasAttribute("enso-glance-tab"),
      "The glance tab should have the enso-glance-tab attribute"
    );
    await BrowserTestUtils.openNewForegroundTab(window.gBrowser, "https://example.com/", true, {
      skipAnimation: true,
    });
    const tabToRemove = gBrowser.selectedTab;
    gBrowser.selectedTab = gEnsoGlanceManager.getTabOrGlanceParent(glanceTab);
    await BrowserTestUtils.waitForCondition(() => {
      return glanceTab.selected;
    });
    ok(true, "The glance tab should be selected");
    await BrowserTestUtils.removeTab(tabToRemove);
  });
});
