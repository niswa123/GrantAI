"use client";

import { useEffect, useRef, useCallback } from "react";

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement | string, options: object) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export function Turnstile({ siteKey, onVerify, onError, onExpire, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const renderedRef = useRef(false);

  // Store callbacks in refs so they don't trigger re-renders
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  onVerifyRef.current = onVerify;
  onErrorRef.current = onError;
  onExpireRef.current = onExpire;

  const stableOnVerify = useCallback((token: string) => onVerifyRef.current(token), []);
  const stableOnError = useCallback(() => onErrorRef.current?.(), []);
  const stableOnExpire = useCallback(() => onExpireRef.current?.(), []);

  useEffect(() => {
    // If already rendered, do nothing
    if (renderedRef.current) return;

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile || renderedRef.current) return;
      
      renderedRef.current = true;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: stableOnVerify,
        "error-callback": stableOnError,
        "expired-callback": stableOnExpire,
        theme: "dark",
        size: "normal",
      });
    };

    // If Turnstile script already loaded
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Inject script if not present
    if (!document.getElementById("cf-turnstile-script")) {
      window.onTurnstileLoad = renderWidget;
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      // Script exists but hasn't loaded yet, poll for it
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    // Cleanup on unmount
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
        renderedRef.current = false;
      }
    };
  }, [siteKey, stableOnVerify, stableOnError, stableOnExpire]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-label="CAPTCHA challenge"
    />
  );
}
