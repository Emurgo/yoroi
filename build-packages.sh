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
  explorers
  links
  staking
  swap
  transfer
  dapp-connector
)

for pkg in "${packages[@]}"; do
  (
    cd "./packages/$pkg" \
    && rm -rf node_modules \
    && cd ..
  )
done


for pkg in "${packages[@]}"; do
  (
    cd "./packages/$pkg" \
    && npm i \
    && npm run build \
    && cd ..
  )
done
