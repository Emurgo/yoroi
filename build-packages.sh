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
  echo "→ Deleting node_modules in package '${pkg}'…"
  (
    cd "./packages/$pkg" \
    && rm -rf node_modules \
    && echo "   ✔️  node_modules removed from '${pkg}'" \
    && cd ..
  )
done


for pkg in "${packages[@]}"; do
  echo "→ Installing dependencies and building '${pkg}'…"
  (
    cd "./packages/$pkg" \
    && npm i \
    && npm run build \
    && echo "   ✔️  Build completed for '${pkg}'" \
    && cd ..
  )
done

echo "✅ All done!"
