const CANONICAL_URL = process.env.CANONICAL_URL ?? "https://na.reuniaovirtual.online/api/reunioes-virtuais"
const PROD_ALIAS_URL =
  process.env.PROD_ALIAS_URL ??
  "https://landing-impulsionamento-christian-m.vercel.app/api/reunioes-virtuais"

function toSortedKeys(obj) {
  return Object.keys(obj ?? {}).sort()
}

function hasV1Contract(payload) {
  const required = ["version", "serverTime", "lastSyncAt", "sourceStatus", "emAndamento", "iniciandoEmBreve", "proximas"]
  const keys = new Set(Object.keys(payload ?? {}))
  return required.every((k) => keys.has(k))
}

function getCounts(payload) {
  if (hasV1Contract(payload)) {
    return {
      emAndamento: Array.isArray(payload.emAndamento) ? payload.emAndamento.length : null,
      iniciandoEmBreve: Array.isArray(payload.iniciandoEmBreve) ? payload.iniciandoEmBreve.length : null,
      proximas: Array.isArray(payload.proximas) ? payload.proximas.length : null,
    }
  }

  return {
    emAndamento: typeof payload?.runningCount === "number" ? payload.runningCount : null,
    iniciandoEmBreve: typeof payload?.startingSoonCount === "number" ? payload.startingSoonCount : null,
    proximas: typeof payload?.upcomingCount === "number" ? payload.upcomingCount : null,
  }
}

async function fetchJson(url) {
  const startedAt = new Date().toISOString()
  const response = await fetch(url, { headers: { accept: "application/json" } })
  const body = await response.json()
  return {
    url,
    startedAt,
    status: response.status,
    payload: body,
    keys: toSortedKeys(body),
    isV1: hasV1Contract(body),
    counts: getCounts(body),
  }
}

function sameKeys(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function sameCounts(a, b) {
  return a.emAndamento === b.emAndamento && a.iniciandoEmBreve === b.iniciandoEmBreve && a.proximas === b.proximas
}

async function main() {
  const [canonical, alias] = await Promise.all([fetchJson(CANONICAL_URL), fetchJson(PROD_ALIAS_URL)])

  const output = {
    checkedAt: new Date().toISOString(),
    canonical: {
      url: canonical.url,
      startedAt: canonical.startedAt,
      status: canonical.status,
      isV1: canonical.isV1,
      keys: canonical.keys,
      counts: canonical.counts,
      sourceStatus: canonical.payload?.sourceStatus ?? null,
    },
    alias: {
      url: alias.url,
      startedAt: alias.startedAt,
      status: alias.status,
      isV1: alias.isV1,
      keys: alias.keys,
      counts: alias.counts,
      sourceStatus: alias.payload?.sourceStatus ?? null,
    },
  }

  output.assertions = {
    status200: canonical.status === 200 && alias.status === 200,
    sameContractKeys: sameKeys(canonical.keys, alias.keys),
    equivalentCounts: sameCounts(canonical.counts, alias.counts),
    canonicalIsV1: canonical.isV1,
    aliasIsV1: alias.isV1,
  }

  console.log(JSON.stringify(output, null, 2))

  if (!output.assertions.status200 || !output.assertions.sameContractKeys || !output.assertions.equivalentCounts) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error("[validate-canonical-cutover] unexpected error:", error?.message ?? error)
  process.exit(1)
})
