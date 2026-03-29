import { getSettings } from '@/lib/server/settings';
import { Wrench } from 'lucide-react';

export default async function MaintenancePage() {
  const settings = await getSettings();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md px-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Wrench className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">{settings.siteName}</h1>
        <p className="text-muted-foreground">{settings.maintenanceMsg}</p>
        <p className="text-xs text-muted-foreground">Silakan coba beberapa saat lagi.</p>
      </div>
    </div>
  );
}
