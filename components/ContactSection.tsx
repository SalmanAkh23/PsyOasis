import React from 'react';

const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      {/* Soft background tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#315ab4]/4 to-transparent pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#315ab4] mb-2 font-space">
          Kontak
        </div>
        <h2 className="text-3xl font-bold mb-4 text-[#1a1c1e] font-space">Hubungi Kami</h2>
        <p className="mb-8 text-sm text-[#1a1c1e]/60 leading-relaxed font-light">
          Jika Anda memiliki pertanyaan atau ingin bantuan, silakan kirimkan pesan melalui formulir di bawah atau email kami di{' '}
          <a href="mailto:support@psyoasis.id" className="text-[#315ab4] hover:underline font-medium">support@psyoasis.id</a>.
        </p>
        <form className="flex flex-col gap-4 bg-white/65 backdrop-blur-sm p-8 rounded-2xl border border-[#006d31]/15 shadow-sm">
          <input
            aria-label="name"
            placeholder="Nama"
            className="px-4 py-3 rounded-xl bg-[#F7F9F6] border border-[#006d31]/20 text-[#1a1c1e] placeholder-[#006d31]/60 focus:outline-none focus:border-[#315ab4]/50 focus:ring-2 focus:ring-[#315ab4]/10 transition-all text-sm psy-input"
          />
          <input
            aria-label="email"
            placeholder="Email"
            className="px-4 py-3 rounded-xl bg-[#F7F9F6] border border-[#006d31]/20 text-[#1a1c1e] placeholder-[#006d31]/60 focus:outline-none focus:border-[#315ab4]/50 focus:ring-2 focus:ring-[#315ab4]/10 transition-all text-sm psy-input"
          />
          <textarea
            aria-label="message"
            placeholder="Pesan"
            className="px-4 py-3 rounded-xl bg-[#F7F9F6] border border-[#006d31]/20 text-[#1a1c1e] placeholder-[#006d31]/60 focus:outline-none focus:border-[#315ab4]/50 focus:ring-2 focus:ring-[#315ab4]/10 transition-all h-32 resize-none text-sm psy-textarea"
          />
          <button
            type="button"
            onClick={() => alert('Pesan berhasil dikirim!')}
            className="mt-2 inline-block bg-[#315ab4] hover:bg-[#3D6B82] px-4 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-300 shadow-[0_4px_15px_rgba(74,122,150,0.25)] hover:shadow-[0_4px_20px_rgba(74,122,150,0.35)]"
          >
            Kirim Pesan
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
