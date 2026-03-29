'use client';

import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function formatRp(n: number) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function KprCalculator({ price }: { price: number }) {
  const [dp, setDp] = useState(20);
  const [tenor, setTenor] = useState(15);
  const [bunga, setBunga] = useState(10.5);

  const result = useMemo(() => {
    const pokok = price * (1 - dp / 100);
    const r = bunga / 100 / 12;
    const n = tenor * 12;
    if (r === 0) return { cicilan: pokok / n, pokok, total: pokok };
    const cicilan = (pokok * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return { cicilan, pokok, total: cicilan * n };
  }, [price, dp, tenor, bunga]);

  return (
    <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          Simulasi KPR
        </h3>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">DP (%)</Label>
            <Input
              type="number" min={0} max={90} value={dp}
              onChange={e => setDp(Number(e.target.value))}
              className="rounded-xl h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tenor (thn)</Label>
            <Input
              type="number" min={1} max={30} value={tenor}
              onChange={e => setTenor(Number(e.target.value))}
              className="rounded-xl h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Bunga (%/thn)</Label>
            <Input
              type="number" min={0} max={30} step={0.1} value={bunga}
              onChange={e => setBunga(Number(e.target.value))}
              className="rounded-xl h-9 text-sm"
            />
          </div>
        </div>

        <div className="bg-primary/5 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Harga properti</span>
            <span>{formatRp(price)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>DP ({dp}%)</span>
            <span>{formatRp(price * dp / 100)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Pokok pinjaman</span>
            <span>{formatRp(result.pokok)}</span>
          </div>
          <div className="border-t border-border/50 pt-2 flex justify-between items-center">
            <span className="text-sm font-semibold">Cicilan/bulan</span>
            <span className="text-base font-bold text-primary">{formatRp(result.cicilan)}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">*Simulasi perkiraan. Hubungi bank untuk informasi resmi.</p>
      </div>
    </div>
  );
}
