import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { db } from '../lib/db';
import { useLanguage } from '../contexts/LanguageContext';
import type { FAQItem } from '../types';

function getL(item: any, field: string, lang: string): string {
  if (lang === 'ar') return item[field + 'Ar'] || item[field] || '';
  if (lang === 'so') return item[field + 'So'] || item[field] || '';
  return item[field] || '';
}

export default function FAQ() {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState<FAQItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = () => setItems(db.query<FAQItem>('faq', { active: true }, { field: 'order', direction: 'asc' }));
  useEffect(() => { load(); return db.subscribe('faq', load); }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl mb-4 block">❓</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('nav.faq', 'FAQ')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('common.noData', 'No data available')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        {t('nav.faq', 'Frequently Asked Questions')}
      </h1>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="card">
            <button
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span className="font-medium text-gray-900 dark:text-white pr-4">
                {getL(item, 'question', lang)}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openId === item.id ? 'rotate-180' : ''}`} />
            </button>
            {openId === item.id && (
              <div className="px-5 pb-5 -mt-1">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {getL(item, 'answer', lang)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
