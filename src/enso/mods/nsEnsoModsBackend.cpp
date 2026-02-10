/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "nsEnsoModsBackend.h"

#include "nsIXULRuntime.h"
#include "nsStyleSheetService.h"

#include "mozilla/PresShell.h"
#include "mozilla/dom/ContentParent.h"

#include "nsIURI.h"
#include "nsIFile.h"

#include "EnsoStyleSheetCache.h"

namespace enso {

namespace {
/// @brief Helper function to get the singleton instance of EnsoStyleSheetCache.
/// @return A pointer to the singleton instance of EnsoStyleSheetCache.
static auto GetEnsoStyleSheetCache() -> EnsoStyleSheetCache* {
  return EnsoStyleSheetCache::Singleton();
}
}

// Use the macro to inject all of the definitions for nsISupports.
NS_IMPL_ISUPPORTS(nsEnsoModsBackend, nsIEnsoModsBackend)

nsEnsoModsBackend::nsEnsoModsBackend() {
  (void)CheckEnabled();
}

auto nsEnsoModsBackend::CheckEnabled() -> void {
  // Check if the mods backend is enabled based on the preference.
  nsCOMPtr<nsIXULRuntime> appInfo =
      do_GetService("@mozilla.org/xre/app-info;1");
  bool inSafeMode = false;
  if (appInfo) {
    appInfo->GetInSafeMode(&inSafeMode);
  }
  mEnabled = !inSafeMode &&
             !mozilla::Preferences::GetBool("enso.themes.disable-all", false);
}

auto nsEnsoModsBackend::RebuildModsStyles(const nsACString& aContents) -> nsresult {
  // Notify that the mods stylesheets have been rebuilt.
  return GetEnsoStyleSheetCache()->RebuildModsStylesheets(aContents);
}

} // namespace: enso

auto nsStyleSheetService::ZenMarkStylesAsChanged() -> void {
  for (auto& presShell : mPresShells) {
    if (presShell) {
      if (auto doc = presShell->GetDocument(); doc && doc->IsInChromeDocShell()) {
        // Notify the document that styles have changed.
        doc->ApplicableStylesChanged();
      }
    }
  }
}
