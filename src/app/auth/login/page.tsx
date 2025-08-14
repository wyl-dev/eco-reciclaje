import type { Metadata } from 'next';
import LoginFormClient from '@/components/auth/LoginFormClient';

export const metadata: Metadata = { title: 'Iniciar Sesión' };

export default function LoginPage(){
  return <LoginFormClient />;
}
