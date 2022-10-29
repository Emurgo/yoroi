export type AuthMethod = 'pin' | 'os'
export type AuthMethodState =
  | {
      PIN: true
      OS: false
      None: false
    }
  | {
      PIN: false
      OS: true
      None: false
    }
  | {
      PIN: false
      OS: false
      None: true
    }
