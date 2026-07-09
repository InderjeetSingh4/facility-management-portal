// test-fetch.mjs
async function runTest() {
  try {
    console.log("🚀 Pinging Supabase from raw Node.js...")
    const res = await fetch('https://durcfljdheewazrlevip.supabase.co/auth/v1/health')
    console.log('✅ STATUS:', res.status)
    console.log('✅ BODY:', await res.text())
  } catch (e) {
    console.error('❌ MESSAGE:', e.message)
    console.error('🚨 CAUSE:', e.cause || e)
  }
}

runTest();