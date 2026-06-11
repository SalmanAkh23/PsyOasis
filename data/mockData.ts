export const mockPsychologists = [
  {
    id: 'p1',
    name: 'Dr. Sarah Wijaya, M.Psi.',
    role: 'Psikolog Klinis',
    specialty: 'Spesialis Anxiety & Stress',
    fee: 'Rp 350.000',
    experience: '10 Tahun Pengalaman',
    rating: 4.9,
    reviews: 124,
    status: 'online',
    tags: ['Anxiety', 'Stress', 'Depression'],
    avatarChar: '👩‍⚕️',
    avatarBg: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'p2',
    name: 'Dr. Michael Tan, M.Psi.',
    role: 'Psikolog Hubungan',
    specialty: 'Spesialis Relationship',
    fee: 'Rp 400.000',
    experience: '8 Tahun Pengalaman',
    rating: 4.8,
    reviews: 98,
    status: 'offline',
    tags: ['Marriage', 'Relationship', 'Family'],
    avatarChar: '👨‍⚕️',
    avatarBg: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'p3',
    name: 'Dr. Amanda Putri, M.Psi.',
    role: 'Psikolog Industri',
    specialty: 'Spesialis Burnout',
    fee: 'Rp 300.000',
    experience: '6 Tahun Pengalaman',
    rating: 4.9,
    reviews: 210,
    status: 'online',
    tags: ['Career', 'Burnout', 'Workplace'],
    avatarChar: '👩‍⚕️',
    avatarBg: 'from-rose-400 to-pink-600',
  },
  {
    id: 'p4',
    name: 'Budi Santoso, M.Psi.',
    role: 'Psikolog Anak',
    specialty: 'Spesialis Tumbuh Kembang',
    fee: 'Rp 250.000',
    experience: '12 Tahun Pengalaman',
    rating: 4.7,
    reviews: 87,
    status: 'online',
    tags: ['Youth', 'Family Issues', 'Parenting'],
    avatarChar: '👨‍⚕️',
    avatarBg: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'p5',
    name: 'Dr. Anita Sitorus',
    role: 'Psikolog Klinis Utama',
    specialty: 'Spesialis Trauma & PTSD',
    fee: 'Rp 450.000',
    experience: '15 Tahun Pengalaman',
    rating: 5.0,
    reviews: 305,
    status: 'offline',
    tags: ['Trauma', 'PTSD', 'Depression'],
    avatarChar: '👩‍⚕️',
    avatarBg: 'from-fuchsia-500 to-purple-600',
  },
  {
    id: 'p6',
    name: 'Dr. Kevin Pratama, M.Psi.',
    role: 'Psikolog Remaja',
    specialty: 'Spesialis Krisis Identitas',
    fee: 'Rp 300.000',
    experience: '5 Tahun Pengalaman',
    rating: 4.8,
    reviews: 64,
    status: 'online',
    tags: ['Youth', 'Identity', 'Self-Esteem'],
    avatarChar: '👨‍⚕️',
    avatarBg: 'from-amber-400 to-orange-600',
  },
];

export const mockServices = [
  {
    id: 's1',
    title: 'Konseling Individu',
    desc: 'Bantu dirimu mengeksplorasi emosi dan rintangan pribadi secara privat.',
    icon: '👤',
  },
  {
    id: 's2',
    title: 'Konseling Pernikahan',
    desc: 'Bangun harmoni dan temukan solusi terbaik untuk hubungan pasutri.',
    icon: '💍',
  },
  {
    id: 's3',
    title: 'Konseling Keluarga',
    desc: 'Harmonisasikan hubungan antar anggota keluarga dan atasi konflik.',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 's4',
    title: 'Konseling Remaja',
    desc: 'Bimbingan khusus untuk mengatasi fase pencarian jati diri.',
    icon: '🎓',
  },
  {
    id: 's5',
    title: 'Konseling Anak',
    desc: 'Dukungan untuk tumbuh kembang emosional dan psikologis anak.',
    icon: '🧸',
  },
  {
    id: 's6',
    title: 'Anxiety Therapy',
    desc: 'Atasi kecemasan berlebih, serangan panik, dan temukan ketenangan.',
    icon: '🧘',
  },
  {
    id: 's7',
    title: 'Depression Therapy',
    desc: 'Temukan kembali harapan dan semangat hidup melalui terapi.',
    icon: '🌤️',
  },
  {
    id: 's8',
    title: 'Burnout Recovery',
    desc: 'Pulihkan energi dari kelelahan mental akibat pekerjaan.',
    icon: '🔋',
  },
  {
    id: 's9',
    title: 'Career Counseling',
    desc: 'Temukan arah karier yang tepat sesuai minat dan potensi diri.',
    icon: '💼',
  },
];

export const mockDates = [
  // Generates next 7 days dynamically for realism
  ...Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start from tomorrow
    return {
      dateObj: d,
      dayName: d.toLocaleDateString('id-ID', { weekday: 'long' }),
      dateNumber: d.getDate(),
      monthName: d.toLocaleDateString('id-ID', { month: 'short' }),
      fullDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  })
];

export const mockTimes = [
  '09:00', '10:00', '11:00', '13:00', 
  '14:00', '15:00', '16:00', '19:00', '20:00'
];
