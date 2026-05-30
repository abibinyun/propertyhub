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
    <div className="py-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Properti</h1>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{property.title}</p>
      </div>
      <PropertyForm property={property} />
    </div>
  );
}
