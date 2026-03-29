import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ForgotPasswordForm } from '@/components/client/forgot-password-form';
import { KeyRound } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Lupa Password — PropertyHub',
  alternates: { canonical: `${BASE_URL}/forgot-password` },
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="relative max-w-md w-full border-2 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-2">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Lupa Password</CardTitle>
          <CardDescription>Masukkan email Anda untuk menerima link reset password</CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
