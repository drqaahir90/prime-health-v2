import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { db } from '../lib/db';
import { useLanguage } from '../contexts/LanguageContext';
import type { Service } from '../types';

function getL(item: any, field: string, lang: string): string {
  if (lang === 'ar') return item[field + 'Ar'] || item[field] || '';
  if (lang === 'so') return item[field + 'So'] || item[field] || '';
  return item[field] || '';
}

export default function Services() {
  const { t, lang } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);

  const load = () => setServices(db.query<Service>('services', { active: true }, { field: 'order', direction: 'asc' }));
  useEffect(() => { load(); return db.subscribe('services', load); }, []);

  if (services.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl mb-4 block">🏥</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('nav.services', 'Services')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('common.noData', 'No data available')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        {t('nav.services', 'Our Services')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="card hover:shadow-lg transition-all overflow-hidden">
            {service.image && (
              <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                <img src={service.image} alt={getL(service, 'name', lang)} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start gap-3 mb-3">
                {service.icon && <span className="text-3xl shrink-0">{service.icon}</span>}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getL(service, 'name', lang)}
                  </h2>
                  {service.price > 0 && (
                    <p className="text-primary-600 font-medium text-sm">{service.currency} {service.price}</p>
                  )}
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {getL(service, 'description', lang)}
              </p>
              <Link
                to={`/consultation?service=${service.id}`}
                className="text-primary-600 text-sm font-medium mt-4 inline-flex items-center gap-1 hover:underline"
              >
                {t('nav.consultation', 'Book Now')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
