import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import rawData from './data/penerimaBsu.json';
import { PenerimaBsu, SearchMode } from './types/bsu';
import {
  Search,
  X,
  CreditCard,
  User,
  Building2,
  Phone,
  Heart,
  Copy,
  Check,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  EyeOff,
  ExternalLink,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { maskNik, maskPhone, formatAccountNumber, exportToCsv } from './utils/formatters';

export default function App() {
  const dataset = rawData as unknown as PenerimaBsu[];

  // Search & view states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('all');
  const [selectedPerusahaan, setSelectedPerusahaan] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [isMasked, setIsMasked] = useState(false);

  // Table pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyRekening = (id: string, rekening: string) => {
    navigator.clipboard.writeText(rekening);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Distinct company list
  const companies = useMemo(() => {
    const list = Array.from(new Set(dataset.map((d) => d.perusahaan.trim()))).filter(
      (c) => c && c !== '-'
    );
    return list.sort((a, b) => a.localeCompare(b));
  }, [dataset]);

  // Filtered search results
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const cleanNumQuery = query.replace(/[^0-9]/g, '');

    return dataset.filter((item) => {
      // Company dropdown filter
      if (selectedPerusahaan && item.perusahaan !== selectedPerusahaan) {
        return false;
      }

      if (!query) {
        return true;
      }

      const itemNikClean = item.nik.replace(/[^0-9]/g, '');
      const itemNama = item.nama.toLowerCase();
      const itemCorp = item.perusahaan.toLowerCase();
      const itemRek = item.noRekeningBsi.toLowerCase();
      const itemIbu = item.namaIbu.toLowerCase();

      if (searchMode === 'nik') {
        return (
          item.nik.toLowerCase().includes(query) ||
          (cleanNumQuery.length >= 3 && itemNikClean.includes(cleanNumQuery))
        );
      }

      if (searchMode === 'nama') {
        return itemNama.includes(query);
      }

      if (searchMode === 'perusahaan') {
        return itemCorp.includes(query);
      }

      // 'all'
      return (
        itemNama.includes(query) ||
        item.nik.toLowerCase().includes(query) ||
        (cleanNumQuery.length >= 3 && itemNikClean.includes(cleanNumQuery)) ||
        itemCorp.includes(query) ||
        itemRek.includes(query) ||
        itemIbu.includes(query)
      );
    });
  }, [dataset, searchQuery, searchMode, selectedPerusahaan]);

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchMode, selectedPerusahaan]);

  // Celebration confetti when exactly one person is matched
  useEffect(() => {
    if (searchQuery.trim().length >= 4 && searchResults.length === 1) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  }, [searchQuery, searchResults.length]);

  // Paginated table data
  const totalPages = Math.ceil(searchResults.length / pageSize) || 1;
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return searchResults.slice(start, start + pageSize);
  }, [searchResults, currentPage, pageSize]);

  const sampleChips = [
    { label: 'TEONI HALAWA', query: 'TEONI HALAWA', mode: 'nama' as SearchMode },
    { label: 'NIK: 1214081206030002', query: '1214081206030002', mode: 'nik' as SearchMode },
    { label: 'SOPYAN PANDU', query: 'SOPYAN PANDU', mode: 'nama' as SearchMode },
    { label: 'PT CITRA BUANA PRAKARSA', query: 'CITRA BUANA PRAKARSA', mode: 'perusahaan' as SearchMode },
    { label: 'PT JOGOBOYO', query: 'JOGOBOYO', mode: 'perusahaan' as SearchMode },
    { label: 'NIK: 2171070211029009', query: '2171070211029009', mode: 'nik' as SearchMode }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Simple Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                Pencarian Rekening Bank
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Pencarian Data Kepemilikan Nomor Rekening Bank
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMasked(!isMasked)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Sensor / Tampilkan NIK & No HP"
            >
              {isMasked ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Sensor: Aktif</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Sensor: Mati</span>
                </>
              )}
            </button>

            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium">
              {dataset.length} Data
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Simple Search Box Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 mb-8">
          <div className="max-w-2xl mx-auto text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Cari Kepemilikan Nomor Rekening
            </h2>
            <p className="text-sm text-slate-500">
              Cari data nomor rekening bank melalui Nomor Identitas Diri (NIK) atau Nama Lengkap.
            </p>
          </div>

          {/* Search Inputs */}
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-3xl mx-auto">
            {/* Search Mode */}
            <div className="sm:w-44 shrink-0">
              <label className="sr-only">Kategori Pencarian</label>
              <select
                value={searchMode}
                onChange={(e) => setSearchMode(e.target.value as SearchMode)}
                className="w-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl px-3.5 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                <option value="nik">Nomor NIK (KTP)</option>
                <option value="nama">Nama Lengkap</option>
                <option value="perusahaan">Nama Perusahaan</option>
              </select>
            </div>

            {/* Query Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchMode === 'nik'
                    ? 'Masukkan NIK KTP (contoh: 1214081206...)'
                    : searchMode === 'nama'
                    ? 'Masukkan Nama Lengkap (contoh: TEONI HALAWA)'
                    : searchMode === 'perusahaan'
                    ? 'Masukkan Nama Perusahaan...'
                    : 'Ketik NIK KTP atau Nama Lengkap...'
                }
                className="w-full pl-10 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Perusahaan Dropdown */}
            <div className="sm:w-52 shrink-0">
              <label className="sr-only">Filter Perusahaan</label>
              <div className="relative">
                <select
                  value={selectedPerusahaan}
                  onChange={(e) => setSelectedPerusahaan(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none truncate cursor-pointer"
                >
                  <option value="">Semua Perusahaan ({companies.length})</option>
                  {companies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Search Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
            <span className="mr-1 text-[11px] font-medium">Contoh:</span>
            {sampleChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(chip.query);
                  setSearchMode(chip.mode);
                  setSelectedPerusahaan('');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition text-[11px] cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
            {(searchQuery || selectedPerusahaan) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPerusahaan('');
                  setSearchMode('all');
                }}
                className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-[11px] font-semibold transition cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Search Results Summary & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm sm:text-base">
              Hasil Pencarian:
            </span>
            <span className="font-mono text-xs font-bold bg-slate-200/80 text-slate-800 px-2.5 py-0.5 rounded-full">
              {searchResults.length} Data
            </span>
            {searchQuery && (
              <span className="text-xs text-slate-500 truncate max-w-xs">
                untuk &quot;{searchQuery}&quot;
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="bg-slate-200/70 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'card'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kartu</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabel</span>
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={() => exportToCsv(searchResults, 'hasil_pencarian_rekening.csv')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Unduh Data dalam format CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Results Presentation */}
        {searchResults.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">
              Tidak Ada Data yang Cocok
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Tidak ditemukan data dengan kata kunci &quot;{searchQuery}&quot;. Periksa kembali ejaan nama atau nomor NIK KTP Anda.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPerusahaan('');
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Tampilkan Semua Data
            </button>
          </div>
        ) : viewMode === 'card' ? (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {searchResults.slice(0, 60).map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Header: Rekening Bank */}
                    <div className="bg-slate-900 text-white p-4 rounded-xl">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-medium mb-1">
                        <span>Nomor Rekening Bank</span>
                        <span className="font-mono text-emerald-400 font-bold">{item.id}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-emerald-300 select-all">
                          {formatAccountNumber(item.noRekeningBsi)}
                        </span>
                        <button
                          onClick={() => handleCopyRekening(item.id, item.noRekeningBsi)}
                          className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md transition cursor-pointer"
                          title="Salin Nomor Rekening"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Disalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Participant Details */}
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">
                        Nama Pemilik (sesuai KTP)
                      </div>
                      <div className="text-sm font-bold text-slate-900 uppercase">
                        {item.nama}
                      </div>
                    </div>

                    {/* NIK & Ibu Kandung */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">
                          NIK KTP
                        </div>
                        <div className="font-mono text-slate-800 font-medium">
                          {maskNik(item.nik, isMasked)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">
                          Nama Ibu Kandung
                        </div>
                        <div className="text-slate-800 font-medium truncate" title={item.namaIbu}>
                          {item.namaIbu || '-'}
                        </div>
                      </div>
                    </div>

                    {/* Perusahaan */}
                    <div className="text-xs pt-1 border-t border-slate-100">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">
                        Nama Perusahaan
                      </div>
                      <div className="text-slate-800 font-medium line-clamp-2" title={item.perusahaan}>
                        {item.perusahaan}
                      </div>
                    </div>

                    {/* Nomor Handphone */}
                    <div className="text-xs pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        No. Handphone
                      </span>
                      <span className="font-mono text-slate-800 font-medium">
                        {maskPhone(item.noHp, isMasked)}
                      </span>
                    </div>

                    {/* Link File KTP */}
                    {item.linkKtp && (
                      <div className="pt-1">
                        <a
                          href={item.linkKtp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                        >
                          <span>Buka Berkas KTP Terlampir</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3">Nama Lengkap (KTP)</th>
                    <th className="py-3 px-3">NIK</th>
                    <th className="py-3 px-3">Nomor Rekening</th>
                    <th className="py-3 px-3">Perusahaan</th>
                    <th className="py-3 px-3">Nama Ibu Kandung</th>
                    <th className="py-3 px-3">No. HP</th>
                    <th className="py-3 px-3 text-center">Berkas KTP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedResults.map((item, idx) => {
                    const number = (currentPage - 1) * pageSize + idx + 1;
                    const isCopied = copiedId === item.id;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 text-center text-slate-400 font-mono">
                          {number}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 uppercase">
                          {item.nama}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          {maskNik(item.nik, isMasked)}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 select-all">
                              {formatAccountNumber(item.noRekeningBsi)}
                            </span>
                            <button
                              onClick={() => handleCopyRekening(item.id, item.noRekeningBsi)}
                              className="p-1 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                              title="Salin No. Rekening"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 max-w-xs truncate" title={item.perusahaan}>
                          {item.perusahaan}
                        </td>
                        <td className="py-3 px-3 text-slate-700 truncate max-w-[120px]" title={item.namaIbu}>
                          {item.namaIbu || '-'}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          {maskPhone(item.noHp, isMasked)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {item.linkKtp ? (
                            <a
                              href={item.linkKtp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline font-semibold"
                            >
                              <span>Lihat</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Menampilkan{' '}
                <span className="font-semibold text-slate-800">
                  {(currentPage - 1) * pageSize + 1}
                </span>{' '}
                hingga{' '}
                <span className="font-semibold text-slate-800">
                  {Math.min(currentPage * pageSize, searchResults.length)}
                </span>{' '}
                dari <span className="font-semibold text-slate-800">{searchResults.length}</span> data
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium text-slate-700 px-2">
                  Hal. {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notice if searchResults in card view has more items */}
        {viewMode === 'card' && searchResults.length > 60 && (
          <div className="mt-6 text-center text-xs text-slate-500">
            Menampilkan 60 data teratas dari {searchResults.length} hasil.{' '}
            <button
              onClick={() => setViewMode('table')}
              className="text-slate-900 font-semibold underline cursor-pointer"
            >
              Beralih ke Tampilan Tabel untuk navigasi halaman lengkap
            </button>
            .
          </div>
        )}
      </main>
    </div>
  );
}
