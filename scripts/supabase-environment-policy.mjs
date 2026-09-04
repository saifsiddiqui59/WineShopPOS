import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PROD_REF = 'uiurgplnsgmawvxhjzzp'
export const DEV_REF = 'juhcypzoacauzmtzqnwd'

export function currentBranch() {
  const fromEnv = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME
  if (fromEnv) return fromEnv.trim()
  try {
    return execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

export function expectedRefForBranch(branch = currentBranch()) {
  if (!branch) throw new Error('ENVIRONMENT_ISOLATION_BLOCKED: unable to determine Git branch')
  return branch === 'main' ? PROD_REF : DEV_REF
}

export function extractSupabaseRef(value) {
  if (!value) return ''
  const text = String(value).trim()
  const urlMatch = text.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co\/?/i)
  if (urlMatch) return urlMatch[1]
  if (/^[a-z0-9-]+$/i.test(text)) return text
  return ''
}

export function assertSupabaseTarget({ branch = currentBranch(), url, projectRef } = {}) {
  const expected = expectedRefForBranch(branch)
  const fromProjectRef = extractSupabaseRef(projectRef)
  const fromUrl = extractSupabaseRef(url)

  if (fromProjectRef && fromUrl && fromProjectRef !== fromUrl) {
    throw new Error(`ENVIRONMENT_ISOLATION_BLOCKED: Supabase URL (${fromUrl}) and project ref (${fromProjectRef}) disagree`)
  }

  const actual = fromProjectRef || fromUrl
  if (!actual) throw new Error(`ENVIRONMENT_ISOLATION_BLOCKED: no Supabase project configured for branch ${branch}`)

  if (actual !== expected) {
    const environment = branch === 'main' ? 'PROD' : 'DEV'
    throw new Error(`ENVIRONMENT_ISOLATION_BLOCKED: branch ${branch} is ${environment}-bound and may only use ${expected}; configured ${actual}`)
  }
  return { branch, expected, actual }
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {}
  const values = {}
  for (const rawLine of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator < 1) continue
    const key = line.slice(0, separator).trim()
    let value = line.slice(separator + 1).trim()
    value = value.replace(/^['"]|['"]$/g, '')
    values[key] = value
  }
  return values
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const fileEnv = {
    ...parseEnvFile(resolve('.env')),
    ...parseEnvFile(resolve('.env.local')),
  }
  const result = assertSupabaseTarget({
    url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || fileEnv.VITE_SUPABASE_URL || fileEnv.SUPABASE_URL,
    projectRef: process.env.SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_REF || fileEnv.SUPABASE_PROJECT_ID || fileEnv.SUPABASE_PROJECT_REF,
  })
  console.log(`Environment isolation OK: ${result.branch} -> ${result.actual}`)
}
