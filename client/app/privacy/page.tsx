import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi PropertyHub — bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-2">Kebijakan Privasi</h1>
          <p className="text-muted-foreground text-sm">Terakhir diperbarui: Maret 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="bg-white rounded-2xl border p-8 space-y-8 text-sm text-muted-foreground leading-relaxed">
          {[
            {
              title: '1. Data yang Kami Kumpulkan',
              content: 'Kami mengumpulkan informasi yang Anda berikan saat mendaftar (nama, email, nomor telepon), data properti yang Anda listing, serta data penggunaan platform (halaman yang dikunjungi, pencarian yang dilakukan).',
            },
            {
              title: '2. Penggunaan Data',
              content: 'Data Anda digunakan untuk menjalankan layanan platform, mengirimkan notifikasi leads, meningkatkan pengalaman pengguna, dan (dengan persetujuan Anda) mengirimkan informasi promosi.',
            },
            {
              title: '3. Berbagi Data',
              content: 'Kami tidak menjual data pribadi Anda kepada pihak ketiga. Data hanya dibagikan kepada penyedia layanan teknis yang membantu operasional platform (hosting, email, penyimpanan gambar) dengan perjanjian kerahasiaan.',
            },
            {
              title: '4. Keamanan Data',
              content: 'Kami menggunakan enkripsi HTTPS, password hashing (bcrypt), dan JWT untuk melindungi data Anda. Akses ke database dibatasi hanya untuk personel yang berwenang.',
            },
            {
              title: '5. Hak Pengguna',
              content: 'Anda berhak mengakses, memperbarui, atau menghapus data pribadi Anda kapan saja melalui halaman profil atau dengan menghubungi kami di hello@propertyhub.id.',
            },
            {
              title: '6. Cookie',
              content: 'Kami menggunakan cookie untuk autentikasi (httpOnly, secure) dan preferensi pengguna. Anda dapat menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur mungkin tidak berfungsi.',
            },
            {
              title: '7. Perubahan Kebijakan',
              content: 'Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di platform.',
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
