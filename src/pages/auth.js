import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) setMessage(error.message)
    else setMessage('Signup successful! Check your email for confirmation.')
  }

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) setMessage(error.message)
    else setMessage('Logged in successfully!')
  }

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold mb-4">Login / Signup</h1>
      <input
        type="email"
        placeholder="Email"
        className="border p-2 mb-2 rounded w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 mb-2 rounded w-64"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex gap-4">
        <button
          onClick={handleSignup}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Sign Up
        </button>
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Log In
        </button>
      </div>
      <p className="mt-4 text-gray-700">{message}</p>
    </div>
  )
}
