import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextCoreWebVitals,
  {
    ignores: ['.next/**', 'node_modules/**'],
    rules: {
      // Server Components evaluate subscription deadlines from the current time,
      // and Supabase-backed client screens load their initial state in effects.
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

export default config

