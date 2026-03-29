import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: 'Syarat dan ketentuan penggunaan platform PropertyHub.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-2">Syarat & Ketentuan</h1>
          <p className="text-muted-foreground text-sm">Terakhir diperbarui: Maret 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="bg-white rounded-2xl border p-8 space-y-8 text-sm text-muted-foreground leading-relaxed">
          {[
            {
              title: '1. Penerimaan Syarat',
              content: 'Dengan menggunakan PropertyHub, Anda menyetujui syarat dan ketentuan ini. Jika tidak setuju, harap tidak menggunakan platform kami.',
            },
            {
              title: '2. Penggunaan Platform',
              content: 'PropertyHub adalah platform listing properti. Anda dapat mendaftar, memasang iklan properti, dan menghubungi pemilik properti. Penggunaan platform untuk tujuan ilegal, penipuan, atau spam dilarang keras.',
            },
            {
              title: '3. Konten Listing',
              content: 'Anda bertanggung jawab atas keakuratan informasi properti yang Anda listing. Dilarang memasang properti fiktif, harga menyesatkan, atau foto yang tidak sesuai. Kami berhak menghapus listing yang melanggar ketentuan.',
            },
            {
              title: '4. Layanan Berbayar',
              content: 'Featured Listing adalah layanan berbayar opsional. Pembayaran bersifat final dan tidak dapat dikembalikan kecuali terjadi kesalahan teknis dari pihak kami. Durasi featured sesuai paket yang dipilih.',
            },
            {
              title: '5. Leads & Komunikasi',
              content: 'Leads yang masuk melalui platform adalah milik pemilik properti. Kami tidak bertanggung jawab atas transaksi yang terjadi di luar platform antara penjual dan pembeli.',
            },
            {
              title: '6. Penangguhan Akun',
              content: 'Kami berhak menangguhkan atau menghapus akun yang melanggar syarat ini, melakukan spam, atau merugikan pengguna lain tanpa pemberitahuan sebelumnya.',
            },
            {
              title: '7. Batasan Tanggung Jawab',
              content: 'PropertyHub adalah platform perantara. Kami tidak menjamin keakuratan semua listing dan tidak bertanggung jawab atas kerugian yang timbul dari transaksi properti yang dilakukan melalui platform.',
            },
            {
              title: '8. Hukum yang Berlaku',
              content: 'Syarat ini diatur oleh hukum Republik Indonesia. Sengketa diselesaikan melalui musyawarah atau pengadilan yang berwenang di Indonesia.',
            },
          ].map(({ title, content }) => (
            <div key={title}>
              <h2 className="font-semibold text-foreground mb-2">{title}</h2>
              <p>{content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
