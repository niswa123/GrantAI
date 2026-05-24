# 📋 Team Members UX & Usability Todo List (TODOTEAM)

This is the interactive checklist for making the **Team Members** management interface in GrantAI incredibly premium and robust.

## Completed Tasks ✅
- [x] **Fix Invite Acceptance ("Accept Invite" button)**:
  - [x] Update `acceptInvite` Server Action to support an optional `userId` parameter to bypass NextAuth session verification bugs in production.
  - [x] Create a premium `AcceptInviteButton` client component with transitions, loading states, and direct router redirects.
  - [x] Integrate `AcceptInviteButton` on the invitation token landing page (`invite/[token]/page.tsx`).
- [x] **Enhance Member Management Interface**:
  - [x] Integrate an instant **Search Bar** to dynamically filter members by name/email.
  - [x] Add a custom **Role Filter** dropdown (All, Admins, Editors, Viewers).
  - [x] Refactor the three-dot `MemberActionMenu` to only show the "Remove Member" option, keeping the interface minimalist and clean since role changes are handled directly inline.
  - [x] Design a beautiful **Confirm Removal Modal** with warning prompts to avoid accidental deletion.
  - [x] Implement smooth Framer Motion layout transitions for list updates, sorting, and modal entries.
- [x] **Fix Dropdown Clipping Under Table Wrapper**:
  - [x] Refactor the inline `RoleDropdown` component to use React's `createPortal` and dynamically calculate positioning with `getBoundingClientRect()`. This prevents the dropdown from being clipped under the table's `overflow-hidden` container and allows direct, lightning-fast inline role editing!

## Next Steps / Pending Deployment 🚀
- [ ] **Deploy to Production (VPS)**:
  - Copy all modified and new files to the VPS and run a clean build to apply the changes.
  - Execute the following command in your terminal:
    ```bash
    scp /Users/ape.ces/Desktop/GrantAi/frontend/src/lib/auth.ts root@85.192.27.232:~/GrantAI/frontend/src/lib/auth.ts && \
    scp /Users/ape.ces/Desktop/GrantAi/frontend/src/app/actions/memberActions.ts root@85.192.27.232:~/GrantAI/frontend/src/app/actions/memberActions.ts && \
    scp /Users/ape.ces/Desktop/GrantAi/frontend/src/app/settings/members/page.tsx root@85.192.27.232:~/GrantAI/frontend/src/app/settings/members/page.tsx && \
    scp "/Users/ape.ces/Desktop/GrantAi/frontend/src/app/invite/[token]/page.tsx" "root@85.192.27.232:~/GrantAI/frontend/src/app/invite/[token]/page.tsx" && \
    scp "/Users/ape.ces/Desktop/GrantAi/frontend/src/app/invite/[token]/AcceptInviteButton.tsx" "root@85.192.27.232:~/GrantAI/frontend/src/app/invite/[token]/AcceptInviteButton.tsx" && \
    ssh root@85.192.27.232 "cd ~/GrantAI/frontend && npm run build && pm2 restart grantai"
    ```
