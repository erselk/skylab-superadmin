import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default function RootPage() {
  redirect('/dashboard');
}
