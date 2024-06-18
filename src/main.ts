import os from 'os'
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import { Octokit } from '@octokit/rest'
import * as semver from 'semver'
import { isSpecificRange } from './semver'

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

async function getDownloadUrl(version: string): Promise<string> {
  const platform = mapPlatform(os.platform())
  const arch = mapArch(os.arch())
  const extension = platform === 'windows' ? 'zip' : 'tar.gz'

  const path = `v${version}/cli_${version}_${platform}_${arch}.${extension}`

  if (version === '0.11.0') {
    return `https://storage.googleapis.com/humctl-releases/${path}`
  }
  return `https://github.com/humanitec/cli/releases/download/${path}`
}

async function findMatchingRelease(
  range: semver.Range,
  octokit: InstanceType<typeof Octokit>
): Promise<string> {
  const perPage = 100
  let page = 0

  let lastPage = false
  while (!lastPage) {
    const response = await octokit.rest.repos.listReleases({
      owner: 'humanitec',
      repo: 'cli',
      per_page: perPage,
      page
    })

    const releases = response.data

    for (const release of releases) {
      if (range.test(release.tag_name)) {
        return release.tag_name
      }
    }

    if (releases.length < perPage) {
      lastPage = true
    } else {
      page++
    }
  }

  throw new Error('No matching release found')
}

// Determine the version to download based on the input
async function determineVersion(
  version: string,
  token?: string
): Promise<string> {
  const range = new semver.Range(version)
  if (!semver.validRange(range)) {
    throw new Error(`Input is an invalid semver range: ${version}`)
  }

  if (isSpecificRange(version)) {
    return version
  }

  const octokit = new Octokit({ auth: token })

  return findMatchingRelease(range, octokit)
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const versionRange = core.getInput('version', { required: true })
    const token = core.getInput('token')

    const versionWithPrefix = await determineVersion(versionRange, token)
    const version = versionWithPrefix.replace(/^v/, '')

    core.info(`Matched version: ${version}`)

    const url = await getDownloadUrl(version)

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
