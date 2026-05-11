"use client"

import Link from "next/link"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  useEffect(() => {
    setIsLoggedIn(!!Cookies.get("token"))
  }, [])

  const handleAuth = () => {
    if (isLoggedIn) {
      Cookies.remove("token")
      setIsLoggedIn(false)
      router.push("/")
    } else {
      router.push("/login")
    }
  }

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${isScrolled ? "top-4 w-[80%] max-w-3xl" : "top-6 w-[90%] max-w-4xl"}`}
    >
      <div className={`glass rounded-full flex items-center justify-between transition-all duration-500 ease-out ${isScrolled ? "px-4 py-2 bg-slate-950/80 backdrop-blur-xl border-white/10" : "px-6 py-3 bg-slate-900/30 backdrop-blur-md border-white/5"}`}>
        <Link href="/" className={`${isScrolled ? "text-lg" : "text-xl"} font-bold tracking-tighter flex items-center gap-2 transition-all`}>
          <div className="w-8 h-8 rounded-[10px] bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-cyan-400">
              <path d="m12 3-8 4v10l8 4 8-4V7z"></path>
              <path d="m12 11 8-4"></path>
              <path d="m12 11-8-4"></path>
              <path d="m12 11v10"></path>
            </svg>
          </div>
          GrantAI
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href={isLoggedIn ? "/dashboard" : "/login"} className="hover:text-white transition-colors">
            {isLoggedIn ? "Dashboard" : "Solutions"}
          </Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleAuth}
            className="text-sm font-medium hover:text-white transition-colors px-4 py-2"
          >
            {isLoggedIn ? "Sign Out" : "Login"}
          </button>
          {!isLoggedIn && (
            <Link href="/register" className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-slate-200 transition-colors">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
