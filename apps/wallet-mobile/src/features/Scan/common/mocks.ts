export const codeContent = {
  noLink: {
    error: {
      invalid: 'invalid receiver',
    },
    success: {
      address:
        'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
      domain: '$stackchain',
    },
  },
  // TODO: should come from links package
  links: {
    error: {
      schemeNotImplemented:
        'bitcoin:1BoatSLRHtKNngkdXEeobR76b53LETtpyT?amount=0.01&label=JohnDoe&message=Payment%20for%20services',
      paramsValidationFailed:
        'web+cardano:addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km?amount=1,23&memo=%25%24-_%2F.memo&message=%25%24-_%2F.messagei',
      forbiddenParamsProvided:
        'web+cardano://claim/v1?code=42&faucet_url=https%3A%2F%2Ffaucet.com&memo=1&message=1&amount=-%2CNaN&address=1',
      unsupportedVersion:
        'web+cardano://claim/v2?code=42&faucet_url=https%3A%2F%2Ffaucet.com&memo=1&message=1&amount=-%2CNaN&address=1',
      unsupportedAuthority:
        'web+cardano://authority/v2?code=42&faucet_url=https%3A%2F%2Ffaucet.com&memo=1&message=1&amount=-%2CNaN&address=1',
    },
    success: {
      cardanoCip99ClaimV1:
        'web+cardano://claim/v1?code=42&faucet_url=https%3A%2F%2Ffaucet.com&memo=memo-text&message=message1&message=message2&message=message3&extra=extra',
      legacyCip13Transfer:
        'web+cardano:addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km?extra=extra&amount=1.23&memo=memo&message=message',
    },
  },
} as const
