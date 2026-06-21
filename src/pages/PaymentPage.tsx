import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Copy, CreditCard } from 'lucide-react';
import { db } from '../lib/db';
import { useLanguage } from '../contexts/LanguageContext';
import type { Consultation, PaymentSettings, PaymentMethod } from '../types';

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLanguage();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [reference, setReference] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState('');

  const load = () => {
    if (id) {
      setConsultation(db.getById<Consultation>('consultations', id));
      setPaymentSettings(db.getSingle<PaymentSettings>('payment_settings'));
    }
  };

  useEffect(() => {
    load();
    const unsubConsultations = db.subscribe('consultations', load);
    const unsubPaymentSettings = db.subscribe('payment_settings', load);
    return () => {
      unsubConsultations();
      unsubPaymentSettings();
    };
  }, [id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleConfirm = () => {
    if (!reference || !selectedMethod || !consultation) return;
    setConfirming(true);
    setTimeout(() => {
      db.update<any>('consultations', consultation.id, {
        status: 'paid',
        paymentMethod: selectedMethod.name,
        paymentReference: reference,
        paymentDate: new Date().toISOString(),
      });
      setConfirmed(true);
      setConfirming(false);
    }, 500);
  };

  if (!consultation) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-500">{t('common.noData', 'Consultation not found')}</p>
      </div>
    );
  }

  if (consultation.status === 'paid' || confirmed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {lang === 'ar' ? 'تم تأكيد الدفع!' : lang === 'so' ? 'Lacag bixinta waa la xaqiijiyay!' : 'Payment Confirmed!'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {lang === 'ar' ? 'سيتم التواصل معك قريباً لبدء الاستشارة' : 'We will contact you shortly to start the consultation'}
        </p>
      </div>
    );
  }

  if (consultation.status !== 'payment_requested') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t('payment.title', 'Payment')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {lang === 'ar' ? 'لم يتم طلب دفع بعد' : 'No payment has been requested yet'}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {lang === 'ar' ? 'الحالة:' : 'Status:'} <span className="font-medium">{consultation.status}</span>
        </p>
      </div>
    );
  }

  const activeMethods = paymentSettings?.methods?.filter(m => m.active) || [];

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        {t('payment.title', 'Payment')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
        {lang === 'ar' ? 'ادفع لتأكيد الاستشارة' : 'Pay to confirm your consultation'}
      </p>

      {/* Amount */}
      <div className="card p-6 mb-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('payment.amount', 'Amount')}</p>
        <p className="text-3xl font-bold text-primary-600 mt-1">
          ${consultation.paymentAmount || paymentSettings?.defaultAmount || 0}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {lang === 'ar' ? 'المريض:' : 'Patient:'} {consultation.patientName}
        </p>
      </div>

      {/* Payment Methods */}
      {activeMethods.length === 0 ? (
        <div className="card p-6 text-center text-gray-500">
          {t('common.noData', 'No payment methods configured')}
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('payment.method', 'Select Payment Method')}
          </h2>
          {activeMethods.map(method => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedMethod?.id === method.id
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/30'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{method.name}</span>
                <span className={`w-4 h-4 rounded-full border-2 ${selectedMethod?.id === method.id ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {method.merchantName} • {method.number}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(method.number, method.id); }}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied === method.id && (
                <span className="text-xs text-green-600 mt-1 block">{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
              )}
              {selectedMethod?.id === method.id && method.instructions && (
                <p className="text-xs text-gray-500 mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  {lang === 'ar' ? method.instructionsAr || method.instructions :
                   lang === 'so' ? method.instructionsSo || method.instructions : method.instructions}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Reference input */}
      {selectedMethod && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('payment.reference', 'Transaction Reference')} *
            </label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              className="input-field"
              placeholder={lang === 'ar' ? 'أدخل رقم المعاملة...' : 'Enter transaction reference...'}
            />
          </div>

          <button
            onClick={handleConfirm}
            disabled={!reference || confirming}
            className="btn-primary w-full"
          >
            <CheckCircle className="w-4 h-4" />
            {confirming ? t('common.loading', 'Confirming...') : t('payment.confirm', 'Confirm Payment')}
          </button>
        </div>
      )}
    </div>
  );
}
