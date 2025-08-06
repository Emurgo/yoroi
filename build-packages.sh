set -euo pipefail

packages=(
  types
  common
  api
  identicon
  theme
  explorers
  portfolio
  blockchains
  exchange
  resolver
  claim
  setup-wallet
  notifications
  links
  staking
  swap
  transfer
  dapp-connector
)

for pkg in "${packages[@]}"; do
  echo "→ Deleting node_modules in '${pkg}'…"
  rm -rf "packages/$pkg/node_modules"
done

for pkg in "${packages[@]}"; do
  echo "→ Installing, testing and building '${pkg}'…"
  (
    cd "packages/$pkg"
    npm ci
    npm run build
    echo "   ✔️  Build completed for '${pkg}'"
  )
done

echo "✅ All done!"
