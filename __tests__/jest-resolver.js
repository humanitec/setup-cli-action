const path = require('path')
const fs = require('fs')

function findPackageDir(pkgName, basedir) {
  let dir = basedir
  while (dir !== path.dirname(dir)) {
    const candidate = path.join(dir, 'node_modules', pkgName)
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate
    }
    dir = path.dirname(dir)
  }
  return null
}

module.exports = (request, options) => {
  try {
    return options.defaultResolver(request, options)
  } catch (error) {
    // Parse scoped or unscoped package name + subpath
    const match = request.match(/^(@[^/]+\/[^/]+|[^@][^/]*)(\/.+)?$/)
    if (!match) throw error

    const pkgName = match[1]
    const subpath = match[2] ? '.' + match[2] : '.'

    const pkgDir = findPackageDir(pkgName, options.basedir)
    if (!pkgDir) throw error

    const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'))
    const exports = pkgJson.exports

    if (exports && exports[subpath]) {
      const entry = exports[subpath]
      const importPath = typeof entry === 'string' ? entry : entry.import || entry.default
      if (importPath) {
        return path.join(pkgDir, importPath)
      }
    }

    // Fallback: try resolving the subpath directly as a file
    if (subpath !== '.') {
      const directPath = path.join(pkgDir, subpath.slice(2))
      for (const ext of ['', '.js', '.cjs', '.mjs']) {
        if (fs.existsSync(directPath + ext)) {
          return directPath + ext
        }
      }
    }

    throw error
  }
}
