import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../lib/db';
import { useLanguage } from '../contexts/LanguageContext';
import type { HomeSection, Doctor, Service, Testimonial, Poster } from '../types';

function getLocalizedField(item: any, field: string, lang: string): string {
  if (lang === 'ar') return item[field + 'Ar'] || item[field] || '';
  if (lang === 'so') return item[field + 'So'] || item[field] || '';
  return item[field] || '';
}

export default function Home() {
  const { t, lang, isRTL } = useLanguage();
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [posterIdx, setPosterIdx] = useState(0);

  const loadHome = () => {
    setSections(db.query<HomeSection>('home_sections', { active: true }, { field: 'order', direction: 'asc' }));
    setDoctors(db.query<Doctor>('doctors', { active: true }, { field: 'order', direction: 'asc' }));
    setServices(db.query<Service>('services', { active: true }, { field: 'order', direction: 'asc' }));
    setTestimonials(db.query<Testimonial>('testimonials', { active: true }, { field: 'order', direction: 'asc' }));
    setPosters(db.query<Poster>('posters', { active: true }, { field: 'order', direction: 'asc' }));
  };

  useEffect(() => {
    loadHome();
    const unsubSections = db.subscribe('home_sections', loadHome);
    const unsubDoctors = db.subscribe('doctors', loadHome);
    const unsubServices = db.subscribe('services', loadHome);
    const unsubTestimonials = db.subscribe('testimonials', loadHome);
    const unsubPosters = db.subscribe('posters', loadHome);
    return () => {
      unsubSections();
      unsubDoctors();
      unsubServices();
      unsubTestimonials();
      unsubPosters();
    };
  }, []);

  const hasContent = sections.length > 0 || doctors.length > 0 || services.length > 0;

  if (!hasContent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🏥</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {lang === 'ar' ? 'برايم هيلث للاستشارات' : 'Prime Health Consult'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('common.comingSoon', 'Coming Soon')}
          </p>
          <Link to="/consultation" className="btn-primary">
            {t('nav.consultation', 'Book Consultation')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Dynamic sections */}
      {sections.map(section => {
        switch (section.type) {
          case 'hero':
            return (
              <section key={section.id} className="relative text-white overflow-hidden">
                {section.image && (
                  <div className="absolute inset-0">
                    <img src={section.image} alt="" className="w-full h-full object-cover opacity-100" />
                  </div>
                )}
                <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
                  <div className="max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                      {getLocalizedField(section, 'title', lang)}
                    </h1>
                    {section.subtitle && (
                      <p className="text-lg md:text-xl text-primary-100 mb-8">
                        {getLocalizedField(section, 'subtitle', lang)}
                      </p>
                    )}
                    {section.buttonText && (
                      <Link to={section.buttonLink || '/consultation'} className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                        {getLocalizedField(section, 'buttonText', lang)}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </section>
            );

          case 'cta':
            return (
              <section key={section.id} className="bg-primary-50 dark:bg-primary-950/30 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {getLocalizedField(section, 'title', lang)}
                  </h2>
                  {section.subtitle && (
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                      {getLocalizedField(section, 'subtitle', lang)}
                    </p>
                  )}
                  {section.buttonText && (
                    <Link to={section.buttonLink || '/consultation'} className="btn-primary text-base px-8 py-3">
                      {getLocalizedField(section, 'buttonText', lang)}
                    </Link>
                  )}
                </div>
              </section>
            );

          case 'custom':
            return (
              <section key={section.id} className="py-16">
                <div className="max-w-4xl mx-auto px-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                    {getLocalizedField(section, 'title', lang)}
                  </h2>
                  {section.content && (
                    <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {getLocalizedField(section, 'content', lang)}
                    </div>
                  )}
                </div>
              </section>
            );

          default:
            return null;
        }
      })}

      {/* Services section - if services exist */}
      {services.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              {t('nav.services', 'Our Services')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-10 max-w-xl mx-auto">
              {/* Dynamic subtitle from section if exists */}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.slice(0, 6).map(service => (
                <div key={service.id} className="card p-6 hover:shadow-md transition-shadow">
                  {service.icon && <span className="text-3xl mb-3 block">{service.icon}</span>}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {getLocalizedField(service, 'name', lang)}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">
                    {getLocalizedField(service, 'description', lang)}
                  </p>
                  <Link to="/consultation" className="text-primary-600 text-sm font-medium mt-3 inline-flex items-center gap-1 hover:underline">
                    {t('nav.consultation', 'Book Now')} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
            {services.length > 6 && (
              <div className="text-center mt-8">
                <Link to="/services" className="btn-outline">
                  {t('common.readMore', 'View All Services')}
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Doctors section */}
      {doctors.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
              {t('nav.doctors', 'Our Doctors')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {doctors.slice(0, 4).map(doctor => (
                <Link key={doctor.id} to={`/doctors/${doctor.id}`} className="card group hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                    {doctor.photo ? (
                      <img src={doctor.photo} alt={getLocalizedField(doctor, 'name', lang)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                        👨‍⚕️
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                      {getLocalizedField(doctor, 'name', lang)}
                    </h3>
                    <p className="text-sm text-primary-600">{getLocalizedField(doctor, 'position', lang)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getLocalizedField(doctor, 'qualification', lang)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {doctors.length > 4 && (
              <div className="text-center mt-8">
                <Link to="/doctors" className="btn-outline">
                  {t('common.readMore', 'View All Doctors')}
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Posters carousel */}
      {posters.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="relative">
              <div className="aspect-[4/5] sm:aspect-video rounded-xl overflow-hidden">
                <img
                  src={posters[posterIdx]?.image}
                  alt={getLocalizedField(posters[posterIdx], 'title', lang)}
                  className="w-full h-full object-cover"
                />
                {posters[posterIdx]?.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-6">
                    <h3 className="text-white text-xl font-bold">
                      {getLocalizedField(posters[posterIdx], 'title', lang)}
                    </h3>
                  </div>
                )}
              </div>
              {posters.length > 1 && (
                <>
                  <button
                    onClick={() => setPosterIdx(i => (i - 1 + posters.length) % posters.length)}
                    className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow"
                  >
                    {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setPosterIdx(i => (i + 1) % posters.length)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow"
                  >
                    {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <div className="flex justify-center gap-2 mt-4">
                    {posters.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPosterIdx(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === posterIdx ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
              {lang === 'ar' ? 'آراء المرضى' : lang === 'so' ? 'Ra\'yiga Bukaanka' : 'What Patients Say'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map(test => (
                <div key={test.id} className="card p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < test.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 italic">
                    "{getLocalizedField(test, 'content', lang)}"
                  </p>
                  <div className="flex items-center gap-3">
                    {test.photo ? (
                      <img src={test.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-semibold">
                        {(getLocalizedField(test, 'name', lang) || '?')[0]}
                      </div>
                    )}
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {getLocalizedField(test, 'name', lang)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

