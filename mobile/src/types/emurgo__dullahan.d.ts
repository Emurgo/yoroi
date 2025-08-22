declare module '@emurgo/dullahan/.js/yoroi/Locker' {
  export function Locker(secretKey: Buffer): {
    decrypt: (data: Buffer) => Promise<Buffer>
    encrypt: (
      data: Buffer,
      options: {salt: Buffer; nonce: Buffer},
    ) => Promise<Buffer>
  }
}

declare module '@emurgo/dullahan/.js/core' {
  export function bytes(hex: string): Buffer
}
