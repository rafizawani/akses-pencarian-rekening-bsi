import { PenerimaBsu } from '../types/bsu';

export function maskNik(nik: string, masked: boolean = true): string {
  if (!nik || nik === '-') return '-';
  if (!masked) return nik;
  if (nik.length < 8) return nik;
  const start = nik.slice(0, 6);
  const end = nik.slice(-4);
  const middle = '*'.repeat(Math.max(0, nik.length - 10));
  return `${start}${middle}${end}`;
}

export function maskPhone(phone: string, masked: boolean = true): string {
  if (!phone || phone === '-') return '-';
  if (!masked) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return phone;
  return digits.slice(0, 4) + '****' + digits.slice(-3);
}

export function formatAccountNumber(acc: string): string {
  if (!acc) return '-';
  const clean = acc.replace(/\s+/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8)}`;
  }
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

export function exportToCsv(data: PenerimaBsu[], filename = 'data_pencarian_rekening.csv') {
  if (!data || data.length === 0) return;

  const headers = [
    'No',
    'Nama Lengkap',
    'NIK',
    'Nomor Rekening',
    'Nama Perusahaan',
    'Nama Ibu Kandung',
    'Nomor Handphone',
    'Tautan Berkas KTP'
  ];

  const rows = data.map((item, idx) => [
    `"${idx + 1}"`,
    `"${item.nama.replace(/"/g, '""')}"`,
    `'${item.nik}`,
    `'${item.noRekeningBsi}`,
    `"${item.perusahaan.replace(/"/g, '""')}"`,
    `"${item.namaIbu.replace(/"/g, '""')}"`,
    `'${item.noHp}`,
    `"${item.linkKtp}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
