'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * FeaturebaseProvider — injects the Featurebase feedback widget.
 *
 * Renders a "Feedback" button (usually bottom-right corner) that lets
 * users submit feature requests, bug reports, and vote on the roadmap.
 *
 * Requires: NEXT_PUBLIC_FEATUREBASE_ORG in .env
 * This is your Featurebase organization name (e.g. "grantai" → grantai.featurebase.app)
 * Get it at: https://app.featurebase.app → Settings → General
 *
 * Docs: https://help.featurebase.app/en/articles/4514409-javascript-sdk
 */
export function FeaturebaseProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const org = process.env.NEXT_PUBLIC_FEATUREBASE_ORG;

  useEffect(() => {
    if (!org || typeof window === 'undefined') return;

    // Inject Featurebase SDK only once
    if ((window as any).Featurebase) return;

    const win = window as any;
    win.Featurebase = win.Featurebase || function (...args: unknown[]) {
      (win.Featurebase.q = win.Featurebase.q || []).push(args);
    };

    const script = document.createElement('script');
    script.src = 'https://do.featurebase.app/js/sdk.js';
    script.id = 'featurebase-sdk';
    script.async = true;
    document.head.appendChild(script);

    // Initialize after SDK loads
    script.onload = () => {
      win.Featurebase('initialize_portal_widget', {
        organization: org,
        placement: 'right',   // 'right' | 'left'
        theme: 'dark',
        // Opens in a sidebar modal instead of redirecting
        fullScreen: false,
        // Initial page shown when widget opens
        initialPage: 'MainView',
      });
    };
  }, [org]);

  // Auto-identify the logged-in user so their votes are tracked
  useEffect(() => {
    if (!org || typeof window === 'undefined') return;
    if (!session?.user) return;

    const win = window as any;
    if (!win.Featurebase) return;

    const { email, name } = session.user as { email?: string; name?: string };
    const [firstName, ...rest] = (name || '').split(' ');

    win.Featurebase('identify', {
      organization: org,
      email,
      name: name || email,
      // Featurebase shows these in the admin panel next to each vote
      customFields: {
        firstName: firstName || '',
        lastName: rest.join(' ') || '',
      },
    });
  }, [session, org]);

  return <>{children}</>;
}
