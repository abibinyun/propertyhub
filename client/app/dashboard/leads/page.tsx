import { redirect } from 'next/navigation';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { Lead, LeadStatus } from '@/types/lead';

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'Baru', CONTACTED: 'Dihubungi', QUALIFIED: 'Qualified', CLOSED: 'Selesai', LOST: 'Batal',
};
const STATUS_VARIANT: Record<LeadStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  NEW: 'default', CONTACTED: 'secondary', QUALIFIED: 'secondary', CLOSED: 'outline', LOST: 'destructive',
};

export default async function LeadsPage() {
  const token = await getToken();
  if (!token) redirect('/login');

  const leads = await serverApi.getMyLeads();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Leads Saya</h1>
        <span className="text-muted-foreground">({leads.length})</span>
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Belum ada leads masuk</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead: Lead) => (
            <Card key={lead.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{lead.name}</p>
                      <Badge variant={STATUS_VARIANT[lead.status]}>{STATUS_LABELS[lead.status]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{lead.email} · {lead.phone}</p>
                    <p className="text-sm line-clamp-2">{lead.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(lead.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
