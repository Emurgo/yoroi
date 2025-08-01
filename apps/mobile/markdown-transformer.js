const fs = require('fs')
const path = require('path')

function createMarkdownResolver(projectRoot) {
  return (context, moduleName, platform) => {
    if (moduleName.endsWith('.md')) {
      const resolvedPath = context.resolveRequest(context, moduleName, platform)

      if (resolvedPath && resolvedPath.filePath) {
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
      }
    }

    return null
  }
}

module.exports = {
  createMarkdownResolver,
}
