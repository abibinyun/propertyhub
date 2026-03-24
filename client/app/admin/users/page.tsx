import { serverApi } from '@/lib/server/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminUserActions } from '@/components/client/admin-user-actions';
import { AdminUser } from '@/lib/api/admin';

export default async function AdminUsersPage() {
  const { data: users } = await serverApi.getAdminUsers();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Semua Pengguna</h1>
        <span className="text-muted-foreground text-sm">{users.length} pengguna</span>
      </div>
      <div className="space-y-3">
        {users.map((user: AdminUser) => (
          <Card key={user.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{user.name}</p>
                  {!user.verified && <Badge variant="destructive" className="text-xs">Banned</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user._count.properties} properti · {user._count.leads} leads
                </p>
              </div>
              <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
              <AdminUserActions user={user} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
