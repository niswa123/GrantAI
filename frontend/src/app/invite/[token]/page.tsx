import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { acceptInvite } from '@/app/actions/memberActions';
import { Building2, Check, AlertCircle } from 'lucide-react';

export default async function InvitePage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const token = params.token;
  
  // 1. Fetch Invite
  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    include: { company: true },
  });

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Invalid or Expired Invite</h1>
          <p className="text-sm text-slate-400 mb-6">This invitation link is no longer valid or has already been accepted.</p>
          <Link href="/auth/login" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // 2. Check Session
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    // Redirect to login/register with a callback URL
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const userEmail = session.user.email;
  const isEmailMatch = userEmail?.toLowerCase() === invite.email.toLowerCase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4">
      <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8 text-cyan-400" />
        </div>
        
        <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
          Join {invite.company.name}
        </h1>
        
        <p className="text-sm text-slate-400 mb-8">
          You have been invited to collaborate as <strong className="text-white">{invite.role}</strong>.
        </p>

        {!isEmailMatch ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-left">
            <h3 className="text-rose-400 font-bold text-sm mb-1 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Account Mismatch
            </h3>
            <p className="text-xs text-rose-300">
              This invite was sent to <strong>{invite.email}</strong>, but you are logged in as <strong>{userEmail}</strong>. 
              Please log out and log in with the correct account to accept this invitation.
            </p>
          </div>
        ) : (
          <form action={async () => {
            "use server";
            const res = await acceptInvite(token);
            if (res.success) {
              redirect('/dashboard');
            } else {
              // Redirect or show error (simplified for now)
              redirect(`/invite/${token}?error=${res.error}`);
            }
          }}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            >
              <Check className="w-5 h-5" />
              Accept Invitation
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
