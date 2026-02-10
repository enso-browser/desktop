/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_EnsoModsBackend_h__
#define mozilla_EnsoModsBackend_h__

#include "nsIEnsoModsBackend.h"
#include "nsIEnsoCommonUtils.h"

#include "mozilla/ServoStyleSet.h"
#include "mozilla/dom/Document.h"

namespace enso {

class nsEnsoModsBackend final : public nsIEnsoModsBackend {
  NS_DECL_ISUPPORTS
  NS_DECL_NSIENSOMODSBACKEND

 public:
  explicit nsEnsoModsBackend();

 protected:
  /**
   * @brief Check for the preference and see if the app is on safe mode.
   */
  auto CheckEnabled() -> void;

 private:
  ~nsEnsoModsBackend() = default;
  bool mEnabled = false;
};

} // namespace enso

#endif
