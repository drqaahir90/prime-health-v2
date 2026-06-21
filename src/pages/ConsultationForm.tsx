import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, Upload, X, CheckCircle } from 'lucide-react';
import { db } from '../lib/db';
import { useLanguage } from '../contexts/LanguageContext';
import type { Service, Doctor, Consultation } from '../types';

function getL(item: any, field: string, lang: string): string {
  if (lang === 'ar') return item[field + 'Ar'] || item[field] || '';
  if (lang === 'so') return item[field + 'So'] || item[field] || '';
  return item[field] || '';
}

export default function ConsultationForm() {
  const { t, lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [consultationId, setConsultationId] = useState('');

  const [form, setForm] = useState({
    serviceId: searchParams.get('service') || '',
    doctorId: '',
    patientName: '',
    age: '',
    gender: '',
    country: '',
    whatsapp: '',
    height: '',
    weight: '',
    allergies: '',
    currentMedications: '',
    pastDiseases: '',
    symptoms: '',
    duration: '',
    attachments: [] as string[],
    customFields: {} as Record<string, any>,
  });

  const load = () => {
    setServices(db.query<Service>('services', { active: true }, { field: 'order', direction: 'asc' }));
    setDoctors(db.query<Doctor>('doctors', { active: true }, { field: 'order', direction: 'asc' }));
  };

  useEffect(() => {
    load();
    const unsubServices = db.subscribe('services', load);
    const unsubDoctors = db.subscribe('doctors', load);
    return () => {
      unsubServices();
      unsubDoctors();
    };
  }, []);

  const selectedService = services.find(s => s.id === form.serviceId);

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, attachments: [...prev.attachments, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (idx: number) => {
    setForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const consultation = db.add<Consultation>('consultations', {
        patientName: form.patientName,
        age: parseInt(form.age) || 0,
        gender: form.gender,
        country: form.country,
        whatsapp: form.whatsapp,
        height: form.height,
        weight: form.weight,
        allergies: form.allergies,
        currentMedications: form.currentMedications,
        pastDiseases: form.pastDiseases,
        symptoms: form.symptoms,
        duration: form.duration,
        attachments: form.attachments,
        serviceId: form.serviceId,
        doctorId: form.doctorId,
        customFields: form.customFields,
        status: 'pending',
      } as any);

      // Send WhatsApp notification (open WhatsApp with message)
      const settings = db.getSingle<any>('site_settings');
      if (settings?.whatsappNotificationNumber) {
        const msg = encodeURIComponent(
          `New Consultation Request:\nPatient: ${form.patientName}\nService: ${selectedService ? getL(selectedService, 'name', 'en') : ''}\nWhatsApp: ${form.whatsapp}`
        );
        window.open(`https://wa.me/${settings.whatsappNotificationNumber}?text=${msg}`, '_blank');
      }

      setConsultationId(consultation.id);
      setSubmitted(true);
      setSubmitting(false);
    }, 500);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {t('consultation.submitted', 'Consultation request submitted successfully!')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          {lang === 'ar' ? 'رقم الاستشارة:' : 'Consultation ID:'}
        </p>
        <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg inline-block mb-6">
          {consultationId}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/')} className="btn-primary">
            {t('nav.home', 'Home')}
          </button>
          <button onClick={() => { setSubmitted(false); setStep(1); setForm({ ...form, patientName: '', symptoms: '', attachments: [] }); }} className="btn-secondary">
            {lang === 'ar' ? 'استشارة جديدة' : 'New Consultation'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        {t('nav.consultation', 'Book Consultation')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
        {lang === 'ar' ? 'الخطوة' : lang === 'so' ? 'Talaabada' : 'Step'} {step} / 3
      </p>

      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="card p-6">
        {/* Step 1: Service & Doctor Selection */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('form.selectService', 'Select Service')}
            </h2>

            {services.length === 0 ? (
              <p className="text-gray-500 text-sm">{t('common.noData', 'No services available')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => updateField('serviceId', s.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      form.serviceId === s.id
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {s.icon && <span className="text-xl">{s.icon}</span>}
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {getL(s, 'name', lang)}
                      </span>
                    </div>
                    {s.price > 0 && (
                      <p className="text-primary-600 text-xs mt-1">{s.currency} {s.price}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {doctors.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                  {t('form.selectDoctor', 'Select Doctor')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctors.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => updateField('doctorId', d.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${
                        form.doctorId === d.id
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden">
                        {d.photo ? (
                          <img src={d.photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">👨‍⚕️</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{getL(d, 'name', lang)}</p>
                        <p className="text-xs text-gray-500">{getL(d, 'position', lang)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!form.serviceId}
              className="btn-primary w-full mt-4"
            >
              {lang === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        )}

        {/* Step 2: Patient Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {lang === 'ar' ? 'معلومات المريض' : lang === 'so' ? 'Macluumaadka Bukaanka' : 'Patient Information'}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.name', 'Full Name')} *</label>
              <input type="text" required value={form.patientName} onChange={e => updateField('patientName', e.target.value)} className="input-field" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.age', 'Age')} *</label>
                <input type="number" required min="0" max="150" value={form.age} onChange={e => updateField('age', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.gender', 'Gender')} *</label>
                <select required value={form.gender} onChange={e => updateField('gender', e.target.value)} className="input-field">
                  <option value="">--</option>
                  <option value="male">{t('form.male', 'Male')}</option>
                  <option value="female">{t('form.female', 'Female')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.country', 'Country')} *</label>
                <input type="text" required value={form.country} onChange={e => updateField('country', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.whatsapp', 'WhatsApp')} *</label>
                <input type="tel" required value={form.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} className="input-field" placeholder="+252..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.height', 'Height')}</label>
                <input type="text" value={form.height} onChange={e => updateField('height', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.weight', 'Weight')}</label>
                <input type="text" value={form.weight} onChange={e => updateField('weight', e.target.value)} className="input-field" />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                {t('common.back', 'Back')}
              </button>
              <button type="button" onClick={() => setStep(3)} disabled={!form.patientName || !form.age || !form.gender || !form.country || !form.whatsapp} className="btn-primary flex-1">
                {lang === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Medical Info */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {lang === 'ar' ? 'المعلومات الطبية' : lang === 'so' ? 'Macluumaadka Caafimaadka' : 'Medical Information'}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.symptoms', 'Symptoms')} *</label>
              <textarea rows={4} required value={form.symptoms} onChange={e => updateField('symptoms', e.target.value)} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.duration', 'Duration')}</label>
              <input type="text" value={form.duration} onChange={e => updateField('duration', e.target.value)} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.allergies', 'Allergies')}</label>
              <textarea rows={2} value={form.allergies} onChange={e => updateField('allergies', e.target.value)} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.medications', 'Current Medications')}</label>
              <textarea rows={2} value={form.currentMedications} onChange={e => updateField('currentMedications', e.target.value)} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.pastDiseases', 'Past Diseases')}</label>
              <textarea rows={2} value={form.pastDiseases} onChange={e => updateField('pastDiseases', e.target.value)} className="input-field" />
            </div>

            {/* Custom fields from selected service */}
            {selectedService?.formFields?.map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getL(field, 'label', lang)} {field.required && '*'}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    required={field.required}
                    value={form.customFields[field.id] || ''}
                    onChange={e => setForm(prev => ({ ...prev, customFields: { ...prev.customFields, [field.id]: e.target.value } }))}
                    className="input-field"
                  />
                ) : field.type === 'select' ? (
                  <select
                    required={field.required}
                    value={form.customFields[field.id] || ''}
                    onChange={e => setForm(prev => ({ ...prev, customFields: { ...prev.customFields, [field.id]: e.target.value } }))}
                    className="input-field"
                  >
                    <option value="">--</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!form.customFields[field.id]}
                      onChange={e => setForm(prev => ({ ...prev, customFields: { ...prev.customFields, [field.id]: e.target.checked } }))}
                      className="rounded text-primary-600"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{getL(field, 'label', lang)}</span>
                  </label>
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    value={form.customFields[field.id] || ''}
                    onChange={e => setForm(prev => ({ ...prev, customFields: { ...prev.customFields, [field.id]: e.target.value } }))}
                    className="input-field"
                  />
                )}
              </div>
            ))}

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('form.attachments', 'Attachments')}</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer text-gray-500 hover:text-primary-600">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm">{lang === 'ar' ? 'اضغط لرفع الملفات' : 'Click to upload files'}</span>
                </label>
              </div>
              {form.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.attachments.map((att, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {att.startsWith('data:image') ? (
                        <img src={att} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">📎</div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">
                {t('common.back', 'Back')}
              </button>
              <button type="submit" disabled={submitting || !form.symptoms} className="btn-primary flex-1">
                <Send className="w-4 h-4" />
                {submitting ? t('common.loading', 'Submitting...') : t('common.submit', 'Submit')}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
