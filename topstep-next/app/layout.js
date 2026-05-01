export const metadata = { title: 'Topstep P&L', description: 'Lifetime trading performance' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin:0, padding:0, background:'#0d0d0f', fontFamily:"'Inter',sans-serif" }}>
        <style>{`
          * { box-sizing: border-box; }
          @keyframes spin { to { transform: rotate(360deg); } }
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
          input[type=number] { -moz-appearance: textfield; }
        `}</style>
        {children}
      </body>
    </html>
  )
}
