import BillingClient from './billing-client';

export const metadata = {
  title: 'Billing | GrantAI',
  description: 'Manage your GrantAI subscription and billing details.',
};

export default function BillingPage() {
  return <BillingClient />;
}
