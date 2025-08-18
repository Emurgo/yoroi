declare module 'react-native-fast-pbkdf2' {
  const Pbkdf2: {
    derive(
      passwordB64: string,
      saltB64: string,
      iterations: number,
      keyLength: number,
      hash: 'sha-1' | 'sha-224' | 'sha-256' | 'sha-384' | 'sha-512',
    ): Promise<string>
  }
  export default Pbkdf2
}


