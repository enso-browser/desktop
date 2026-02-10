/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_EnsoStyleSheetCache_h__
#define mozilla_EnsoStyleSheetCache_h__

#include "mozilla/css/Loader.h"
#include "mozilla/NotNull.h"
#include "mozilla/StaticPtr.h"

#ifndef ENSO_MODS_FILENAME
  #define ENSO_MODS_FILENAME u"enso-themes.css"_ns
#endif

namespace enso {

class EnsoStyleSheetCache final : public nsISupports {
  using StyleSheet = mozilla::StyleSheet;

 public:
  NS_DECL_ISUPPORTS

  /**
   * @brief Get the mods stylesheet.
   * This is called when we need to get the mods stylesheets.
   * @returns The mods stylesheet.
   */
  auto GetModsSheet() -> StyleSheet*;

  /**
   * @brief Rebuild the mods stylesheets.
   * This is re-parses the mods stylesheet and applies it to all
   * the connected documents.
   * @param aContents The contents of the mods stylesheet.
   * @returns NS_OK on success, or an error code on failure.
   */
  nsresult RebuildModsStylesheets(const nsACString& aContents);

  static auto Singleton() -> EnsoStyleSheetCache*;
 private:
  EnsoStyleSheetCache() = default;
  ~EnsoStyleSheetCache() = default;

  /**
   * @brief Load the stylesheet from the given file.
   * @param aFile The file to load the stylesheet from.
   */
  auto LoadSheetFile(nsIFile* aFile, mozilla::css::SheetParsingMode aParsingMode)
      -> void;

  static mozilla::StaticRefPtr<EnsoStyleSheetCache> gEnsoModsCache;

  RefPtr<StyleSheet> mModsSheet;
};

} // namespace enso

#endif
