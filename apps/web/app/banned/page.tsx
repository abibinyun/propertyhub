import { Ban } from 'lucide-react';

export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md px-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <Ban className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Akun Dinonaktifkan</h1>
        <p className="text-muted-foreground">Akun Anda telah dinonaktifkan oleh admin. Hubungi support jika ini adalah kesalahan.</p>
      </div>
    </div>
  );
}
