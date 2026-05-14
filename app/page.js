'use client'
import { useState, useCallback, useEffect } from 'react'

const fmt  = n => '$' + Math.abs(+n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtS = n => (+n >= 0 ? '+$' : '-$') + Math.abs(+n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ── Static data (Apex + MFFU — no API needed) ─────────────────────────────────
const DEFAULT_APEX = [
  {id:"2YAV5N3",  createdAt:"2026-05-11", total:34.90,  type:"Eval",          account:"APEX-347903-11"},
  {id:"KF9VEUG",  createdAt:"2026-01-29", total:75.00,  type:"PA Activation", account:"PA-APEX-347903-03"},
  {id:"WA5V2SX",  createdAt:"2026-01-28", total:19.70,  type:"Eval",          account:"APEX-347903-10"},
  {id:"UDAL5MT",  createdAt:"2026-01-28", total:19.70,  type:"Eval",          account:"APEX-347903-09"},
  {id:"NU9Y639",  createdAt:"2026-01-28", total:19.70,  type:"Eval",          account:"APEX-347903-08"},
  {id:"DV4ND",    createdAt:"2025-09-02", total:85.00,  type:"PA Activation", account:"PA-APEX-347903-02"},
  {id:"ZX558",    createdAt:"2025-09-02", total:18.70,  type:"Eval",          account:"APEX-347903-07"},
  {id:"M88GH",    createdAt:"2025-08-29", total:18.70,  type:"Eval",          account:"APEX-347903-06"},
  {id:"VTRHY",    createdAt:"2025-08-29", total:18.70,  type:"Eval",          account:"APEX-347903-05"},
  {id:"2RWC4",    createdAt:"2025-06-18", total:33.40,  type:"Eval",          account:"APEX-347903-04"},
  {id:"7MJJV",    createdAt:"2025-06-11", total:140.00, type:"PA Activation", account:"PA-APEX-347903-01"},
  {id:"UZ6YN",    createdAt:"2025-06-10", total:33.40,  type:"Eval",          account:"APEX-347903-03"},
  {id:"WH4AS",    createdAt:"2025-05-28", total:16.70,  type:"Eval",          account:"APEX-347903-02"},
  {id:"6MGBG",    createdAt:"2025-05-28", total:16.70,  type:"Eval",          account:"APEX-347903-01"},
]

const DEFAULT_MFFU = [
  {id:"ORD-tUncIkiVXs", createdAt:"2025-11-21", total:127,    type:"Scale50KFlex"},
  {id:"ORD-YHJVJhwyDr", createdAt:"2025-08-07", total:127,    type:"StarterPlus50K Reset"},
  {id:"ORD-sXlYDhrUZD", createdAt:"2025-08-07", total:127,    type:"StarterPlus50K Reset"},
  {id:"ORD-UyUSNuNJsj", createdAt:"2025-08-07", total:127,    type:"StarterPlus50K Reset"},
  {id:"ORD-nQydujaWUK", createdAt:"2025-08-05", total:127,    type:"StarterPlus50K Reset"},
  {id:"ORD-mouHshaNWc", createdAt:"2025-08-05", total:127,    type:"StarterPlus50K Reset"},
  {id:"ORD-kztUkqWJvL", createdAt:"2025-08-04", total:77,     type:"Core30dLive Account"},
  {id:"ORD-HQKOrdHKbC", createdAt:"2025-07-29", total:107.95, type:"StarterPlus50K Reset"},
  {id:"ORD-ITmZCvfonN", createdAt:"2025-07-27", total:119.38, type:"StarterPlus50K Renewal"},
  {id:"ORD-VpylVyDEns", createdAt:"2025-07-23", total:65.45,  type:"Core30dLive Account"},
  {id:"ORD-CoBKSPVNiw", createdAt:"2025-07-23", total:107.95, type:"Scale50K30dLive Account"},
  {id:"ORD-FrgZetIpNx", createdAt:"2025-07-18", total:107.95, type:"StarterPlus50K Reset"},
  {id:"ORD-tWiViLXklr", createdAt:"2025-07-17", total:107.95, type:"StarterPlus50K Reset"},
  {id:"ORD-ALbATlEWzQ", createdAt:"2025-07-08", total:63.5,   type:"StarterPlus50K Account"},
  {id:"ORD-pzwgYxzAZB", createdAt:"2025-07-03", total:107.95, type:"StarterPlus50K Reset"},
  {id:"ORD-zdidbMhKuq", createdAt:"2025-07-01", total:107.95, type:"StarterPlus50K Reset"},
  {id:"ORD-CoPaAxtZwV", createdAt:"2025-06-27", total:119.38, type:"StarterPlus50K Account"},
  {id:"ORD-MRWsdHEMub", createdAt:"2025-06-25", total:119.38, type:"StarterPlus50K Account"},
  {id:"ORD-nuaRWjSxsx", createdAt:"2025-06-21", total:119.38, type:"StarterPlus50K Account"},
  {id:"ORD-znoKAPTZtF", createdAt:"2025-06-16", total:119.38, type:"StarterPlus50K Account"},
  {id:"ORD-iVHdYjgDGf", createdAt:"2025-06-12", total:127,    type:"StarterPlus50K Account"},
  {id:"ORD-amxbOdlETD", createdAt:"2025-06-12", total:95.25,  type:"StarterPlus50K Account"},
  {id:"ORD-edAIhMKnjE", createdAt:"2025-06-10", total:95.25,  type:"StarterPlus50K Reset"},
  {id:"ORD-dyCLUSUYcr", createdAt:"2025-06-10", total:95.25,  type:"StarterPlus50K Reset"},
  {id:"ORD-lEOFCMPIPQ", createdAt:"2025-06-04", total:101.6,  type:"StarterPlus50K Reset"},
  {id:"ORD-wwGfNnCTTB", createdAt:"2025-05-23", total:63.5,   type:"StarterPlus50K Account"},
]

const DEFAULT_ALPHA = [
  {id:"ACGFUTR-31790-1756217459", createdAt:"2025-08-26", total:89.1,  type:"Eval",  account:"202508261562"},
  {id:"ACGFUTR-31790-1756527599", createdAt:"2025-08-30", total:71.1,  type:"Reset", account:"202508261562"},
  {id:"ACGFUTR-31790-1756823325", createdAt:"2025-09-02", total:74.25, type:"Eval",  account:"202509022542"},
  {id:"ACGFUTR-31790-1756825663", createdAt:"2025-09-02", total:59.25, type:"Reset", account:"202509022542"},
  {id:"ACGFUTR-31790-1757593796", createdAt:"2025-09-11", total:89.1,  type:"Eval",  account:"202509111182"},
  {id:"ACGFUTR-31790-1758791316", createdAt:"2025-09-25", total:71.1,  type:"Reset", account:"2025083048"},
  {id:"ACGFUTR-31790-1759193294", createdAt:"2025-09-30", total:125.1, type:"Eval",  account:"20250930100"},
  {id:"ACGFUTR-31790-1759838177", createdAt:"2025-10-07", total:74.25, type:"Eval",  account:"202510071127"},
  {id:"ACGFUTR-31790-1759971791", createdAt:"2025-10-09", total:59.25, type:"Reset", account:"202510071127"},
  {id:"ACGFUTR-31790-1759972003", createdAt:"2025-10-09", total:59.25, type:"Reset", account:"20251009177"},
  {id:"ACGFUTR-31790-1759972315", createdAt:"2025-10-09", total:59.25, type:"Reset", account:"20251009194"},
  {id:"ACGFUTR-31790-1760102486", createdAt:"2025-10-10", total:59.25, type:"Reset", account:"20251009212"},
  {id:"ACGFUTR-31790-1760108725", createdAt:"2025-10-10", total:74.25, type:"Eval",  account:"202510103168"},
  {id:"ACGFUTR-31790-1760109713", createdAt:"2025-10-10", total:59.25, type:"Reset", account:"202510103168"},
  {id:"ACGFUTR-31790-1760111183", createdAt:"2025-10-10", total:59.25, type:"Reset", account:"202510103549"},
  {id:"ACGFUTR-31790-1761224372", createdAt:"2025-10-23", total:69.3,  type:"Eval",  account:"202510233075"},
  {id:"ACGFUTR-31790-1761226499", createdAt:"2025-10-23", total:55.3,  type:"Reset", account:"202510233075"},
  {id:"ACGFUTR-31790-1761912329", createdAt:"2025-10-31", total:59.25, type:"Reset", account:"202510233598"},
  {id:"ACGFUTR-31790-1763134343", createdAt:"2025-11-14", total:71.1,  type:"Reset", account:"202510312026"},
  {id:"ACGFUTR-31790-1764606139", createdAt:"2025-12-01", total:69.3,  type:"Eval",  account:"202512015385"},
  {id:"ACGFUTR-31790-1764689847", createdAt:"2025-12-02", total:69.3,  type:"Eval",  account:"202512024914"},
  {id:"ACGFUTR-31790-1766499530", createdAt:"2025-12-23", total:59.4,  type:"Eval",  account:"202512235374"},
  {id:"ACGFUTR-31790-1766757231", createdAt:"2025-12-26", total:59.4,  type:"Eval",  account:"202512265256"},
  {id:"ACGFUTR-31790-1773236021", createdAt:"2026-03-11", total:89.25, type:"Eval",  account:"202603117189"},
]
// Alpha total: $1,684.60 · 24 purchases

const FIRM_NAMES  = { topstep:'Topstep', apex:'Apex', alpha:'Alpha Futures', mffu:'MFFU' }
const FIRM_COLORS = { topstep:'#22d87e', apex:'#4a9eff', alpha:'#a78bfa', mffu:'#f0a830' }

export default function Home() {
  const [screen, setScreen] = useState('auth')
  const [token, setToken]   = useState('')
  const [error, setError]   = useState('')
  const [tsData, setTsData] = useState(null)
  const [goal, setGoal]     = useState('')

  const connect = useCallback(async () => {
    if (!token.trim()) { setError('Paste your Topstep bearer token.'); return }
    setError(''); setScreen('loading')
    try {
      const res  = await fetch('/api/fetch-all', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token }) })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setTsData(json); setScreen('dashboard')
    } catch(e) { setError('Error: '+e.message); setScreen('auth') }
  }, [token])

  if (screen === 'loading') return <LoadScreen />
  if (screen === 'dashboard') return <Dashboard tsData={tsData} goal={goal} setGoal={setGoal} logout={() => { setTsData(null); setToken(''); setScreen('auth') }} />

  return (
    <div style={s.authWrap}>
      <div style={s.authLogo}>PROP FIRM P&L</div>
      <h1 style={s.authTitle}>Lifetime Performance</h1>
      <p style={s.authSub}>Connect your Topstep account. Apex and MFFU data is already loaded.</p>
      <div style={s.authBox}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'#22d87e'}} />
          <span style={{fontSize:13,fontWeight:600,color:'#e8e8ea'}}>Topstep</span>
        </div>
        <label style={s.lbl}>Bearer Token</label>
        <input type="password" value={token} onChange={e=>setToken(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&connect()}
          placeholder="eyJhbGciOi..." autoFocus style={s.inp} />

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
          {[['apex','Apex','$550.30 · 14 purchases'],['alpha','Alpha Futures','$1,684.60 · 24 purchases'],['mffu','MFFU','$2,790.40 · 26 purchases']].map(([f,name,note])=>(
            <div key={f} style={{background:'#1a1a20',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'10px 12px'}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:FIRM_COLORS[f]}} />
                <span style={{fontSize:12,fontWeight:600,color:'#e8e8ea'}}>{name}</span>
                <span style={{fontSize:10,color:'#22d87e',marginLeft:'auto'}}>✓ loaded</span>
              </div>
              <div style={{fontSize:10,color:'#6b6b78'}}>{note}</div>
            </div>
          ))}
        </div>

        <button onClick={connect} style={s.btn}>Connect →</button>
        {error && <div style={s.err}>{error}</div>}
        <div style={s.howTo}>
          <strong style={{color:'#e8e8ea'}}>Get Topstep token:</strong> dashboard.topstep.com → payouts → F12 → Network → any request → Authorization header
        </div>
      </div>
    </div>
  )
}

function LoadScreen() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#0d0d0f'}}>
      <div style={s.spinner} /><div style={{color:'#6b6b78',fontSize:14}}>Fetching Topstep data...</div>
    </div>
  )
}

function firmStats(purchases, payouts) {
  const paid     = (purchases||[]).filter(p => parseFloat(p.total||0) > 0)
  const spent    = paid.reduce((s,p) => s + parseFloat(p.total||0), 0)
  const fin      = (payouts||[]).filter(p => ['finalized','approved','paid','complete'].includes((p.status||'').toLowerCase()))
  const earned   = fin.reduce((s,p) => s + parseFloat(p.amount||0), 0)
  const fees     = fin.reduce((s,p) => s + Math.max(0, parseFloat(p.requestedAmount||0)-parseFloat(p.amount||0)), 0)
  const subCount = paid.filter(p=>(p.type||'').toLowerCase().includes('subscription')).length
  const rstCount = paid.filter(p=>(p.type||'').toLowerCase().includes('reset')).length
  return { spent, earned, fees, purchases:paid, payouts:fin, subCount, rstCount }
}

function MonthlyChart({ allPurchases, allPayouts }) {
  const months = {}
  const addM = (dateStr, type, amount) => {
    if (!dateStr) return
    const d = new Date(dateStr)
    if (isNaN(d)) return
    const key = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')
    const lbl = d.toLocaleDateString('en-US',{month:'short',year:'2-digit'})
    if (!months[key]) months[key] = {key,lbl,spent:0,earned:0}
    if (type==='spent')  months[key].spent  += amount
    if (type==='earned') months[key].earned += amount
  }
  allPurchases.filter(p=>parseFloat(p.total||0)>0).forEach(p => addM(p.createdAt,'spent',parseFloat(p.total||0)))
  allPayouts.filter(p=>['finalized','approved','paid','complete'].includes((p.status||'').toLowerCase()))
    .forEach(p => addM(p.createdAt,'earned',parseFloat(p.amount||0)))

  const sorted = Object.values(months).sort((a,b)=>a.key.localeCompare(b.key))
  if (!sorted.length) return <div style={{color:'#6b6b78',fontSize:13}}>No data.</div>
  const maxVal = Math.max(...sorted.map(m=>Math.max(m.spent,m.earned)),1)
  const BAR_H  = 140

  return (
    <div style={s.chartWrap}>
      <div style={{display:'flex',gap:20,marginBottom:16}}>
        {[['#ff5a5a','Expenses'],['#22d87e','Payouts']].map(([c,l])=>(
          <div key={l} style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:10,height:10,borderRadius:2,background:c}} />
            <span style={{fontSize:11,color:'#6b6b78'}}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{overflowX:'auto',paddingBottom:8}}>
        <div style={{display:'flex',alignItems:'flex-end',gap:6,minWidth:sorted.length*52+64}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',flexShrink:0,width:56}}>
            <div style={{height:BAR_H}} />
            <div style={{fontSize:9,color:'#6b6b78',fontFamily:'monospace',height:16,display:'flex',alignItems:'center'}}>month</div>
            <div style={{fontSize:9,color:'#ff5a5a',fontFamily:'monospace',height:16,display:'flex',alignItems:'center'}}>expenses</div>
            <div style={{fontSize:9,color:'#22d87e',fontFamily:'monospace',height:16,display:'flex',alignItems:'center'}}>payouts</div>
            <div style={{fontSize:9,color:'#6b6b78',fontFamily:'monospace',height:17,display:'flex',alignItems:'center',borderTop:'1px solid rgba(255,255,255,0.08)',width:'100%',justifyContent:'flex-end'}}>net</div>
          </div>
          {sorted.map(m => {
            const sH=Math.max(2,Math.round((m.spent/maxVal)*BAR_H))
            const eH=Math.max(2,Math.round((m.earned/maxVal)*BAR_H))
            const net=m.earned-m.spent
            return (
              <div key={m.key} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:0,flex:'0 0 46px'}}>
                <div style={{display:'flex',gap:3,alignItems:'flex-end',height:BAR_H}}>
                  <div title={'Expenses: '+fmt(m.spent)} style={{width:18,height:sH,background:'#ff5a5a',borderRadius:'3px 3px 0 0',opacity:.85,minHeight:2}} />
                  <div title={'Payouts: '+fmt(m.earned)} style={{width:18,height:eH,background:'#22d87e',borderRadius:'3px 3px 0 0',opacity:.85,minHeight:2}} />
                </div>
                <div style={{fontSize:9,color:'#6b6b78',height:16,display:'flex',alignItems:'center'}}>{m.lbl}</div>
                <div style={{fontSize:9,fontFamily:'monospace',color:'#ff5a5a',height:16,display:'flex',alignItems:'center'}}>{m.spent>0?'-$'+m.spent.toFixed(0):'—'}</div>
                <div style={{fontSize:9,fontFamily:'monospace',color:'#22d87e',height:16,display:'flex',alignItems:'center'}}>{m.earned>0?'+$'+m.earned.toFixed(0):'—'}</div>
                <div style={{fontSize:9,fontFamily:'monospace',color:net>=0?'#22d87e':'#ff5a5a',height:17,display:'flex',alignItems:'center',borderTop:'1px solid rgba(255,255,255,0.08)',width:'100%',justifyContent:'center'}}>
                  {net===0?'—':(net>0?'+':'-')+'$'+Math.abs(net).toFixed(0)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Dashboard({ tsData, goal, setGoal, logout }) {
  const date  = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})
  const goalN = parseFloat(goal)||0
  const [showEdit, setShowEdit] = useState(false)
  const [editData, setEditData] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' && localStorage.getItem('firmOverrides')
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      apex:  { spent: DEFAULT_APEX.reduce((s,p)=>s+p.total,0).toFixed(2),  payouts: '0', count: DEFAULT_APEX.length },
      alpha: { spent: DEFAULT_ALPHA.reduce((s,p)=>s+p.total,0).toFixed(2), payouts: '0', count: DEFAULT_ALPHA.length },
      mffu:  { spent: DEFAULT_MFFU.reduce((s,p)=>s+p.total,0).toFixed(2),  payouts: '0', count: DEFAULT_MFFU.length },
    }
  })

  const saveEdit = (firm, field, val) => {
    const updated = { ...editData, [firm]: { ...editData[firm], [field]: val } }
    setEditData(updated)
    try { localStorage.setItem('firmOverrides', JSON.stringify(updated)) } catch {}
  }

  // Use override values instead of hardcoded arrays
  const makeFirmStats = (key) => {
    const d = editData[key]
    const spent  = parseFloat(d.spent  || 0)
    const earned = parseFloat(d.payouts || 0)
    const count  = parseInt(d.count || 0)
    return {
      spent, earned, fees: 0,
      purchases: Array.from({length: count}, (_,i) => ({ total: spent/Math.max(count,1), createdAt: null })),
      payouts: earned > 0 ? [{amount: earned, requestedAmount: earned, status:'finalized', createdAt: null}] : [],
      subCount: 0, rstCount: 0,
    }
  }

  const ts    = firmStats(tsData?.purchases||[], tsData?.payouts||[])
  const apex  = makeFirmStats('apex')
  const alpha = makeFirmStats('alpha')
  const mffu  = makeFirmStats('mffu')

  const totSpent  = ts.spent + apex.spent + alpha.spent + mffu.spent
  const totEarned = ts.earned + apex.earned + alpha.earned + mffu.earned
  const totFees   = ts.fees
  const net       = totEarned - totSpent
  const roi       = totSpent > 0 ? ((net/totSpent)*100).toFixed(1) : null
  const bePct     = totSpent > 0 ? Math.min(100,(totEarned/totSpent)*100) : 0
  const goalPct   = goalN > 0 ? Math.min(100,(Math.max(0,net)/goalN)*100) : 0

  // All purchases and payouts combined for chart
  // build synthetic monthly purchases from override totals for chart
  const makeSyntheticPurchases = (key, label) => {
    const d = editData[key]
    const spent = parseFloat(d.spent||0)
    if (spent <= 0) return []
    // spread evenly or use defaults if available
    const defaults = key==='apex' ? DEFAULT_APEX : key==='alpha' ? DEFAULT_ALPHA : DEFAULT_MFFU
    const scale = spent / Math.max(defaults.reduce((s,p)=>s+p.total,0), 0.01)
    return defaults.map(p => ({...p, total: p.total * scale}))
  }
  const allPurchases = [
    ...(tsData?.purchases||[]),
    ...makeSyntheticPurchases('apex'),
    ...makeSyntheticPurchases('alpha'),
    ...makeSyntheticPurchases('mffu'),
  ]
  const allPayouts   = [...(tsData?.payouts||[])]

  const firms = [
    { key:'topstep', name:'Topstep',       color:'#22d87e', st:ts,    note:`${ts.subCount} evals · ${ts.rstCount} resets` },
    { key:'apex',    name:'Apex',          color:'#4a9eff', st:apex,  note:`${apex.purchases.length} purchases`, static:true },
    { key:'alpha',   name:'Alpha Futures', color:'#a78bfa', st:alpha, note:`${alpha.purchases.length} purchases`, static:true },
    { key:'mffu',    name:'MFFU',          color:'#f0a830', st:mffu,  note:`${mffu.purchases.length} purchases`, static:true },
  ]

  return (
    <div style={s.page}>
      <div style={s.hdr}>
        <div><div style={s.hdrTitle}>Prop Firm P&L</div><div style={s.hdrSub}>Lifetime · All Firms</div></div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={s.hdrDate}>{date}</div>
          <button onClick={logout} style={s.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={s.hero}>
        <div style={{...s.heroNum,color:net>=0?'#22d87e':'#ff5a5a'}}>{fmtS(net)}</div>
        <div style={{...s.heroLbl,color:net>=0?'#22d87e':'#ff5a5a'}}>{net>=0?'PROFITABLE':'NET LOSS'}</div>
      </div>

      <div style={s.cards}>
        <div style={{...s.card,background:'#1a0a0a'}}><div style={s.cardLbl}>Total Spent</div><div style={{...s.cardVal,color:'#ff5a5a'}}>{fmt(totSpent)}</div><div style={s.cardDet}>all firms combined</div></div>
        <div style={{...s.card,background:'#061410'}}><div style={s.cardLbl}>Total Earned</div><div style={{...s.cardVal,color:'#22d87e'}}>{fmt(totEarned)}</div><div style={s.cardDet}>all payouts combined</div></div>
        <div style={{...s.card,background:'#141008'}}><div style={s.cardLbl}>Payout Fees</div><div style={{...s.cardVal,color:'#f0a830'}}>{totFees>0?fmt(totFees):'—'}</div><div style={s.cardDet}>processing fees</div></div>
      </div>

      {roi && <div style={s.roi}>ROI: <span style={{color:net>=0?'#22d87e':'#ff5a5a',fontFamily:'monospace',fontWeight:700}}>{net>=0?'+':''}{roi}%</span></div>}

      {/* Edit panel */}
      <div style={{marginTop:12,textAlign:'center'}}>
        <button onClick={()=>setShowEdit(v=>!v)} style={{background:'none',border:'1px solid rgba(255,255,255,0.08)',borderRadius:6,color:'#6b6b78',fontSize:12,padding:'5px 14px',cursor:'pointer'}}>
          {showEdit ? '↑ Hide Editor' : '✏ Edit Firm Data'}
        </button>
      </div>

      {showEdit && (
        <div style={{marginTop:16,background:'#141418',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:20}}>
          <div style={{fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'#6b6b78',fontWeight:500,marginBottom:16}}>Edit Static Firm Data</div>
          {[['apex','Apex','#4a9eff'],['alpha','Alpha Futures','#a78bfa'],['mffu','MFFU','#f0a830']].map(([key,name,color])=>(
            <div key={key} style={{marginBottom:16,paddingBottom:16,borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
                <div style={{width:7,height:7,borderRadius:'50%',background:color}}/>
                <span style={{fontSize:13,fontWeight:600,color:'#e8e8ea'}}>{name}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                <div>
                  <label style={{...s.lbl,marginBottom:4}}>Total Spent ($)</label>
                  <input type="number" value={editData[key].spent}
                    onChange={e=>saveEdit(key,'spent',e.target.value)}
                    style={{...s.inp,marginBottom:0,padding:'8px 10px',fontSize:12}} />
                </div>
                <div>
                  <label style={{...s.lbl,marginBottom:4}}>Total Payouts ($)</label>
                  <input type="number" value={editData[key].payouts}
                    onChange={e=>saveEdit(key,'payouts',e.target.value)}
                    style={{...s.inp,marginBottom:0,padding:'8px 10px',fontSize:12}} />
                </div>
                <div>
                  <label style={{...s.lbl,marginBottom:4}}># Purchases</label>
                  <input type="number" value={editData[key].count}
                    onChange={e=>saveEdit(key,'count',e.target.value)}
                    style={{...s.inp,marginBottom:0,padding:'8px 10px',fontSize:12}} />
                </div>
              </div>
            </div>
          ))}
          <div style={{fontSize:11,color:'#6b6b78'}}>Changes save automatically to your browser. Numbers update the totals and chart in real time.</div>
        </div>
      )}

      <Section title="By Firm">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {firms.map(({key,name,color,st,note,static:isStatic}) => {
            const n = st.earned - st.spent
            return (
              <div key={key} style={{...s.card,background:'#141418'}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:color}} />
                  <span style={{fontSize:12,fontWeight:600,color:'#e8e8ea'}}>{name}</span>
                  {isStatic && <span style={{fontSize:9,color:'#6b6b78',marginLeft:'auto'}}>manual</span>}
                </div>
                <div style={{fontFamily:'monospace',fontSize:20,fontWeight:700,color:n>=0?'#22d87e':'#ff5a5a',marginBottom:8}}>{fmtS(n)}</div>
                <div style={{fontSize:11,color:'#6b6b78'}}>Spent: <span style={{color:'#ff5a5a'}}>{fmt(st.spent)}</span></div>
                <div style={{fontSize:11,color:'#6b6b78'}}>Earned: <span style={{color:'#22d87e'}}>{fmt(st.earned)}</span></div>
                <div style={{fontSize:11,color:'#6b6b78',marginTop:2}}>{note}</div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Monthly P&L · All Firms">
        <MonthlyChart allPurchases={allPurchases} allPayouts={allPayouts} />
      </Section>

      <Section title="Progress">
        <div style={s.progBlock}>
          <div style={s.progHdr}><span style={s.progLabel}>Breakeven</span><span style={s.progVals}>{fmt(totEarned)} / {fmt(totSpent)}</span></div>
          <div style={s.progTrack}><div style={{...s.progBar,width:bePct.toFixed(1)+'%',background:bePct>=100?'linear-gradient(90deg,#22d87e,#4aeaa0)':'linear-gradient(90deg,#ff5a5a,#ff8a6a)'}} /></div>
          <div style={s.progSub}>{bePct>=100?'Breakeven reached! '+fmt(totEarned-totSpent)+' profit':fmt(totSpent-totEarned)+' more needed ('+bePct.toFixed(1)+'%)'}</div>
        </div>
        <div style={{...s.progBlock,marginTop:16}}>
          <div style={s.progHdr}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={s.progLabel}>My Goal</span>
              <div style={s.goalWrap}><span style={{color:'#6b6b78',fontSize:12}}>$</span><input type="number" value={goal} onChange={e=>setGoal(e.target.value)} placeholder="e.g. 10000" style={s.goalInp} /></div>
            </div>
            <span style={s.progVals}>{net>=0?fmt(net):'-'+fmt(Math.abs(net))} / {goalN>0?fmt(goalN):'—'}</span>
          </div>
          <div style={s.progTrack}><div style={{...s.progBar,width:goalPct.toFixed(1)+'%',background:'linear-gradient(90deg,#22d87e,#4aeaa0)'}} /></div>
          <div style={s.progSub}>
            {goalN<=0?'Enter a profit goal above':goalPct>=100?'Goal reached! '+fmt(net-goalN)+' above':net<0?fmt(Math.abs(net))+' in the red — need '+fmt(goalN+Math.abs(net))+' more in payouts':fmt(goalN-net)+' more to go ('+goalPct.toFixed(1)+'%)'}
          </div>
        </div>
      </Section>

      {ts.payouts.length > 0 && (
        <Section title="Topstep · Payout History">
          {[...ts.payouts].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(p => {
            const pnet=parseFloat(p.amount||0),req=parseFloat(p.requestedAmount||p.amount||0),fee=Math.max(0,req-pnet)
            const dt=new Date(p.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
            return (
              <div key={p.id} style={s.payRow}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}><span style={s.payId}>Payout #{p.id}</span><span style={{...s.badge,...s.badgeGreen}}>{p.status}</span></div>
                  <div style={s.payDate}>{dt}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontFamily:'monospace',fontSize:14,fontWeight:700,color:'#22d87e'}}>{fmt(pnet)}</div>
                  <div style={{fontSize:11,color:'#6b6b78',marginTop:2}}>{fmt(req)} requested{fee>0?' · $'+fee.toFixed(2)+' fee':''}</div>
                </div>
              </div>
            )
          })}
        </Section>
      )}

      {tsData?.accounts?.length > 0 && (
        <Section title="Topstep · Accounts">
          {[...tsData.accounts].sort((a,b)=>{if(a.active&&!b.active)return -1;if(!a.active&&b.active)return 1;return parseFloat(b.balance||0)-parseFloat(a.balance||0)}).map(acc => {
            const bal=parseFloat(acc.balance||0),stage=(acc.stage||'').replace(/-/g,' ')
            const bst=acc.active?(stage.includes('funded')?s.badgeGold:s.badgeGreen):s.badgeGray
            return (
              <div key={acc.id} style={s.accRow}>
                <div>
                  <div style={{display:'flex',alignItems:'center'}}><span style={s.accName}>{acc.platformAccount||acc.templateName||'Account'}</span><span style={{...s.badge,...bst}}>{acc.active?(stage||'Active'):'Inactive'}</span></div>
                  <div style={s.accMeta}>{acc.templateName}{acc.startingBalance?' · $'+Number(acc.startingBalance).toLocaleString()+' account':''}</div>
                </div>
                <span style={{fontFamily:'monospace',fontSize:14,fontWeight:700,color:bal>=0?'#22d87e':'#ff5a5a'}}>{fmt(bal)}</span>
              </div>
            )
          })}
        </Section>
      )}

      <div style={s.watermark}>prop-firm-pnl</div>
    </div>
  )
}

function Section({title,children}){return <div style={s.section}><div style={s.secTitle}>{title}</div>{children}</div>}

const s = {
  authWrap:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#0d0d0f',padding:'40px 24px',textAlign:'center'},
  authLogo:{fontFamily:'monospace',fontSize:12,letterSpacing:'0.2em',color:'#6b6b78',marginBottom:28},
  authTitle:{fontSize:30,fontWeight:600,color:'#e8e8ea',marginBottom:8,letterSpacing:'-0.5px'},
  authSub:{fontSize:14,color:'#6b6b78',marginBottom:36,lineHeight:1.7,maxWidth:440},
  authBox:{background:'#141418',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:32,width:'100%',maxWidth:460,textAlign:'left'},
  lbl:{display:'block',fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'#6b6b78',marginBottom:6,fontWeight:500},
  inp:{width:'100%',background:'#1a1a20',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#e8e8ea',fontFamily:'monospace',fontSize:12,padding:'10px 12px',outline:'none',marginBottom:16,boxSizing:'border-box'},
  btn:{width:'100%',background:'#22d87e',color:'#050f09',border:'none',borderRadius:8,fontSize:14,fontWeight:700,padding:13,cursor:'pointer'},
  err:{color:'#ff5a5a',fontSize:13,marginTop:14,background:'rgba(255,90,90,0.07)',border:'1px solid rgba(255,90,90,0.2)',borderRadius:8,padding:'10px 14px'},
  howTo:{marginTop:16,fontSize:12,color:'#6b6b78',lineHeight:1.7,padding:12,border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,background:'#1a1a20'},
  spinner:{width:30,height:30,border:'2px solid rgba(255,255,255,0.08)',borderTopColor:'#22d87e',borderRadius:'50%',animation:'spin 0.65s linear infinite',marginBottom:18},
  page:{maxWidth:920,margin:'0 auto',padding:'40px 24px 80px',background:'#0d0d0f',minHeight:'100vh'},
  hdr:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:52},
  hdrTitle:{fontSize:15,fontWeight:600,color:'#e8e8ea'},
  hdrSub:{fontSize:13,color:'#6b6b78',marginTop:3},
  hdrDate:{fontSize:13,color:'#6b6b78'},
  logoutBtn:{background:'none',border:'1px solid rgba(255,255,255,0.08)',borderRadius:6,color:'#6b6b78',fontSize:12,padding:'5px 11px',cursor:'pointer'},
  hero:{textAlign:'center',marginBottom:52},
  heroNum:{fontFamily:'monospace',fontSize:'clamp(54px,10vw,82px)',fontWeight:700,letterSpacing:'-3px',lineHeight:1,marginBottom:12},
  heroLbl:{fontSize:11,letterSpacing:'0.22em',textTransform:'uppercase',fontWeight:600},
  cards:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:28},
  card:{borderRadius:14,padding:22,border:'1px solid rgba(255,255,255,0.08)'},
  cardLbl:{fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'#6b6b78',fontWeight:500,marginBottom:12},
  cardVal:{fontFamily:'monospace',fontSize:28,fontWeight:700,lineHeight:1,marginBottom:8},
  cardDet:{fontSize:12,color:'#6b6b78'},
  roi:{textAlign:'center',marginTop:6,fontSize:14,color:'#6b6b78'},
  section:{marginTop:50},
  secTitle:{fontSize:11,letterSpacing:'0.14em',textTransform:'uppercase',color:'#6b6b78',fontWeight:500,marginBottom:14,paddingBottom:10,borderBottom:'1px solid rgba(255,255,255,0.08)'},
  chartWrap:{background:'#141418',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'20px 20px 12px'},
  progBlock:{background:'#141418',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'18px 20px'},
  progHdr:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12},
  progLabel:{fontSize:12,fontWeight:600,color:'#e8e8ea',letterSpacing:'0.04em'},
  progVals:{fontFamily:'monospace',fontSize:12,color:'#6b6b78'},
  progTrack:{background:'rgba(255,255,255,0.06)',borderRadius:100,height:8,overflow:'hidden'},
  progBar:{height:'100%',borderRadius:100,transition:'width 0.6s ease'},
  progSub:{fontSize:12,color:'#6b6b78',marginTop:8},
  goalWrap:{display:'flex',alignItems:'center',gap:4,background:'#1a1a20',border:'1px solid rgba(255,255,255,0.08)',borderRadius:6,padding:'3px 8px'},
  goalInp:{background:'none',border:'none',outline:'none',color:'#e8e8ea',fontFamily:'monospace',fontSize:12,width:90},
  payRow:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 0',borderBottom:'1px solid rgba(255,255,255,0.08)'},
  payId:{fontFamily:'monospace',fontSize:12,color:'#6b6b78'},
  payDate:{fontSize:11,color:'#6b6b78',marginTop:2},
  accRow:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 0',borderBottom:'1px solid rgba(255,255,255,0.08)'},
  accName:{fontFamily:'monospace',fontSize:12,color:'#e8e8ea'},
  accMeta:{fontSize:11,color:'#6b6b78',marginTop:3},
  badge:{fontSize:10,padding:'3px 9px',borderRadius:100,fontWeight:600,textTransform:'uppercase',marginLeft:8},
  badgeGreen:{background:'rgba(34,216,126,0.14)',color:'#22d87e'},
  badgeGold:{background:'rgba(240,168,48,0.14)',color:'#f0a830'},
  badgeGray:{background:'rgba(107,107,120,0.18)',color:'#6b6b78'},
  watermark:{textAlign:'center',color:'#252528',fontSize:11,marginTop:64,letterSpacing:'0.05em'},
}
