export type BanxaTheme = 'dark' | 'light'

const supportedTheme: Readonly<BanxaTheme[]> = ['dark', 'light'] as const

export function banxaIsTheme(value: any): value is BanxaTheme {
  return supportedTheme.includes(value as BanxaTheme)
}
