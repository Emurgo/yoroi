packages=(
  types
  common
  api
  blockchains
  claim
  dapp-connector
  exchange
  explorers
  identicon
  links
  notifications
  portfolio
  resolver
  setup-wallet
  staking
  swap
  theme
  transfer
)

for pkg in "${packages[@]}"; do
  (
    cd "./packages/$pkg" \
    && rm -rf node_modules \
    && npm i \
    && npm run build \
    && cd ..
  )
done
