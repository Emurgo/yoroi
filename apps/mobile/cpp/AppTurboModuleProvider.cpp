#include "AppTurboModuleProvider.h"
#include "NativeCslMobileBridgeModule.h"
#include "NativeMslMobileBridgeModule.h"

namespace facebook::react {

std::shared_ptr<TurboModule> AppTurboModuleProvider::getTurboModule(
    const std::string& name,
    std::shared_ptr<CallInvoker> jsInvoker) const {
  if (name == "CslMobileBridge") {
    return std::make_shared<facebook::react::NativeCslMobileBridgeModule>(jsInvoker);
  }
  if (name == "MslMobileBridge") {
     return std::make_shared<facebook::react::NativeMslMobileBridgeModule>(jsInvoker);
  }
  // Other C++ Turbo Native Modules for you app
  return nullptr;
}

} // namespace facebook::react
