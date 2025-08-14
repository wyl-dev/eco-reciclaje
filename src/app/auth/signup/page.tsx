import type { Metadata } from 'next';
import SignupFormClient from '@/components/auth/SignupFormClient';

export const metadata: Metadata = { title: 'Registrarse' };

export default function SignupPage(){
  return <SignupFormClient />;
}
