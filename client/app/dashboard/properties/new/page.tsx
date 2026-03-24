import { PropertyForm } from '@/components/client/property-form';

export default function NewPropertyPage() {
  return (
    <div className="py-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pasang Iklan Properti</h1>
        <p className="text-sm text-muted-foreground mt-1">Isi detail properti Anda untuk mulai menerima calon pembeli</p>
      </div>
      <PropertyForm />
    </div>
  );
}
