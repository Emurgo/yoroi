export type CardanoActionSendOnlyReceiver = Readonly<{
  action: 'send-only-receiver'
  receiver: string
}>

export type CardanoActionSendSinglePt = Readonly<{
  action: 'send-single-pt'
  receiver: string
  params:
    | {
        amount: number | undefined
        memo: string | undefined
        message: string | undefined
      }
    | undefined
}>

export type CardanoActionClaim = Readonly<{
  action: 'claim'
  url: string
  code: string
  params: Record<string, any> | undefined
}>

export type CardanoActionLaunchUrl = Readonly<{
  action: 'launch-url'
  url: string
}>

export type CardanoActionBrowseDapp = Readonly<{
  action: 'browse-dapp'
  scheme: string
  domain: string
  path?: string
  url: string
  query?: string
}>

export type CardanoActionPayRequest = Readonly<{
  action: 'pay-request'
  address: string
  amount?: string
  asset?: string
  memo?: string
}>

export type CardanoActionStakePool = Readonly<{
  action: 'stake-pool'
  pool: string
}>

export type CardanoActionDelegateDrep = Readonly<{
  action: 'delegate-drep'
  drep: string
}>

export type CardanoActionViewTransaction = Readonly<{
  action: 'view-transaction'
  hash: string
}>

export type CardanoActionViewBlock = Readonly<{
  action: 'view-block'
  hash?: string
  height?: string
}>

export type CardanoActionViewAddress = Readonly<{
  action: 'view-address'
  address: string
}>

export type CardanoActionP2PConnect = Readonly<{
  action: 'p2p-connect'
  dappPeer: string
  host?: string
  port?: string
  path?: string
  secure?: boolean
}>

export type CardanoActionRestoreWallet = Readonly<{
  action: 'restore-wallet'
  type: 'full' | 'readonly'
  mnemonic?: string
  rootKey?: string
  accountPubKey?: string
  encryption?: string
  name?: string
  implementation?: string
  addressMode?: string
  accountVisual?: string
}>

export type CardanoAction =
  | CardanoActionSendOnlyReceiver
  | CardanoActionSendSinglePt
  | CardanoActionClaim
  | CardanoActionLaunchUrl
  | CardanoActionBrowseDapp
  | CardanoActionPayRequest
  | CardanoActionStakePool
  | CardanoActionDelegateDrep
  | CardanoActionViewTransaction
  | CardanoActionViewBlock
  | CardanoActionViewAddress
  | CardanoActionP2PConnect
  | CardanoActionRestoreWallet

export type ScanFeature = 'send' | 'scan'
