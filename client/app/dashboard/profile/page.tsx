import { redirect } from 'next/navigation';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { ProfileForm } from '@/components/client/profile-form';
import { User } from 'lucide-react';

export default async function ProfilePage() {
  const token = await getToken();
  if (!token) redirect('/login');

  const user = await serverApi.getUserProfile();

  return (
    <div className="py-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Profil Saya</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
