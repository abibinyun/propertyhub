import { serverApi } from '@/lib/server/api';
import { AdminUserActions } from '@/components/client/admin-user-actions';
import { AdminUsersFilter } from '@/components/client/admin-users-filter';
import { AdminUser } from '@/lib/api/admin';
import Link from 'next/link';
import { Building2, MessageSquare } from 'lucide-react';

interface Props {
  searchParams: Promise<{ role?: string; search?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { role, search, page = '1' } = await searchParams;
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (search) params.set('search', search);
  params.set('page', page);
  params.set('limit', '15');

  const { data: users, meta } = await serverApi.getAdminUsers(params.toString());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pengguna</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{meta.total.toLocaleString()} total pengguna</p>
        </div>
      </div>

      <AdminUsersFilter />

      <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-slate-50/60">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pengguna</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Aktivitas</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Bergabung</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {users.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Tidak ada pengguna</td></tr>
              )}
              {users.map((user: AdminUser) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600 flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {user.company && <p className="text-xs text-muted-foreground">{user.company}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {user.verified ? 'Aktif' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{user._count.properties}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{user._count.leads}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <AdminUserActions user={user} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
            <p className="text-xs text-muted-foreground">Halaman {meta.page} dari {meta.totalPages}</p>
            <div className="flex gap-2">
              {meta.page > 1 && (
                <Link href={`?page=${meta.page - 1}${role ? `&role=${role}` : ''}`}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 transition-colors">
                  Sebelumnya
                </Link>
              )}
              {meta.page < meta.totalPages && (
                <Link href={`?page=${meta.page + 1}${role ? `&role=${role}` : ''}`}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 transition-colors">
                  Berikutnya
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
