interface WilayahData {
  provinsi: { id: string; nama: string }[];
  kabupaten: Record<string, { id: string; nama: string }[]>;
}

let cached: string[] | null = null;

export async function getKotaList(): Promise<string[]> {
  if (cached) return cached;
  const res = await fetch('/wilayah/provinsi-kabupaten.json');
  const data: WilayahData = await res.json();
  const result: string[] = [];
  for (const list of Object.values(data.kabupaten)) {
    for (const k of list) {
      result.push(k.nama.replace(/^KAB\. |^KOTA /, '').replace(/\b\w/g, (c) => c.toUpperCase()));
    }
  }
  cached = result;
  return result;
}

export function searchKota(list: string[], query: string, limit = 6): string[] {
  const q = query.toLowerCase();
  return list.filter((k) => k.toLowerCase().includes(q)).slice(0, limit);
}
