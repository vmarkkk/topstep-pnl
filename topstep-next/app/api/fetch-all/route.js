const API_BASE = 'https://api.topstep.com'
const CRYSTAL  = 'https://crystal.topstep.com'

async function ts(method, url, body, token) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'https://dashboard.topstep.com',
    'Referer': 'https://dashboard.topstep.com/',
  }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)
  const res  = await fetch(url, opts)
  const text = await res.text()
  try { return { data: JSON.parse(text), status: res.status } }
  catch { return { data: { error: text }, status: res.status } }
}

async function gql(op, query, variables, token) {
  return ts('POST', `${CRYSTAL}/graphql/${op}`, { operationName: op, variables, query }, token)
}

function decodeUserId(token) {
  try {
    const seg = token.split('.')[1]
    const pad = seg + '='.repeat((4 - seg.length % 4) % 4)
    return JSON.parse(Buffer.from(pad, 'base64').toString()).id
  } catch { return null }
}

export async function POST(req) {
  const { token } = await req.json()
  if (!token) return Response.json({ error: 'No token' }, { status: 400 })

  const userId = decodeUserId(token)

  // Accounts
  const accRes  = await ts('GET', `${API_BASE}/me/accounts/basic?offset=0&limit=500&sortBy=createdAt&sortOrder=desc`, null, token)
  const accounts = accRes.status < 400 ? (accRes.data.accounts || []) : []

  // Purchases (all pages)
  const PQ = `query GetAllPurchasesByUser($userId: Int!, $first: Int, $offset: Int, $order: String) {
  normalizedPurchasesByUser(userid: $userId page: $offset size: $first direction: $order) {
    nodes { id accountId accountName type total subtotal discount tax paymentStatus source createdAt }
  }
  normalizedPurchasesByUserTotalCount(userid: $userId)
}`
  let purchases = [], offset = 0, totalCount = null
  if (userId) {
    while (true) {
      const r = await gql('GetAllPurchasesByUser', PQ, { userId, first: 100, offset, order: 'DESC' }, token)
      if (r.status >= 400) break
      const d = r.data?.data || {}
      const batch = d.normalizedPurchasesByUser?.nodes || []
      if (totalCount === null) totalCount = d.normalizedPurchasesByUserTotalCount || 0
      purchases.push(...batch)
      offset += batch.length
      if (!batch.length || offset >= totalCount) break
    }
  }

  // Payouts (all pages)
  let payouts = [], page = 1
  while (true) {
    const r = await ts('GET', `${API_BASE}/me/payouts?page=${page}&limit=100`, null, token)
    if (r.status >= 400) break
    const batch = r.data?.payoutRequests || []
    payouts.push(...batch)
    const totalPages = r.data?.totalPages || 1
    if (page >= totalPages || !batch.length) break
    page++
  }

  return Response.json({ accounts, purchases, payouts, userId })
}
