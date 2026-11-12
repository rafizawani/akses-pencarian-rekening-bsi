export interface PenerimaBsu {
  id: string;
  page: number;
  perusahaan: string;
  nama: string;
  nik: string;
  noHp: string;
  namaIbu: string;
  linkKtp: string;
  noRekeningBsi: string;
  bank?: string;
}

export type SearchMode = 'all' | 'nik' | 'nama' | 'perusahaan';
