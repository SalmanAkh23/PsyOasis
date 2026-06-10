import React, { useEffect, useState } from 'react';

const trustData = [
  { label: 'Psikolog Berlisensi', value: 120, icon: '🧑‍⚕️' },
  { label: 'Konsultasi Rahasia', value: 98, icon: '🔒' },
  { label: 'Online & Tatap Muka', value: 100, icon: '💻' },
  { label: 'Dukungan Profesional', value: 95, icon: '🤝' },
];

const Counter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOut
      setCount(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span aria-label={`${value}%`}>{count}%</span>;
};

export const TrustSection: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Soft background tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#709085]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#4A7A96] mb-2 font-space">
            Terpercaya & Teruji
          </div>
          <h2 className="text-4xl font-bold text-[#2D3732] mb-4 font-space">Kepercayaan yang Terbukti</h2>
          <p className="text-lg text-[#2D3732]/60 font-light">Kami berkomitmen menyediakan layanan yang terpercaya, aman, dan profesional bagi setiap pengguna.</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {trustData.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-3 p-4 bg-white/65 backdrop-blur-sm rounded-xl border border-[#709085]/15 shadow-sm hover:shadow-md hover:border-[#709085]/25 transition-all duration-300">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-xl font-bold text-[#4A7A96] font-space">
                  <Counter value={item.value} />
                </div>
                <p className="text-sm text-[#2D3732]/60">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
