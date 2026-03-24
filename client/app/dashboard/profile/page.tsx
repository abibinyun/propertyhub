import { redirect } from 'next/navigation';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/components/client/profile-form';

export default async function ProfilePage() {
  const token = await getToken();
  if (!token) redirect('/login');

  const user = await serverApi.getUserProfile();

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-8">Profil Saya</h1>
      <Card>
        <CardHeader><CardTitle>Informasi Akun</CardTitle></CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
