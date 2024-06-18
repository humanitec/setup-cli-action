import os from 'os'
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import { Octokit } from '@octokit/rest'
import * as semver from 'semver'
import * as process from 'node:process'

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

async function getDownloadUrl(version: string, token: string): Promise<string> {
  const platform = mapPlatform(os.platform())
  const arch = mapArch(os.arch())
  const extension = platform === 'windows' ? 'zip' : 'tar.gz'

  if (version === '0.11.0') {
    return `https://storage.googleapis.com/humctl-releases/v${version}/cli_${version}_${platform}_${arch}.${extension}`
  }
  const oktokit = new Octokit({ auth: token })

  const response = await oktokit.rest.repos.listReleases({
    owner: 'humanitec',
    repo: 'cli'
  })
  const releases = response.data
  // Get all tags as an array
  const tags = releases.map(release => {
    const semverVersion = semver.parse(release.tag_name)
    if (semverVersion === null) {
      throw new Error(`Failed to parse version from tag: ${release.tag_name}`)
    }
    return semverVersion.version
  })

  let downloadVersion: string | null = null
  if (version !== 'latest') {
    // Get the maximum version that satisfies the condition
    downloadVersion = semver.maxSatisfying(tags, version)
    if (downloadVersion == null) {
      throw new Error('Requested version not found in releases')
    }
  } else {
    downloadVersion = tags[0]
  }

  return `https://github.com/humanitec/cli/releases/download/v${downloadVersion}/cli_${downloadVersion}_${platform}_${arch}.${extension}`
}
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version')
    const token: string = process.env['GITHUB_TOKEN'] ?? ''
    const url: string = await getDownloadUrl(version, token)

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
