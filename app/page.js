'use client'
import { useState, useCallback } from 'react'

const fmt  = n => '$' + Math.abs(+n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtS = n => (+n >= 0 ? '+$' : '-$') + Math.abs(+n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function Home() {
  const [screen, setScreen] = useState('auth')
  const [token, setToken]   = useState('')
  const [error, setError]   = useState('')
  const [data, setData]     = useState(null)
  const [goal, setGoal]     = useState('')

  const connect = useCallback(async () => {
    if (!token.trim()) { setError('Paste your bearer token.'); return }
    setError('')
    setScreen('loading')
    try {
      const res  = await fetch('/api/fetch-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
      setScreen('dashboard')
    } catch (e) {
      setError('Error: ' + e.message)
      setScreen('auth')
    }
  }, [token])

  if (screen === 'auth')      return <AuthScreen token={token} setToken={setToken} connect={connect} error={error} />
  if (screen === 'loading')   return <LoadScreen />
  if (screen === 'dashboard') return <Dashboard data={data} goal={goal} setGoal={setGoal} logout={() => { setData(null); setToken(''); setScreen('auth') }} />
  return null
}

function AuthScreen({ token, setToken, connect, error }) {
  return (
    <div style={s.authWrap}>
      <div style={s.authLogo}>TOPSTEP P&L</div>
      <h1 style={s.authTitle}>Lifetime Performance</h1>
      <p style={s.authSub}>Paste your bearer token from the Topstep dashboard.</p>
      <div style={s.authBox}>
        <label style={s.lbl}>Bearer Token</label>
        <input type="password" value={token} onChange={e => setToken(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && connect()}
          placeholder="eyJhbGciOi..." autoFocus style={s.inp} />
        <button onClick={connect} style={s.btn}>Connect →</button>
        {error && <div style={s.err}>{error}</div>}
        <div style={s.howTo}>
          <strong style={{ color: '#e8e8ea' }}>How to get your token:</strong><br />
          1. Go to <strong>dashboard.topstep.com</strong> → payouts page<br />
          2. Press <code style={s.code}>F12</code> → Network → Fetch/XHR → Refresh<br />
          3. Click any request → Request Headers<br />
          4. Copy everything after <code style={s.code}>Authorization: Bearer </code>
        </div>
      </div>
    </div>
  )
}

function LoadScreen() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0d0d0f' }}>
      <div style={s.spinner} />
      <div style={{ color:'#6b6b78', fontSize:14 }}>Fetching your data...</div>
    </div>
  )
}

// ── Monthly Chart ─────────────────────────────────────────────────────────────
function MonthlyChart({ purchases, payouts }) {
  // Build month buckets from all data
  const months = {}

  const addMonth = (dateStr, type, amount) => {
    const d   = new Date(dateStr)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const lbl = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    if (!months[key]) months[key] = { key, lbl, spent: 0, earned: 0 }
    if (type === 'spent')  months[key].spent  += amount
    if (type === 'earned') months[key].earned += amount
  }

  // purchases
  purchases.filter(p => parseFloat(p.total || 0) > 0).forEach(p => {
    addMonth(p.createdAt, 'spent', parseFloat(p.total))
  })

  // payouts (finalized only)
  payouts.filter(p => ['finalized','approved','paid','complete'].includes((p.status||'').toLowerCase()))
    .forEach(p => addMonth(p.createdAt, 'earned', parseFloat(p.amount || 0)))

  const sorted = Object.values(months).sort((a, b) => a.key.localeCompare(b.key))
  if (!sorted.length) return null

  const maxVal = Math.max(...sorted.map(m => Math.max(m.spent, m.earned)), 1)
  const barH   = 140

  return (
    <div style={s.chartWrap}>
      {/* Legend */}
      <div style={{ display:'flex', gap:20, marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:10, height:10, borderRadius:2, background:'#ff5a5a' }} />
          <span style={{ fontSize:11, color:'#6b6b78' }}>Expenses</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:10, height:10, borderRadius:2, background:'#22d87e' }} />
          <span style={{ fontSize:11, color:'#6b6b78' }}>Payouts</span>
        </div>
      </div>

      {/* Bars */}
      <div style={{ overflowX:'auto', paddingBottom:8 }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:6, minWidth: sorted.length * 52 }}>
          {sorted.map(m => {
            const spentH  = Math.round((m.spent  / maxVal) * barH)
            const earnedH = Math.round((m.earned / maxVal) * barH)
            const net     = m.earned - m.spent
            return (
              <div key={m.key} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:'0 0 46px' }}>
                {/* Tooltip on hover via title */}
                <div style={{ display:'flex', gap:3, alignItems:'flex-end', height: barH }}>
                  <div title={`Expenses: ${fmt(m.spent)}`}
                    style={{ width:18, height: spentH || 2, background:'#ff5a5a', borderRadius:'3px 3px 0 0', opacity:0.85, cursor:'default', minHeight:2 }} />
                  <div title={`Payouts: ${fmt(m.earned)}`}
                    style={{ width:18, height: earnedH || 2, background:'#22d87e', borderRadius:'3px 3px 0 0', opacity:0.85, cursor:'default', minHeight:2 }} />
                </div>
                <div style={{ fontSize:9, color:'#6b6b78', textAlign:'center', letterSpacing:'0.02em' }}>{m.lbl}</div>
                <div style={{ fontSize:9, fontFamily:'monospace', color:'#ff5a5a', textAlign:'center' }}>
                  {m.spent > 0 ? '-$'+m.spent.toFixed(0) : '—'}
                </div>
                <div style={{ fontSize:9, fontFamily:'monospace', color:'#22d87e', textAlign:'center' }}>
                  {m.earned > 0 ? '+$'+m.earned.toFixed(0) : '—'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Y axis hint */}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
        <span style={{ fontSize:10, color:'#3a3a42' }}>$0</span>
        <span style={{ fontSize:10, color:'#3a3a42' }}>{fmt(maxVal)}</span>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ data, goal, setGoal, logout }) {
  const { accounts = [], purchases = [], payouts = [] } = data

  const paid       = purchases.filter(p => parseFloat(p.total || 0) > 0)
  const totalSpent = paid.reduce((s, p) => s + parseFloat(p.total || 0), 0)
  const subCount   = paid.filter(p => (p.type||'').toLowerCase().includes('subscription')).length
  const resetCount = paid.filter(p => (p.type||'').toLowerCase().includes('reset')).length

  const finalized   = payouts.filter(p => ['finalized','approved','paid','complete'].includes((p.status||'').toLowerCase()))
  const totalEarned = finalized.reduce((s, p) => s + parseFloat(p.amount || 0), 0)
  const payoutCount = finalized.length
  const totalFees   = finalized.reduce((s, p) => s + Math.max(0, parseFloat(p.requestedAmount||0) - parseFloat(p.amount||0)), 0)
  const totalReq    = finalized.reduce((s, p) => s + parseFloat(p.requestedAmount||p.amount||0), 0)

  const net   = totalEarned - totalSpent
  const roi   = totalSpent > 0 ? ((net / totalSpent) * 100).toFixed(1) : null
  const bePct = totalSpent > 0 ? Math.min(100, (totalEarned / totalSpent) * 100) : 0
  const goalN = parseFloat(goal) || 0
  const goalPct = goalN > 0 ? Math.min(100, (Math.max(0, net) / goalN) * 100) : 0
  const date  = new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.hdr}>
        <div>
          <div style={s.hdrTitle}>Topstep P&L</div>
          <div style={s.hdrSub}>Lifetime Performance</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={s.hdrDate}>{date}</div>
          <button onClick={logout} style={s.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Hero */}
      <div style={s.hero}>
        <div style={{ ...s.heroNum, color: net >= 0 ? '#22d87e' : '#ff5a5a' }}>{fmtS(net)}</div>
        <div style={{ ...s.heroLbl, color: net >= 0 ? '#22d87e' : '#ff5a5a' }}>{net >= 0 ? 'PROFITABLE' : 'NET LOSS'}</div>
      </div>

      {/* Cards */}
      <div style={s.cards}>
        <div style={{ ...s.card, background:'#1a0a0a' }}>
          <div style={s.cardLbl}>Total Spent</div>
          <div style={{ ...s.cardVal, color:'#ff5a5a' }}>{fmt(totalSpent)}</div>
          <div style={s.cardDet}>{subCount} evals · {resetCount} resets</div>
        </div>
        <div style={{ ...s.card, background:'#061410' }}>
          <div style={s.cardLbl}>Total Earned</div>
          <div style={{ ...s.cardVal, color:'#22d87e' }}>{fmt(totalEarned)}</div>
          <div style={s.cardDet}>{payoutCount} payouts</div>
        </div>
        <div style={{ ...s.card, background:'#141008' }}>
          <div style={s.cardLbl}>Payout Fees</div>
          <div style={{ ...s.cardVal, color:'#f0a830' }}>{totalFees > 0 ? fmt(totalFees) : '—'}</div>
          <div style={s.cardDet}>{totalReq > 0 ? fmt(totalReq) + ' requested' : 'no data'}</div>
        </div>
      </div>

      {roi && <div style={s.roi}>ROI: <span style={{ color: net >= 0 ? '#22d87e' : '#ff5a5a', fontFamily:'monospace', fontWeight:700 }}>{net >= 0 ? '+' : ''}{roi}%</span></div>}

      {/* Monthly Chart */}
      <Section title="Monthly P&L">
        <MonthlyChart purchases={purchases} payouts={payouts} />
      </Section>

      {/* Progress */}
      <Section title="Progress">
        <div style={s.progBlock}>
          <div style={s.progHdr}>
            <span style={s.progLabel}>Breakeven</span>
            <span style={s.progVals}>{fmt(totalEarned)} / {fmt(totalSpent)}</span>
          </div>
          <div style={s.progTrack}>
            <div style={{ ...s.progBar, width: bePct.toFixed(1)+'%', background: bePct >= 100 ? 'linear-gradient(90deg,#22d87e,#4aeaa0)' : 'linear-gradient(90deg,#ff5a5a,#ff8a6a)' }} />
          </div>
          <div style={s.progSub}>
            {bePct >= 100 ? `Breakeven reached! ${fmt(totalEarned - totalSpent)} profit`
              : `${fmt(totalSpent - totalEarned)} more needed (${bePct.toFixed(1)}%)`}
          </div>
        </div>

        <div style={{ ...s.progBlock, marginTop:16 }}>
          <div style={s.progHdr}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={s.progLabel}>My Goal</span>
              <div style={s.goalWrap}>
                <span style={{ color:'#6b6b78', fontSize:12 }}>$</span>
                <input type="number" value={goal} onChange={e => setGoal(e.target.value)}
                  placeholder="e.g. 10000" style={s.goalInp} />
              </div>
            </div>
            <span style={s.progVals}>{net >= 0 ? fmt(net) : '-'+fmt(Math.abs(net))} / {goalN > 0 ? fmt(goalN) : '—'}</span>
          </div>
          <div style={s.progTrack}>
            <div style={{ ...s.progBar, width: goalPct.toFixed(1)+'%', background:'linear-gradient(90deg,#22d87e,#4aeaa0)' }} />
          </div>
          <div style={s.progSub}>
            {goalN <= 0 ? 'Enter a profit goal above'
              : goalPct >= 100 ? `Goal reached! ${fmt(net - goalN)} above target`
              : net < 0 ? `Currently ${fmt(Math.abs(net))} in the red — need ${fmt(goalN + Math.abs(net))} more in payouts`
              : `${fmt(goalN - net)} more to go (${goalPct.toFixed(1)}%)`}
          </div>
        </div>
      </Section>

      {/* Payout History */}
      <Section title="Payout History">
        {payouts.length === 0
          ? <div style={{ color:'#6b6b78', padding:'16px 0', fontSize:13 }}>No payout history found.</div>
          : [...payouts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(p => {
              const net = parseFloat(p.amount || 0)
              const req = parseFloat(p.requestedAmount || p.amount || 0)
              const fee = Math.max(0, req - net)
              const fin = ['finalized','approved','paid','complete'].includes((p.status||'').toLowerCase())
              const date = new Date(p.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
              return (
                <div key={p.id} style={s.payRow}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={s.payId}>Payout #{p.id}</span>
                      <span style={{ ...s.badge, ...(fin ? s.badgeGreen : s.badgeGold) }}>{p.status || 'Pending'}</span>
                    </div>
                    <div style={s.payDate}>{date} · {(p.method||'').toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'monospace', fontSize:14, fontWeight:700, color:'#22d87e' }}>{fmt(net)}</div>
                    <div style={{ fontSize:11, color:'#6b6b78', marginTop:2 }}>{fmt(req)} requested{fee > 0 ? ` · $${fee.toFixed(2)} fee` : ''}</div>
                  </div>
                </div>
              )
            })}
      </Section>

      {/* Accounts */}
      <Section title="Accounts">
        {[...accounts]
          .sort((a, b) => { if (a.active && !b.active) return -1; if (!a.active && b.active) return 1; return parseFloat(b.balance||0) - parseFloat(a.balance||0) })
          .map(acc => {
            const bal   = parseFloat(acc.balance || 0)
            const stage = (acc.stage || '').replace(/-/g, ' ')
            const badgeSt = acc.active ? (stage.includes('funded') ? s.badgeGold : s.badgeGreen) : s.badgeGray
            return (
              <div key={acc.id} style={s.accRow}>
                <div>
                  <div style={{ display:'flex', alignItems:'center' }}>
                    <span style={s.accName}>{acc.platformAccount || acc.templateName || 'Account'}</span>
                    <span style={{ ...s.badge, ...badgeSt }}>{acc.active ? (stage || 'Active') : 'Inactive'}</span>
                  </div>
                  <div style={s.accMeta}>{acc.templateName}{acc.startingBalance ? ` · $${Number(acc.startingBalance).toLocaleString()} account` : ''}</div>
                </div>
                <span style={{ fontFamily:'monospace', fontSize:14, fontWeight:700, color: bal >= 0 ? '#22d87e' : '#ff5a5a' }}>{fmt(bal)}</span>
              </div>
            )
          })}
      </Section>

      <div style={s.watermark}>topstep-pnl</div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <div style={s.secTitle}>{title}</div>
      {children}
    </div>
  )
}

const s = {
  authWrap:  { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0d0d0f', padding:'40px 24px', textAlign:'center' },
  authLogo:  { fontFamily:'monospace', fontSize:12, letterSpacing:'0.2em', color:'#6b6b78', marginBottom:28 },
  authTitle: { fontSize:30, fontWeight:600, color:'#e8e8ea', marginBottom:8, letterSpacing:'-0.5px' },
  authSub:   { fontSize:14, color:'#6b6b78', marginBottom:36, lineHeight:1.7, maxWidth:420 },
  authBox:   { background:'#141418', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:32, width:'100%', maxWidth:460, textAlign:'left' },
  lbl:       { display:'block', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'#6b6b78', marginBottom:8, fontWeight:500 },
  inp:       { width:'100%', background:'#1a1a20', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#e8e8ea', fontFamily:'monospace', fontSize:12, padding:'12px 14px', outline:'none', marginBottom:16, boxSizing:'border-box' },
  btn:       { width:'100%', background:'#22d87e', color:'#050f09', border:'none', borderRadius:8, fontSize:14, fontWeight:700, padding:13, cursor:'pointer' },
  err:       { color:'#ff5a5a', fontSize:13, marginTop:14, background:'rgba(255,90,90,0.07)', border:'1px solid rgba(255,90,90,0.2)', borderRadius:8, padding:'10px 14px' },
  howTo:     { marginTop:20, fontSize:12, color:'#6b6b78', lineHeight:1.9, padding:14, border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, background:'#1a1a20' },
  code:      { fontFamily:'monospace', fontSize:11, color:'#22d87e', background:'rgba(34,216,126,0.08)', padding:'1px 5px', borderRadius:3 },
  spinner:   { width:30, height:30, border:'2px solid rgba(255,255,255,0.08)', borderTopColor:'#22d87e', borderRadius:'50%', animation:'spin 0.65s linear infinite', marginBottom:18 },
  page:      { maxWidth:880, margin:'0 auto', padding:'40px 24px 80px', background:'#0d0d0f', minHeight:'100vh' },
  hdr:       { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:52 },
  hdrTitle:  { fontSize:15, fontWeight:600, color:'#e8e8ea' },
  hdrSub:    { fontSize:13, color:'#6b6b78', marginTop:3 },
  hdrDate:   { fontSize:13, color:'#6b6b78' },
  logoutBtn: { background:'none', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, color:'#6b6b78', fontSize:12, padding:'5px 11px', cursor:'pointer' },
  hero:      { textAlign:'center', marginBottom:52 },
  heroNum:   { fontFamily:'monospace', fontSize:'clamp(54px,10vw,82px)', fontWeight:700, letterSpacing:'-3px', lineHeight:1, marginBottom:12 },
  heroLbl:   { fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', fontWeight:600 },
  cards:     { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 },
  card:      { borderRadius:14, padding:22, border:'1px solid rgba(255,255,255,0.08)' },
  cardLbl:   { fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6b6b78', fontWeight:500, marginBottom:12 },
  cardVal:   { fontFamily:'monospace', fontSize:28, fontWeight:700, lineHeight:1, marginBottom:8 },
  cardDet:   { fontSize:12, color:'#6b6b78' },
  roi:       { textAlign:'center', marginTop:6, fontSize:14, color:'#6b6b78' },
  section:   { marginTop:50 },
  secTitle:  { fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'#6b6b78', fontWeight:500, marginBottom:14, paddingBottom:10, borderBottom:'1px solid rgba(255,255,255,0.08)' },
  chartWrap: { background:'#141418', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'20px 20px 12px' },
  progBlock: { background:'#141418', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'18px 20px' },
  progHdr:   { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  progLabel: { fontSize:12, fontWeight:600, color:'#e8e8ea', letterSpacing:'0.04em' },
  progVals:  { fontFamily:'monospace', fontSize:12, color:'#6b6b78' },
  progTrack: { background:'rgba(255,255,255,0.06)', borderRadius:100, height:8, overflow:'hidden' },
  progBar:   { height:'100%', borderRadius:100, transition:'width 0.6s ease' },
  progSub:   { fontSize:12, color:'#6b6b78', marginTop:8 },
  goalWrap:  { display:'flex', alignItems:'center', gap:4, background:'#1a1a20', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'3px 8px' },
  goalInp:   { background:'none', border:'none', outline:'none', color:'#e8e8ea', fontFamily:'monospace', fontSize:12, width:90 },
  payRow:    { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 0', borderBottom:'1px solid rgba(255,255,255,0.08)' },
  payId:     { fontFamily:'monospace', fontSize:12, color:'#6b6b78' },
  payDate:   { fontSize:11, color:'#6b6b78', marginTop:2 },
  accRow:    { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 0', borderBottom:'1px solid rgba(255,255,255,0.08)' },
  accName:   { fontFamily:'monospace', fontSize:12, color:'#e8e8ea' },
  accMeta:   { fontSize:11, color:'#6b6b78', marginTop:3 },
  badge:     { fontSize:10, padding:'3px 9px', borderRadius:100, fontWeight:600, textTransform:'uppercase', marginLeft:8 },
  badgeGreen:{ background:'rgba(34,216,126,0.14)', color:'#22d87e' },
  badgeGold: { background:'rgba(240,168,48,0.14)', color:'#f0a830' },
  badgeGray: { background:'rgba(107,107,120,0.18)', color:'#6b6b78' },
  watermark: { textAlign:'center', color:'#252528', fontSize:11, marginTop:64, letterSpacing:'0.05em' },
}
