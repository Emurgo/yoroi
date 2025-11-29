#!/usr/bin/env node

/**
 * Script to bulk-fix branded type issues in mock files
 * Fixes common patterns:
 * - id: '.' -> id: primaryTokenId
 * - String literals -> Type casts for Address, Amount, TokenId, etc.
 * - Adds missing imports
 */

const fs = require('fs');
const path = require('path');

const MOCK_FILES = [
  'src/wallets/cardano/mocks/index.ts',
  'packages/swap/adapters/api/muesliswap/api.mocks.ts',
  'packages/swap/adapters/api/dexhunter/api.mocks.ts',
  'src/features/ReviewTx/common/mocks.ts',
  'src/features/Staking/Governance/common/mocks.ts',
  'src/wallets/cardano/utxoManager/raw-utxos.mocks.ts',
  'src/wallets/mocks/utxos.ts',
  'src/wallets/mocks/transaction.ts',
  'src/wallets/mocks/wallet.ts',
  'src/features/WalletManager/wallet.mock.ts',
];

// Patterns to fix
const FIXES = [
  // Replace id: '.' with primaryTokenId
  {
    pattern: /id:\s*['"]\.['"]/g,
    replacement: 'id: primaryTokenId',
    requiresImport: true,
  },
  {
    pattern: /id:\s*`\.`/g,
    replacement: 'id: primaryTokenId',
    requiresImport: true,
  },
  
  // Fix tokenId patterns (already have as TokenId)
  // Fix address patterns - be careful not to break existing casts
  {
    pattern: /address:\s*['"](addr[^'"]+)['"]/g,
    replacement: (match, addr) => {
      // Skip if already has 'as Address'
      if (match.includes('as Address')) return match;
      return `address: '${addr}' as Address`;
    },
    requiresImport: true,
  },
  
  // Remove duplicate casts (as Type as Type)
  {
    pattern: /as\s+(\w+)\s+as\s+\1/g,
    replacement: 'as $1',
  },
  
  // Fix Branded.PolicyId -> PolicyId
  {
    pattern: /as\s+Branded\.PolicyId/g,
    replacement: 'as PolicyId',
  },
  
  // Fix Branded.AssetName -> AssetName
  {
    pattern: /as\s+Branded\.AssetName/g,
    replacement: 'as AssetName',
  },
  
  // Fix amount patterns
  {
    pattern: /amount:\s*['"]([0-9]+)['"]/g,
    replacement: (match, amount) => {
      // Skip if already has 'as Amount' or 'as BalanceQuantity'
      if (match.includes('as ')) return match;
      return `amount: '${amount}' as Amount`;
    },
    requiresImport: true,
  },
  
  // Fix quantity patterns
  {
    pattern: /quantity:\s*['"]([0-9]+)['"]/g,
    replacement: (match, qty) => {
      if (match.includes('as ')) return match;
      return `quantity: '${qty}' as BalanceQuantity`;
    },
    requiresImport: true,
  },
  
  // Fix tokenId patterns (policyId.assetName format)
  {
    pattern: /tokenId:\s*['"]([a-fA-F0-9]{56}\.[a-fA-F0-9]+)['"]/g,
    replacement: (match, tokenId) => {
      if (match.includes('as ')) return match;
      return `tokenId: '${tokenId}' as TokenId`;
    },
    requiresImport: true,
  },
  
  // Fix id patterns in tokenInfo (policyId.assetName format)
  {
    pattern: /id:\s*['"]([a-fA-F0-9]{56}\.[a-fA-F0-9]+)['"]/g,
    replacement: (match, tokenId) => {
      if (match.includes('as ') || match.includes('primaryTokenId')) return match;
      return `id: '${tokenId}' as TokenId`;
    },
    requiresImport: true,
  },
  
  // Fix policyId patterns (56 hex chars)
  {
    pattern: /policyId:\s*['"]([a-fA-F0-9]{56})['"]/g,
    replacement: (match, policyId) => {
      if (match.includes('as ')) return match;
      return `policyId: '${policyId}' as PolicyId`;
    },
    requiresImport: true,
  },
  
  // Fix assetName patterns (hex string)
  {
    pattern: /name:\s*['"]([a-fA-F0-9]+)['"]/g,
    replacement: (match, name) => {
      if (match.includes('as ')) return match;
      return `name: '${name}' as AssetName`;
    },
    requiresImport: true,
  },
  
  // Fix blockHash patterns (64 hex chars)
  {
    pattern: /blockHash:\s*['"]([a-fA-F0-9]{64})['"]/g,
    replacement: (match, hash) => {
      if (match.includes('as ')) return match;
      return `blockHash: '${hash}' as BlockHash`;
    },
    requiresImport: true,
  },
  
  // Fix transaction hash patterns
  {
    pattern: /(?:hash|txHash|id):\s*['"]([a-fA-F0-9]{64})['"]/g,
    replacement: (match, hash) => {
      if (match.includes('as ')) return match;
      // Determine type based on context
      if (match.includes('txHash') || match.includes('hash:')) {
        return match.replace(`'${hash}'`, `'${hash}' as TransactionHash`);
      }
      if (match.includes('id:')) {
        return match.replace(`'${hash}'`, `'${hash}' as TransactionHash`);
      }
      return match;
    },
    requiresImport: true,
  },
  
  // Fix tx_hash patterns
  {
    pattern: /tx_hash:\s*['"]([a-fA-F0-9]+)['"]/g,
    replacement: (match, hash) => {
      if (match.includes('as ')) return match;
      return `tx_hash: '${hash}' as TransactionHash`;
    },
    requiresImport: true,
  },
  
  // Fix utxo_id patterns
  {
    pattern: /utxo_id:\s*['"]([^'"]+)['"]/g,
    replacement: (match, utxoId) => {
      if (match.includes('as ')) return match;
      return `utxo_id: '${utxoId}' as UtxoId`;
    },
    requiresImport: true,
  },
  
  // Fix receiver patterns (addresses)
  {
    pattern: /receiver:\s*['"](addr[^'"]+)['"]/g,
    replacement: (match, addr) => {
      if (match.includes('as ')) return match;
      return `receiver: '${addr}' as Address`;
    },
    requiresImport: true,
  },
  
  // Fix identifier patterns (tokenId)
  {
    pattern: /identifier:\s*['"]([a-fA-F0-9]{56}(?:\.[a-fA-F0-9]+)?)['"]/g,
    replacement: (match, tokenId) => {
      if (match.includes('as ')) return match;
      return `identifier: '${tokenId}' as TokenId`;
    },
    requiresImport: true,
  },
];

// Required imports for each file
const REQUIRED_IMPORTS = {
  'src/wallets/cardano/mocks/index.ts': [
    'PolicyId',
    'AssetName',
    'BlockHash',
  ],
  'packages/swap/adapters/api/muesliswap/api.mocks.ts': [
    'Address',
    'Amount',
    'TransactionHash',
    'PolicyId',
    'TokenId',
  ],
  'packages/swap/adapters/api/dexhunter/api.mocks.ts': [
    'Address',
    'TransactionHash',
    'TokenId',
  ],
  'src/features/ReviewTx/common/mocks.ts': [
    'TokenId',
    'BalanceQuantity',
  ],
  'src/features/Staking/Governance/common/mocks.ts': [
    'TransactionHash',
    'SlotNumber',
    'EpochNumber',
  ],
  'src/wallets/cardano/utxoManager/raw-utxos.mocks.ts': [
    'Address',
    'TransactionHash',
    'UtxoId',
    'BalanceQuantity',
    'TokenId',
    'PolicyId',
    'AssetName',
  ],
  'src/wallets/mocks/utxos.ts': [
    'Address',
    'TransactionHash',
    'UtxoId',
    'BalanceQuantity',
    'TokenId',
    'PolicyId',
    'AssetName',
  ],
  'src/wallets/mocks/transaction.ts': [
    'Address',
    'Amount',
    'TransactionHash',
    'TokenId',
  ],
  'src/wallets/mocks/wallet.ts': [
    'Address',
    'Amount',
    'TransactionHash',
    'TokenId',
    'UtxoId',
  ],
  'src/features/WalletManager/wallet.mock.ts': [
    'Address',
    'TransactionHash',
    'UtxoId',
  ],
};

function addImports(content, filePath) {
  const relativePath = filePath.replace(/^mobile\//, '');
  const required = REQUIRED_IMPORTS[relativePath] || [];
  
  if (required.length === 0) return content;
  
  // Find the import line from @yoroi/types
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@yoroi\/types['"]/;
  const match = content.match(importRegex);
  
  if (match) {
    const existingImports = match[1].split(',').map(i => i.trim()).filter(Boolean);
    const missingImports = required.filter(imp => !existingImports.includes(imp));
    
    if (missingImports.length === 0) return content;
    
    const newImports = [...new Set([...existingImports, ...missingImports])].sort();
    return content.replace(
      importRegex,
      `import {${newImports.join(', ')}} from '@yoroi/types'`
    );
  }
  
  // Add new import if none exists
  const firstImport = content.match(/^import\s+/m);
  if (firstImport) {
    const insertPos = firstImport.index;
    return (
      content.slice(0, insertPos) +
      `import {${required.join(', ')}} from '@yoroi/types'\n` +
      content.slice(insertPos)
    );
  }
  
  return content;
}

function addPrimaryTokenIdImport(content) {
  if (content.includes('primaryTokenId')) {
    // Check if import exists
    if (content.includes("from '@yoroi/portfolio'")) return content;
    
    // Add import
    const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@yoroi\/types['"]/;
    const match = content.match(importRegex);
    
    if (match) {
      return content.replace(
        importRegex,
        `$&\nimport {primaryTokenId} from '@yoroi/portfolio'`
      );
    }
    
    // Add at top if no @yoroi/types import
    const firstImport = content.match(/^import\s+/m);
    if (firstImport) {
      const insertPos = firstImport.index;
      return (
        content.slice(0, insertPos) +
        `import {primaryTokenId} from '@yoroi/portfolio'\n` +
        content.slice(insertPos)
      );
    }
  }
  
  return content;
}

function fixFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  
  // Apply fixes
  for (const fix of FIXES) {
    if (typeof fix.replacement === 'function') {
      content = content.replace(fix.pattern, fix.replacement);
    } else {
      content = content.replace(fix.pattern, fix.replacement);
    }
  }
  
  // Add required imports
  content = addImports(content, filePath);
  content = addPrimaryTokenIdImport(content);
  
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes: ${filePath}`);
    return false;
  }
}

// Main execution
console.log('🔧 Fixing mock files...\n');

let fixedCount = 0;
for (const file of MOCK_FILES) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✨ Fixed ${fixedCount} file(s)`);

