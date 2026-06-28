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
    const unsub1 = db.subscribe('consultations', load);
    const unsub2 = db.subscribe('payment_settings', load);
    return () => {
      unsub1();
      unsub2();
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
      db.update('consultations', consultation.id, {
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
        <p className="text-gray-500">
          {t('common.noData', 'Consultation not found')}
        </p>
      </div>
    );
  }

  if (consultation.status === 'paid' || confirmed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold mb-3">
          {lang === 'ar'
            ? 'تم تأكيد الدفع!'
            : lang === 'so'
            ? 'Lacag bixinta waa la xaqiijiyay!'
            : 'Payment Confirmed!'}
        </h1>

        <p className="text-gray-500">
          {lang === 'ar'
            ? 'سيتم التواصل معك قريباً'
            : 'We will contact you shortly'}
        </p>
      </div>
    );
  }

  if (consultation.status !== 'payment_requested') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />

        <h1 className="text-xl font-bold mb-2">
          {t('payment.title', 'Payment')}
        </h1>

        <p className="text-gray-500">
          {lang === 'ar'
            ? 'لم يتم طلب الدفع بعد'
            : 'No payment has been requested yet'}
        </p>

        <p className="text-sm text-gray-400 mt-2">
          {lang === 'ar' ? 'الحالة:' : 'Status:'} {consultation.status}
        </p>
      </div>
    );
  }

  const amount =
    consultation.paymentAmount ||
    paymentSettings?.defaultAmount ||
    0;

  const activeMethods =
    paymentSettings?.methods?.filter(m => m.active) || [];

  const ussdCode =
    selectedMethod?.ussdTemplate
      ? selectedMethod.ussdTemplate
          .replace('{number}', selectedMethod.number)
          .replace('{amount}', String(amount))
      : '';

  const launchUSSD = () => {
    if (!ussdCode) return;
    window.location.href = `tel:${encodeURIComponent(ussdCode)}`;
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-center mb-2">
        {t('payment.title', 'Payment')}
      </h1>

      <p className="text-center text-gray-500 mb-8">
        {lang === 'ar'
          ? 'ادفع لتأكيد الاستشارة'
          : 'Pay to confirm your consultation'}
      </p>

      {/* Amount */}
      <div className="card p-6 mb-6 text-center">
        <p className="text-sm text-gray-500">
          {t('payment.amount', 'Amount')}
        </p>
        <p className="text-3xl font-bold text-primary-600 mt-1">
          ${amount}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {lang === 'ar' ? 'المريض:' : 'Patient:'}{' '}
          {consultation.patientName}
        </p>
      </div>

      {/* Payment Methods */}
      {activeMethods.length === 0 ? (
        <div className="card p-6 text-center text-gray-500">
          No payment methods configured
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {activeMethods.map(method => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method)}
              className={`w-full p-4 border rounded-lg text-left ${
                selectedMethod?.id === method.id
                  ? 'border-primary-600'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex justify-between">
                <span className="font-semibold">
                  {method.name}
                </span>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    copyToClipboard(method.number, method.id);
                  }}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-gray-500">
                {method.merchantName} • {method.number}
              </p>

              {copied === method.id && (
                <p className="text-xs text-green-600">
                  Copied!
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Reference Section */}
      {selectedMethod && (
        <div className="space-y-4">
          {ussdCode && (
            <div className="card p-4">
              <p className="font-medium mb-2">USSD Code</p>

              <div className="flex gap-2">
                <input
                  readOnly
                  value={ussdCode}
                  className="input-field flex-1"
                />

                <button
                  onClick={() =>
                    copyToClipboard(ussdCode, 'ussd')
                  }
                  className="btn-secondary"
                >
                  Copy
                </button>
              </div>

              <button
                onClick={launchUSSD}
                className="btn-primary w-full mt-3"
              >
                Pay Now
              </button>
            </div>
          )}

          <div>
            <label className="block mb-1">
              Transaction Reference *
            </label>

            <input
              type="text"
              value={reference}
              onChange={e =>
                setReference(e.target.value)
              }
              className="input-field"
            />
          </div>

          <button
            onClick={handleConfirm}
            disabled={!reference || confirming}
            className="btn-primary w-full"
          >
            <CheckCircle className="w-4 h-4" />
            {confirming ? 'Confirming...' : 'Confirm Payment'}
          </button>
        </div>
      )}
    </div>
  );
}
