import Link from "next/link";
import { Logo } from "./ui/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#020617] pt-16 pb-8 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="inline-block">
              <Logo className="w-10 h-10" showText textSize="text-2xl" />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every day, your engineers create R&D value that goes unmeasured. GrantAI captures it the moment it happens.
            </p>
          </div>

          {/* Links Cols */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold tracking-tight">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/#features" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Pricing</Link></li>
              <li><Link href="/integrations" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Integrations</Link></li>
              <li><Link href="/login" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-semibold tracking-tight">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">About</Link></li>
              <li><Link href="/blog" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-semibold tracking-tight">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} GrantAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-cyan-400/50 text-xs font-bold tracking-widest uppercase">Code. Claim. Capital.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
