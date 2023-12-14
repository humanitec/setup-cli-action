import os from 'os'
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'

// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [amd64, 386, arm]
function mapArch(arch: string): string {
  switch (arch) {
    case 'x32':
      return '386'
    case 'x64':
      return 'amd64'
    default:
      return arch
  }
}

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapPlatform(platform: string): string {
  switch (platform) {
    case 'macOS':
      return 'darwin'
    case 'win32':
    case 'win64':
      return 'windows'
    default:
      return platform
  }
}

function getDownloadUrl(version: string): string {
  const platform = mapPlatform(os.platform())
  const arch = mapArch(os.arch())

  const extension = platform === 'windows' ? 'zip' : 'tar.gz'

  return `https://storage.googleapis.com/humctl-releases/v${version}/cli_${version}_${platform}_${arch}.${extension}`
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const version = core.getInput('version')
    const url = getDownloadUrl(version)

    core.info(`Downloading: ${url}`)
    const pathToTarball = await tc.downloadTool(url)

    const extract = url.endsWith('.zip') ? tc.extractZip : tc.extractTar
    const pathToCLI = await extract(pathToTarball)

    core.info(`Registering path: ${pathToCLI}`)
    core.addPath(pathToCLI)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
