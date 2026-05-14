"use client"

import Link from "next/link"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  useEffect(() => {
    setIsLoggedIn(!!Cookies.get("token"))
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const handleAuth = () => {
    if (isLoggedIn) {
      Cookies.remove("token")
      setIsLoggedIn(false)
      router.push("/")
    } else {
      router.push("/login")
    }
    setMobileMenuOpen(false)
  }

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${isScrolled ? "top-2 sm:top-4 w-[95%] sm:w-[85%] md:w-[80%] max-w-3xl" : "top-4 sm:top-6 w-[95%] sm:w-[92%] md:w-[90%] max-w-4xl"}`}
      >
        <div className={`glass rounded-full flex items-center justify-between transition-all duration-500 ease-out ${isScrolled ? "px-3 sm:px-4 py-2 bg-slate-950/80 backdrop-blur-xl border-white/10" : "px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900/30 backdrop-blur-md border-white/5"}`}>
          <Link href="/" className={`${isScrolled ? "text-base sm:text-lg" : "text-lg sm:text-xl"} font-bold tracking-tighter flex items-center gap-2 transition-all`}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[10px] bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400">
                <path d="m12 3-8 4v10l8 4 8-4V7z"></path>
                <path d="m12 11 8-4"></path>
                <path d="m12 11-8-4"></path>
                <path d="m12 11v10"></path>
              </svg>
            </div>
            <span className="hidden xs:inline">GrantAI</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-400">
            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link href={isLoggedIn ? "/dashboard" : "/login"} className="hover:text-white transition-colors">
              {isLoggedIn ? "Dashboard" : "Solutions"}
            </Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <button 
              onClick={handleAuth}
              className="text-sm font-medium hover:text-white transition-colors px-3 lg:px-4 py-2"
            >
              {isLoggedIn ? "Sign Out" : "Login"}
            </button>
            {!isLoggedIn && (
              <Link href="/register" className="text-sm font-medium bg-white text-black px-4 lg:px-5 py-2 rounded-full hover:bg-slate-200 transition-colors whitespace-nowrap">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors touch-manipulation"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-20 left-4 right-4 z-50 md:hidden"
            >
              <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <nav className="flex flex-col gap-2">
                  <Link 
                    href="/#features" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-semibold text-slate-300 hover:text-white transition-colors py-3 px-4 rounded-xl hover:bg-white/5 touch-manipulation"
                  >
                    Features
                  </Link>
                  <Link 
                    href={isLoggedIn ? "/dashboard" : "/login"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-semibold text-slate-300 hover:text-white transition-colors py-3 px-4 rounded-xl hover:bg-white/5 touch-manipulation"
                  >
                    {isLoggedIn ? "Dashboard" : "Solutions"}
                  </Link>
                  <Link 
                    href="/#pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-semibold text-slate-300 hover:text-white transition-colors py-3 px-4 rounded-xl hover:bg-white/5 touch-manipulation"
                  >
                    Pricing
                  </Link>
                  
                  <div className="border-t border-white/10 my-2" />
                  
                  <button 
                    onClick={handleAuth}
                    className="text-base font-semibold text-slate-300 hover:text-white transition-colors py-3 px-4 rounded-xl hover:bg-white/5 text-left touch-manipulation"
                  >
                    {isLoggedIn ? "Sign Out" : "Login"}
                  </button>
                  
                  {!isLoggedIn && (
                    <Link 
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-bold bg-white text-black py-3 px-4 rounded-xl hover:bg-slate-200 transition-colors text-center mt-2 touch-manipulation"
                    >
                      Get Started
                    </Link>
                  )}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
