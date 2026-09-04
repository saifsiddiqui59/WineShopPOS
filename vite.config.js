import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { assertSupabaseTarget, currentBranch } from './scripts/supabase-environment-policy.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const branch = currentBranch()
  const isolation = assertSupabaseTarget({
    branch,
    url: env.VITE_SUPABASE_URL,
    projectRef: env.SUPABASE_PROJECT_ID || env.SUPABASE_PROJECT_REF,
  })

  return {
    plugins: [react()],
    define: {
      __EXPECTED_SUPABASE_REF__: JSON.stringify(isolation.expected),
    },
  }
})
