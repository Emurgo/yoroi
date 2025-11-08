export type ScanActionSendOnlyReceiver = Readonly<{
  action: 'send-only-receiver'
  receiver: string
}>

export type ScanActionSendSinglePt = Readonly<{
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

export type ScanActionClaim = Readonly<{
  action: 'claim'
  url: string
  code: string
  params: Record<string, any> | undefined
}>

export type ScanActionLaunchUrl = Readonly<{
  action: 'launch-url'
  url: string
}>

export type ScanActionBrowseDapp = Readonly<{
  action: 'browse-dapp'
  scheme: string
  domain: string
  path?: string
  url: string
  query?: string
}>

export type ScanActionPayRequest = Readonly<{
  action: 'pay-request'
  address: string
  amount?: string
  asset?: string
  memo?: string
}>

export type ScanActionStakePool = Readonly<{
  action: 'stake-pool'
  pool: string
}>

export type ScanActionViewTransaction = Readonly<{
  action: 'view-transaction'
  hash: string
}>

export type ScanActionViewBlock = Readonly<{
  action: 'view-block'
  hash?: string
  height?: string
}>

export type ScanActionViewAddress = Readonly<{
  action: 'view-address'
  address: string
}>

export type ScanActionP2PConnect = Readonly<{
  action: 'p2p-connect'
  peerId: string
  signalingUrl?: string
}>

export type ScanAction =
  | ScanActionSendOnlyReceiver
  | ScanActionSendSinglePt
  | ScanActionClaim
  | ScanActionLaunchUrl
  | ScanActionBrowseDapp
  | ScanActionPayRequest
  | ScanActionStakePool
  | ScanActionViewTransaction
  | ScanActionViewBlock
  | ScanActionViewAddress
  | ScanActionP2PConnect

export type ScanFeature = 'send' | 'scan'
