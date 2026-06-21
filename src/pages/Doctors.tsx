import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { db } from '../lib/db';
import { useLanguage } from '../contexts/LanguageContext';
import type { Doctor, Service } from '../types';

function getL(item: any, field: string, lang: string): string {
  if (lang === 'ar') return item[field + 'Ar'] || item[field] || '';
  if (lang === 'so') return item[field + 'So'] || item[field] || '';
  return item[field] || '';
}

export function DoctorsPage() {
  const { t, lang } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const load = () => {
    setDoctors(db.query<Doctor>('doctors', { active: true }, { field: 'order', direction: 'asc' }));
  };

  useEffect(() => {
    load();
    return db.subscribe('doctors', load);
  }, []);

  if (doctors.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl mb-4 block">👨‍⚕️</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('nav.doctors', 'Doctors')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('common.noData', 'No data available')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        {t('nav.doctors', 'Our Doctors')}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {doctors.map(doctor => (
          <Link key={doctor.id} to={`/doctors/${doctor.id}`} className="card group hover:shadow-lg transition-all">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800">
              {doctor.photo ? (
                <img src={doctor.photo} alt={getL(doctor, 'name', lang)} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">👨‍⚕️</div>
              )}
            </div>
            <div className="p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                {getL(doctor, 'name', lang)}
              </h2>
              <p className="text-sm text-primary-600 font-medium">{getL(doctor, 'position', lang)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getL(doctor, 'qualification', lang)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function DoctorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const load = () => {
    if (id) {
      const d = db.getById<Doctor>('doctors', id);
      setDoctor(d);
      if (d?.serviceIds?.length) {
        const allServices = db.getAll<Service>('services');
        setServices(allServices.filter(s => d.serviceIds.includes(s.id)));
      }
    }
  };

  useEffect(() => {
    load();
    const unsubDocs = db.subscribe('doctors', load);
    const unsubServices = db.subscribe('services', load);
    return () => {
      unsubDocs();
      unsubServices();
    };
  }, [id]);

  if (!doctor) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-500">{t('common.noData', 'Not found')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> {t('common.back', 'Back')}
      </button>

      <div className="card overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 aspect-square bg-gray-100 dark:bg-gray-800 shrink-0">
            {doctor.photo ? (
              <img src={doctor.photo} alt={getL(doctor, 'name', lang)} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl text-gray-300">👨‍⚕️</div>
            )}
          </div>
          <div className="p-6 md:p-8 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {getL(doctor, 'name', lang)}
            </h1>
            <p className="text-primary-600 font-medium text-lg">{getL(doctor, 'position', lang)}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{getL(doctor, 'qualification', lang)}</p>

            {doctor.socialLinks?.length > 0 && (
              <div className="flex gap-3 mt-4">
                {doctor.socialLinks.map((sl, i) => (
                  <a key={i} href={sl.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                    {sl.platform} <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}

            <Link to="/consultation" className="btn-primary mt-6 inline-flex">
              {t('nav.consultation', 'Book Consultation')}
            </Link>
          </div>
        </div>

        {/* Biography */}
        {doctor.biography && (
          <div className="px-6 md:px-8 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6 border-t pt-6 dark:border-gray-700">
              {lang === 'ar' ? 'السيرة الذاتية' : lang === 'so' ? 'Taariikhda Nololeed' : 'Biography'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
              {getL(doctor, 'biography', lang)}
            </p>
          </div>
        )}

        {/* Certificates */}
        {doctor.certificates?.length > 0 && (
          <div className="px-6 md:px-8 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {lang === 'ar' ? 'الشهادات' : lang === 'so' ? 'Shahaadooyinka' : 'Certificates'}
            </h2>
            <ul className="space-y-1">
              {doctor.certificates.map((cert, i) => (
                <li key={i} className="text-gray-600 dark:text-gray-400 text-sm flex items-start gap-2">
                  <span className="text-primary-600 mt-0.5">✓</span> {cert}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Services */}
        {services.length > 0 && (
          <div className="px-6 md:px-8 pb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('nav.services', 'Services')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {services.map(s => (
                <span key={s.id} className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-3 py-1">
                  {getL(s, 'name', lang)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
