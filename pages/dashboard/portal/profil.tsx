import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { getPsychologistByUserId, updatePsychologistProfile, getPsychologistProfile } from '../../../lib/db-psikolog';
import { supabase } from '../../../lib/supabase';
import PortalLayout from '../../../components/dashboard/portal/Layout';
import { useToast } from '../../../components/ui/Toast';

const gelarOptions = [
  { value: '', label: 'Tidak ada gelar' },
  { value: 'S.Psi.', label: 'Sarjana Psikologi (S.Psi.)', desc: 'Lulusan S1 — belum bisa berpraktik menangani klien' },
  { value: 'M.Psi., Psikolog', label: 'Magister Profesi Psikologi (M.Psi., Psikolog)', desc: 'Jenjang S2 — memiliki izin praktik klinis maupun non-klinis' },
  { value: 'Dr.', label: 'Doktor (Dr.)', desc: 'Gelar akademik S3 — fokus pada penelitian dan akademisi' },
  { value: 'Ph.D.', label: 'Doktor (Ph.D.)', desc: 'Gelar akademik S3 — fokus pada penelitian dan akademisi' },
];

const serviceOptions = [
  { id: 's1', label: 'Konseling Individu' },
  { id: 's2', label: 'Konseling Pernikahan' },
  { id: 's3', label: 'Konseling Keluarga' },
  { id: 's4', label: 'Konseling Remaja' },
  { id: 's5', label: 'Konseling Anak' },
  { id: 's6', label: 'Anxiety Therapy' },
  { id: 's7', label: 'Depression Therapy' },
  { id: 's8', label: 'Burnout Recovery' },
  { id: 's9', label: 'Career Counseling' },
];

export default function PortalProfil() {
  const { user, loading } = useAuth() as any;
  const { showToast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [psychologistId, setPsychologistId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [name, setName] = useState('');
  const [gelar, setGelar] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [fee, setFee] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    getPsychologistByUserId(user.uid).then((prof) => {
      if (prof?.id) {
        setPsychologistId(prof.id);
        getPsychologistProfile(prof.id).then((p) => {
          if (p) {
            setName(p.name || user.displayName || '');
            setGelar(p.gelar || '');
            setSpecialty(p.specialty || '');
            setFee(p.fee || '');
            setExperience(p.experience || '');
            setBio(p.bio || '');
            setPhotoUrl(p.photoUrl || '');
            setTagsInput((p.tags || []).join(', '));
            setSelectedServices(p.serviceIds || []);
          }
        }).finally(() => setLoadingProfile(false));
      } else {
        setLoadingProfile(false);
      }
    });
  }, [user]);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !psychologistId) return;

    setUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `psychologists/${psychologistId}/profile.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('psychologist-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('psychologist-photos')
        .getPublicUrl(filePath);

      setPhotoUrl(publicUrlData.publicUrl);
      showToast('success', 'Foto berhasil diunggah');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengunggah foto');
    }
    setUploadingPhoto(false);
  };

  const handleSave = async () => {
    if (!psychologistId) return;
    setSaving(true);
    try {
      const updated = await updatePsychologistProfile(psychologistId, {
        name,
        gelar,
        specialty,
        fee,
        experience,
        bio,
        photo_url: photoUrl,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        service_ids: selectedServices,
      });
      if (updated) {
        setName(updated.name || '');
        setGelar(updated.gelar || '');
        setSpecialty(updated.specialty || '');
        setFee(updated.fee || '');
        setExperience(updated.experience || '');
        setBio(updated.bio || '');
        setPhotoUrl(updated.photoUrl || '');
        setTagsInput((updated.tags || []).join(', '));
        setSelectedServices(updated.serviceIds || []);
      }
      showToast('success', 'Profil praktik berhasil disimpan');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan profil');
    }
    setSaving(false);
  };

  if (loading || loadingProfile) return null;
  if (!user || !psychologistId) return null;

  const displayName = gelar ? `${name}, ${gelar}` : name;
  const photoInitial = name.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      <Head><title>Profil Praktik – PsyOasis</title></Head>
      <PortalLayout title="Profil Praktik" doctorName={displayName || user?.displayName || 'Dr. Smith'}>
        <div className="space-y-6 max-w-2xl">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Profil Praktik</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Informasi ini akan ditampilkan kepada klien saat melakukan booking.
            </p>
          </div>

          {/* Foto Profil */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 space-y-4">
            <h3 className="font-label-md text-label-md text-on-surface">Foto Profil</h3>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-primary-container overflow-hidden border border-outline-variant/30 flex items-center justify-center text-on-primary-container font-headline-lg font-bold shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  photoInitial
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container transition-all disabled:opacity-50"
                >
                  {uploadingPhoto ? 'Mengunggah...' : 'Upload Foto'}
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-low transition-all"
                  >
                    Hapus
                  </button>
                )}
                <p className="font-caption text-caption text-outline">Format JPG/PNG, maks 2MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Informasi Praktik */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 space-y-5">
            <h3 className="font-label-md text-label-md text-on-surface">Informasi Praktik</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">Nama Lengkap</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Wijaya"
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">Gelar</label>
                <select
                  value={gelar}
                  onChange={(e) => setGelar(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none"
                >
                  {gelarOptions.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {gelar && (
              <div className="p-3 rounded-xl bg-surface-variant/50 text-xs text-on-surface-variant leading-relaxed">
                {gelarOptions.find(g => g.value === gelar)?.desc}
              </div>
            )}

            {displayName && (
              <div className="p-3 rounded-xl bg-primary-fixed/20 border border-primary/20 text-xs text-primary font-medium">
                Nama tampil: <strong>{displayName}</strong>
              </div>
            )}

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">Spesialisasi</label>
              <input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Spesialis Anxiety & Stress"
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">Biaya Sesi (Rp)</label>
                <input
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="Rp 350.000"
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">Pengalaman</label>
                <input
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="10 Tahun"
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">Bio / Tentang</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ceritakan tentang diri Anda, pendekatan terapi, dan pengalaman..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* Keahlian (Tags) */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 space-y-4">
            <h3 className="font-label-md text-label-md text-on-surface">Keahlian (Tags)</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              Pisahkan dengan koma. Contoh: Anxiety, Stress, Depression
            </p>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Anxiety, Stress, Depression, Trauma"
              className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
            {tagsInput && (
              <div className="flex flex-wrap gap-2">
                {tagsInput.split(',').map((t, i) => {
                  const tag = t.trim();
                  if (!tag) return null;
                  return (
                    <span key={i} className="px-3 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container text-xs font-medium">
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Layanan yang Ditawarkan */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 space-y-4">
            <h3 className="font-label-md text-label-md text-on-surface">Layanan yang Ditawarkan</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              Pilih layanan konseling yang Anda sediakan.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {serviceOptions.map((svc) => {
                const active = selectedServices.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggleService(svc.id)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                      active
                        ? 'border-primary bg-primary/8 text-primary'
                        : 'border-outline-variant text-on-surface-variant hover:border-primary/30'
                    }`}
                  >
                    {svc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end gap-3 pb-8">
            <button
              onClick={() => router.push('/dashboard/portal')}
              className="px-6 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Profil'
              )}
            </button>
          </div>
        </div>
      </PortalLayout>
    </>
  );
}