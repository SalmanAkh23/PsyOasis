import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  {
    question: 'Bagaimana cara memesan konsultasi?',
    answer: 'Anda dapat memilih psikolog yang Anda inginkan, klik "Booking Konsultasi" pada profil mereka, kemudian pilih tanggal dan waktu yang tersedia.',
  },
  {
    question: 'Apakah layanan ini menjamin kerahasiaan?',
    answer: 'Ya, semua sesi konsultasi dienkripsi endâ€‘toâ€‘end dan data pribadi Anda tidak akan dibagikan ke pihak ketiga.',
  },
  {
    question: 'Apakah tersedia layanan konsultasi tatap muka?',
    answer: 'Kami menyediakan opsi konsultasi daring serta tatap muka di kotaâ€‘kota besar yang bekerjasama dengan mitra klinik kami.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="py-20 relative overflow-hidden" id="faq">
      {/* Soft background tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#006d31]/4 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#315ab4] mb-2 font-space">
            FAQ
          </div>
          <h2 className="text-4xl font-bold mb-8 text-[#1a1c1e] font-space">Pertanyaan yang Sering Diajukan</h2>
        </div>
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqData.map((item, idx) => (
            <div key={idx} className="bg-white/65 backdrop-blur-sm rounded-xl border border-[#006d31]/15 hover:border-[#006d31]/25 transition-all duration-300 shadow-sm overflow-hidden">
              <button
                className="w-full text-left flex justify-between items-center focus:outline-none px-6 py-5"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span className="text-base font-semibold text-[#1a1c1e] font-space">{item.question}</span>
                <span className={`text-[#315ab4] font-bold text-xl transition-transform duration-300 ${openIndex === idx ? 'rotate-45' : ''}`}>+</span>
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-5"
                  >
                    <p className="text-sm text-[#1a1c1e]/65 leading-relaxed font-light">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
