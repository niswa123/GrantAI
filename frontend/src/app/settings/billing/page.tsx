import { getUserSubscription } from '@/app/actions/billingActions';
import BillingClient from './billing-client';

export const metadata = {
  title: 'Billing | GrantAI',
  description: 'Manage your GrantAI subscription and billing details.',
};

export default async function BillingPage() {
  const subscription = await getUserSubscription();

  return <BillingClient subscription={subscription} />;
}
