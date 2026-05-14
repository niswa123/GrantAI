"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowRight } from "lucide-react"
import { registerUser } from "@/app/actions/authActions"

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
)

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (err) {
      setError("An unexpected error occurred with Google Sign-In.")
      setGoogleLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    try {
      setGithubLoading(true)
      await signIn("github", { callbackUrl: "/dashboard" })
    } catch (err) {
      setError("An unexpected error occurred with GitHub Sign-Up.")
      setGithubLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await registerUser(formData)
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Auto login after successful registration
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError(res.error)
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err: any) {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#020617]">
      {/* Left side: Form */}
      <div className="flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-[420px] space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Create an account</h1>
            <p className="text-sm sm:text-base text-slate-400">Start managing your tax credits today</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-11 sm:h-12 rounded-xl bg-transparent border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white transition-all font-medium touch-manipulation" 
              onClick={handleGoogleSignIn}
              disabled={googleLoading || githubLoading || loading}
            >
              {googleLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" /> : <GoogleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />}
              <span className="text-sm sm:text-base">Sign up with Google</span>
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-11 sm:h-12 rounded-xl bg-transparent border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white transition-all font-medium touch-manipulation" 
              onClick={handleGitHubSignIn}
              disabled={googleLoading || githubLoading || loading}
            >
              {githubLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" /> : <GitHubIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />}
              <span className="text-sm sm:text-base">Sign up with GitHub</span>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#020617] px-3 text-slate-500 font-medium tracking-wider">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-slate-300 text-sm">Company Name</Label>
              <Input 
                id="companyName" 
                name="companyName" 
                placeholder="Acme Inc." 
                required 
                className="h-11 sm:h-12 rounded-xl bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm">Work Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="name@company.com" 
                required 
                className="h-11 sm:h-12 rounded-xl bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="h-11 sm:h-12 rounded-xl bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-slate-700"
              />
            </div>
            {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
            
            <Button className="w-full h-11 sm:h-12 mt-4 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold transition-all touch-manipulation" disabled={loading || googleLoading || githubLoading}>
              {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" /> : <span className="text-sm sm:text-base">Create Account</span>}
              {!loading && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 opacity-80" />}
            </Button>
            
            <p className="text-xs text-slate-500 text-center mt-4 leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link href="#" className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors touch-manipulation">Terms of Service</Link>{" "}and{" "}
              <Link href="#" className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors touch-manipulation">Privacy Policy</Link>.
            </p>
          </form>

          <p className="text-xs sm:text-sm text-slate-400 text-center pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-slate-300 font-medium transition-colors touch-manipulation">Sign in here</Link>
          </p>
        </div>
      </div>

      {/* Right side: Visual */}
      <div className="hidden lg:flex relative overflow-hidden bg-slate-950 items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1 text-sm font-medium text-slate-300 mb-6 backdrop-blur-sm">
            Join GrantAI
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Claiming R&D credits <br/> <span className="text-brand-primary">shouldn't be R&D.</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed mb-10">
            Join hundreds of innovative companies recovering millions in tax credits, faster and with less risk.
          </p>
          <div className="space-y-4">
            {[
              "Automated project tracking and scoring",
              "AI-assisted technical narrative generation",
              "Bank-grade security and compliance"
            ].map((feature, i) => (
              <div key={i} className="flex items-center text-slate-300">
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center mr-3 border border-slate-700 shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3L4.5 8.5L2 6" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
