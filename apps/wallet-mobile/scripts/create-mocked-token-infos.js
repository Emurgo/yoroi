const nftCryptoKitty = {
  decimals: 0,
  ticker: 'CryptoKitty',
  name: 'CryptoKitty #1234',
  symbol: 'CK',
  status: 'normal',
  application: 'token',
  tag: '',
  reference: '0xabcdef1234567890.cryptokitty1234',
  website: 'https://www.cryptokitties.co',
  originalImage: 'https://cdn.example.com/ck-original1234.png',
  id: '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.43554259',
  fingerprint: 'asset1s7nlt45cc82upqewvjtgu7g97l7eg483c6wu75',
  nature: 'secondary',
  type: 'nft',
}

function generateTokenInfos(baseToken, count) {
  const tokens = []
  for (let i = 0; i < count; i++) {
    // Clone the base token object to create a new token
    const id = `${baseToken.id.split('.')[0]}.${Buffer.from(String(i)).toString('hex')}`
    const name = `${baseToken.name.split(' ')[0]} #${i}`
    const reference = `${baseToken.reference.split('.')[0]}.${Buffer.from(String(i)).toString('hex')}`
    const fingerprint = `asset${i}s7nlt45cc82upqewvjtgu7g97l7eg483c6wu${i}`
    
    const newToken = {...baseToken, id, name, reference, fingerprint}

    tokens.push(newToken)
  }
  return tokens
}

const generatedTokens = generateTokenInfos(nftCryptoKitty, 50)

const apiResponseTokenInfos = generatedTokens.reduce((acc, token, index) => {
  acc[token.id] = [200, token, `hash${index + 1}`, 3600]
  return acc
}, {})

console.log(JSON.stringify(apiResponseTokenInfos, null, 2))
