import React from "react";


export default function InputLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  );
}
