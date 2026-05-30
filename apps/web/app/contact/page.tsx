import type { Metadata } from 'next';
import { ContactForm } from '@/components/client/contact-page-form';
import { Phone, Mail, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kontak',
  description: 'Hubungi tim PropertyHub untuk pertanyaan, saran, atau bantuan.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-3">Hubungi Kami</h1>
          <p className="text-muted-foreground">Ada pertanyaan atau butuh bantuan? Kami siap membantu.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info kontak */}
          <div className="space-y-4">
            {[
              { icon: Phone, label: 'Telepon', value: '0800-1234-5678', sub: 'Senin–Jumat, 09.00–17.00' },
              { icon: Mail, label: 'Email', value: 'hello@propertyhub.id', sub: 'Respon dalam 1x24 jam' },
              { icon: MessageCircle, label: 'WhatsApp', value: '+62 812-3456-7890', sub: 'Chat langsung dengan tim' },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="bg-white rounded-2xl border p-4">
                <div className="flex items-center gap-3 mb-1">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{label}</span>
                </div>
                <p className="text-sm font-semibold">{value}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-white rounded-2xl border p-6">
            <h2 className="font-semibold mb-4">Kirim Pesan</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
