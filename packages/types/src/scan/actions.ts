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

export type ScanAction =
  | ScanActionSendOnlyReceiver
  | ScanActionSendSinglePt
  | ScanActionClaim
  | ScanActionLaunchUrl

export type ScanFeature = 'send' | 'scan'
