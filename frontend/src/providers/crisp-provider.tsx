'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * CrispProvider — injects the Crisp.chat widget into the app.
 *
 * Add NEXT_PUBLIC_CRISP_WEBSITE_ID to your .env to enable.
 * Get your ID at: https://app.crisp.chat/ → Settings → Website Settings → Setup Instructions
 *
 * When a user is logged in, we automatically identify them in Crisp so you
 * can see their name and email in your Crisp inbox.
 */
export function CrispProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

  useEffect(() => {
    if (!websiteId || typeof window === 'undefined') return;

    // Inject Crisp only once
    if ((window as any).$crisp) return;

    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = websiteId;

    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);
  }, [websiteId]);

  // Identify the logged-in user in Crisp for personalized support
  // ⚠️ NOTE: Identifying users programmatically requires a paid Crisp plan (Starter/Mini)
  // We'll leave this commented out so it works perfectly as an anonymous chat on the free plan!
  /*
  useEffect(() => {
    if (!websiteId || typeof window === 'undefined') return;
    if (!session?.user) return;

    const interval = setInterval(() => {
      if ((window as any).$crisp?.push) {
        const { email, name } = session.user as { email?: string; name?: string };

        if (email) {
          (window as any).$crisp.push(['set', 'user:email', [email]]);
        }
        if (name) {
          (window as any).$crisp.push(['set', 'user:nickname', [name]]);
        }

        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [session, websiteId]);
  */

  return <>{children}</>;
}
