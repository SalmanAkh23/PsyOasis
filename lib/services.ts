export interface Service {
  id: string;
  title: string;
  label: string;
  desc: string;
  icon: string;
}

export const services: Service[] = [
  { id: 's1', title: 'Konseling Individu', label: 'Konseling Individu', desc: 'Bantu dirimu mengeksplorasi emosi dan rintangan pribadi secara privat.', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 's2', title: 'Konseling Pernikahan', label: 'Konseling Pernikahan', desc: 'Bangun harmoni, perbaiki komunikasi, dan temukan solusi terbaik untuk hubungan pasutri.', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { id: 's3', title: 'Konseling Keluarga', label: 'Konseling Keluarga', desc: 'Harmonisasikan hubungan antar anggota keluarga dan atasi konflik.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 's4', title: 'Konseling Remaja', label: 'Konseling Remaja', desc: 'Bimbingan khusus untuk mengatasi fase pencarian jati diri.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 's5', title: 'Konseling Anak', label: 'Konseling Anak', desc: 'Dukungan untuk tumbuh kembang emosional dan psikologis anak.', icon: 'M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5' },
  { id: 's6', title: 'Anxiety Therapy', label: 'Anxiety Therapy', desc: 'Atasi kecemasan berlebih, serangan panik, dan temukan ketenangan.', icon: 'M3 12h2m2-7l4 4-4 4M3 10v4m14-8l-4 4 4 4m2-4h2M12 3v2m0 14v2m7-7h2M5 12H3' },
  { id: 's7', title: 'Depression Therapy', label: 'Depression Therapy', desc: 'Temukan kembali harapan dan semangat hidup melalui terapi.', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 's8', title: 'Burnout Recovery', label: 'Burnout Recovery', desc: 'Pulihkan energi dari kelelahan mental akibat pekerjaan.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 's9', title: 'Career Counseling', label: 'Career Counseling', desc: 'Temukan arah karier yang tepat sesuai minat dan potensi diri.', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

export function getServiceById(id: string) {
  return services.find(s => s.id === id);
}
