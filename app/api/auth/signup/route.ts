import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isLimited, clientIp } from '@/lib/aiServer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // A few sign-ups per address per hour, so one person can't farm free questions with many accounts.
    if (await isLimited(`signup:${clientIp(req)}`, 5, 3600)) {
      return NextResponse.json({ error: 'Too many sign-ups from this network. Please try again later.' }, { status: 429 })
    }
    const { email, password, name, age } = await req.json()

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      console.error('Supabase signup error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message || JSON.stringify(error) }, { status: 400 })
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        username: name,
        age: parseInt(age),
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Signup route error:', err)
    return NextResponse.json({ error: err.message || 'Signup failed' }, { status: 500 })
  }
}