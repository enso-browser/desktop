/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_EnsoDragAndDrop_h__
#define mozilla_EnsoDragAndDrop_h__

#include "nsIEnsoDragAndDrop.h"
#include "nsCOMPtr.h"

#define ENSO_BOOSTS_BACKEND_CONTRACTID "@mozilla.org/enso/drag-and-drop;1"

namespace enso {

/**
 * @brief Implementation of the nsIEnsoDragAndDrop interface.
 * When we want to do a drag and drop operation, web standards
 * don't really allow much customization of the drag image.
 * This class allows Enso to have more control over the drag
 * and drop operations for the tabs.
 */
class nsEnsoDragAndDrop final : public nsIEnsoDragAndDrop {
  NS_DECL_ISUPPORTS
  NS_DECL_NSIENSODRAGANDDROP

 public:
  explicit nsEnsoDragAndDrop();
  auto GetDragImageOpacity() const { return mDragImageOpacity; }

  /**
   * @brief Get the singleton instance of nsEnsoDragAndDrop. There may be occasions
   * where it won't be available (e.g. on the content process), so this may return
   * nullptr.
   * @return nsEnsoDragAndDrop* The singleton instance, or nullptr if not available
   */
  static auto GetEnsoDragAndDropInstance() -> nsCOMPtr<nsEnsoDragAndDrop>;

 private:
  ~nsEnsoDragAndDrop() = default;
  float mDragImageOpacity{};
};

} // namespace enso

#endif
