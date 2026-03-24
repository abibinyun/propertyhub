import { Suspense } from 'react';
import { VerifyEmailClient } from './verify-email-client';

export const metadata = { title: 'Verifikasi Email — PropertyHub' };

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Suspense fallback={<div className="text-muted-foreground text-sm">Memverifikasi...</div>}>
        <VerifyEmailClient />
      </Suspense>
    </div>
  );
}
