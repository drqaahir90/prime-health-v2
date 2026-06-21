import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { db } from '../lib/db';
import { useLanguage } from '../contexts/LanguageContext';
import type { ContactInfo, ContactMessage } from '../types';

function getL(item: any, field: string, lang: string): string {
  if (lang === 'ar') return item[field + 'Ar'] || item[field] || '';
  if (lang === 'so') return item[field + 'So'] || item[field] || '';
  return item[field] || '';
}

export default function Contact() {
  const { t, lang } = useLanguage();
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const load = () => setContact(db.getSingle<ContactInfo>('contact_info'));
  useEffect(() => { load(); return db.subscribe('contact_info', load); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      db.add<ContactMessage>('contact_messages', {
        ...form,
        read: false,
      } as any);
      setSent(true);
      setSending(false);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        {t('nav.contact', 'Contact Us')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact Info */}
        <div>
          <div className="space-y-6">
            {contact?.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {lang === 'ar' ? 'الهاتف' : lang === 'so' ? 'Telefoon' : 'Phone'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{contact.phone}</p>
                </div>
              </a>
            )}

            {contact?.email && (
              <a href={`mailto:${contact.email}`} className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{contact.email}</p>
                </div>
              </a>
            )}

            {contact?.whatsapp && (
              <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">WhatsApp</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{contact.whatsapp}</p>
                </div>
              </a>
            )}

            {contact?.address && (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {lang === 'ar' ? 'العنوان' : lang === 'so' ? 'Cinwaanka' : 'Address'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{getL(contact, 'address', lang)}</p>
                </div>
              </div>
            )}

            {contact?.workingHours && (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-xl">🕐</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {lang === 'ar' ? 'ساعات العمل' : lang === 'so' ? 'Saacadaha Shaqada' : 'Working Hours'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm whitespace-pre-line">
                    {getL(contact, 'workingHours', lang)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Form */}
        <div className="card p-6">
          {sent ? (
            <div className="text-center py-10">
              <span className="text-5xl block mb-4">✅</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {lang === 'ar' ? 'تم الإرسال بنجاح!' : lang === 'so' ? 'Si guul leh ayaa loo diray!' : 'Message Sent!'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {lang === 'ar' ? 'سنتواصل معك قريباً' : lang === 'so' ? 'Waan kula soo xiriiri doonaa dhowaan' : "We'll get back to you soon"}
              </p>
              <button onClick={() => setSent(false)} className="btn-primary">
                {lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.name', 'Name')}</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'ar' ? 'الهاتف' : 'Phone'}</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'ar' ? 'الموضوع' : 'Subject'}</label>
                <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'ar' ? 'الرسالة' : 'Message'}</label>
                <textarea rows={5} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="input-field" />
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full">
                <Send className="w-4 h-4" /> {sending ? t('common.loading', 'Sending...') : t('common.submit', 'Send Message')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
