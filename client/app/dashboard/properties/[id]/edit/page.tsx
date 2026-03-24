import { notFound } from 'next/navigation';
import { propertiesApi } from '@/lib/api/properties';
import { PropertyForm } from '@/components/client/property-form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;

  let property;
  try {
    // id bisa berupa slug atau id — coba fetch by slug dulu
    property = await propertiesApi.getBySlug(id);
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Edit Properti</h1>
      <PropertyForm property={property} />
    </div>
  );
}
