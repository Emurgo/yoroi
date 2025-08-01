// Check if we're in a Node.js environment where fs is available
let fs, path
try {
  fs = require('fs')
  path = require('path')
} catch (error) {
  // We're in a React Native environment where fs is not available
  console.warn('File system modules not available in React Native environment')
  fs = null
  path = null
}

function createMarkdownResolver(projectRoot) {
  return (context, moduleName, platform) => {
    // If fs is not available, skip markdown processing
    if (!fs || !path) {
      return null
    }

    if (moduleName.endsWith('.md')) {
      const resolvedPath = context.resolveRequest(context, moduleName, platform)

      if (resolvedPath && resolvedPath.filePath) {
        try {
          const content = fs.readFileSync(resolvedPath.filePath, 'utf8')
          const virtualPath = resolvedPath.filePath + '.js'
          const moduleCode = `module.exports = ${JSON.stringify(content)};`

          const tempDir = path.join(projectRoot, '.metro-cache')
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, {recursive: true})
          }

          const tempFile = path.join(tempDir, path.basename(virtualPath))
          fs.writeFileSync(tempFile, moduleCode)

          return {
            filePath: tempFile,
            type: 'sourceFile',
          }
        } catch (error) {
          console.warn('Failed to process markdown file:', error.message)
          return null
        }
      }
    }

    return null
  }
}

module.exports = {
  createMarkdownResolver,
}
