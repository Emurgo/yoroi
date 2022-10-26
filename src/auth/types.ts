export type AuthMethod = 'pin' | 'os'
export type AuthMethodState =
  | {
      method: 'pin'
      PIN: true
      OS: false
      None: false
    }
  | {
      method: 'os'
      PIN: false
      OS: true
      None: false
    }
  | {
      PIN: false
      OS: false
      None: true
    }
