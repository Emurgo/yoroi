#pragma once

#include <ReactCommon/TurboModuleBinding.h>
#include <memory>
#include <string>

namespace facebook::react {

class AppTurboModuleProvider {
 public:
  std::shared_ptr<TurboModule> getTurboModule(
      const std::string& name,
      std::shared_ptr<CallInvoker> jsInvoker) const;
};
} // namespace facebook::react
