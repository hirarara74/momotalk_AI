// Prints Cloudflare Web Analytics per edition and the free edition's Worker request counts.
//   node scripts/cf-analytics.mjs [days=30]
// Editions are told apart by the page's host, not by site tag, so renaming sites in the dashboard changes nothing:
//   hirarara74.github.io  -> public edition (GitHub Pages, token in vite.config.ts)
//   *.workers.dev         -> key-free edition (token in .env.free of the private repo)
// Uses wrangler's OAuth login (run `npx wrangler login` once). Cloudflare samples these counts (multiples of 10) and
// rate-limits the GraphQL API hard: if it answers "budget depleted", wait 5 minutes.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const days = Number(process.argv[2]) || 30
const toml = join(process.env.APPDATA || join(process.env.HOME, '.config'), 'xdg.config/.wrangler/config/default.toml')
const token = readFileSync(toml, 'utf8').match(/^oauth_token\s*=\s*"(.+)"/m)?.[1]
if (!token) throw new Error('No wrangler login found. Run `npx wrangler login`.')

const api = (path, init) =>
    fetch(`https://api.cloudflare.com/client/v4/${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    }).then((r) => r.json())

const edition = (host) => (host === 'hirarara74.github.io' ? 'public (Pages)' : host.endsWith('.workers.dev') ? 'free (Worker)' : host)
const accountTag = (await api('accounts')).result[0].id
const from = new Date(Date.now() - days * 864e5).toISOString()
const to = new Date().toISOString()
const query = `query($tag:string!,$from:Time!,$to:Time!){viewer{accounts(filter:{accountTag:$tag}){
  rum:rumPageloadEventsAdaptiveGroups(limit:1000,filter:{datetime_geq:$from,datetime_leq:$to}){dimensions{date requestHost} count sum{visits}}
  workers:workersInvocationsAdaptive(limit:1000,filter:{scriptName:"momotalk-ai-free",datetime_geq:$from,datetime_leq:$to}){dimensions{date} sum{requests}}
}}}`
const res = await api('graphql', { method: 'POST', body: JSON.stringify({ query, variables: { tag: accountTag, from, to } }) })
if (res.errors) throw new Error(res.errors[0].message)
const { rum, workers } = res.data.viewer.accounts[0]

const days_ = {}
const row = (date) => (days_[date] ??= { date, 'public (Pages)': 0, 'free (Worker)': 0, visits: 0, api: 0 })
for (const g of rum) {
    const r = row(g.dimensions.date)
    const name = edition(g.dimensions.requestHost)
    r[name] = (r[name] || 0) + g.count
    r.visits += g.sum.visits
}
for (const g of workers) row(g.dimensions.date).api += g.sum.requests
console.log(`page views per edition, total visits and free-edition API calls (last ${days} days)`)
console.table(Object.values(days_).sort((a, b) => a.date.localeCompare(b.date)))
