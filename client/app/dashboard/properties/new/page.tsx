import { PropertyForm } from '@/components/client/property-form';

export default function NewPropertyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Tambah Properti</h1>
      <PropertyForm />
    </div>
  );
}
