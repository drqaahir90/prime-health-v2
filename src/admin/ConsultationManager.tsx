import { useEffect, useState } from 'react';
import { X, Check, XCircle, CreditCard, MessageCircle, Clock, Archive } from 'lucide-react';
import { db } from '../lib/db';
import type { Consultation, Service, Doctor, ConsultationStatus } from '../types';

const STATUS_OPTIONS: { value: ConsultationStatus; label: string; badge: string }[] = [
  { value: 'pending', label: 'Pending', badge: 'badge-pending' },
  { value: 'accepted', label: 'Accepted', badge: 'badge-accepted' },
  { value: 'rejected', label: 'Rejected', badge: 'badge-rejected' },
  { value: 'payment_requested', label: 'Payment Requested', badge: 'badge-accepted' },
  { value: 'paid', label: 'Paid', badge: 'badge-paid' },
  { value: 'in_progress', label: 'In Progress', badge: 'badge-paid' },
  { value: 'follow_up', label: 'Follow Up', badge: 'badge-accepted' },
  { value: 'completed', label: 'Completed', badge: 'badge-completed' },
  { value: 'archived', label: 'Archived', badge: 'badge-archived' },
];

export default function ConsultationManager() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  const load = () => {
    setConsultations(db.query<Consultation>('consultations', {}, { field: 'createdAt', direction: 'desc' }));
    setServices(db.getAll<Service>('services'));
    setDoctors(db.getAll<Doctor>('doctors'));
  };
  useEffect(() => {
    load();
    const unsubConsultations = db.subscribe('consultations', load);
    const unsubServices = db.subscribe('services', load);
    const unsubDoctors = db.subscribe('doctors', load);
    return () => {
      unsubConsultations();
      unsubServices();
      unsubDoctors();
    };
  }, []);

  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || '';
  const getDoctorName = (id: string) => doctors.find(d => d.id === id)?.name || '';

  const filtered = consultations.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.patientName.toLowerCase().includes(q) || c.whatsapp.includes(q) || c.id.includes(q);
    }
    return true;
  });

  const updateStatus = (id: string, status: ConsultationStatus, extra: Record<string, any> = {}) => {
    db.update<any>('consultations', id, { status, ...extra });
    load();
    if (selected?.id === id) setSelected(db.getById<Consultation>('consultations', id));
  };

  const sendPaymentRequest = (c: Consultation) => {
    const amount = parseFloat(paymentAmount);
    if (!amount) return alert('Enter a valid amount');
    updateStatus(c.id, 'payment_requested', { paymentAmount: amount });
    // Open WhatsApp with payment link
    const link = `${window.location.origin}${window.location.pathname}#/payment/${c.id}`;
    const msg = encodeURIComponent(`Hello ${c.patientName},\n\nYour consultation has been accepted.\nPlease complete payment of $${amount} here:\n${link}`);
    window.open(`https://wa.me/${c.whatsapp}?text=${msg}`, '_blank');
    setPaymentAmount('');
  };

  const updateNotes = (id: string, notes: string) => {
    db.update<any>('consultations', id, { clinicalNotes: notes });
  };

  const statusBadge = (status: string) => {
    const s = STATUS_OPTIONS.find(o => o.value === status);
    return s ? s.badge : 'badge-pending';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consultation Manager</h1>
        <span className="text-sm text-gray-500">{filtered.length} consultation(s)</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, WhatsApp, ID..."
          className="input-field max-w-xs"
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field max-w-[180px]">
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center"><span className="text-5xl block mb-4">📋</span><p className="text-gray-500">No consultations found</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="card p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(c)}>
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{c.patientName}</h3>
                    <span className={`badge ${statusBadge(c.status)}`}>{c.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {getServiceName(c.serviceId)} · {getDoctorName(c.doctorId)} · {c.whatsapp}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                  {c.paymentAmount && <p className="text-sm text-primary-600 font-medium">${c.paymentAmount}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.patientName}</h2>
                <p className="text-xs text-gray-500">ID: {selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Actions */}
              <div className="flex flex-wrap gap-2">
                <span className={`badge text-sm ${statusBadge(selected.status)}`}>{selected.status.replace('_', ' ')}</span>
                
                {selected.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(selected.id, 'accepted')} className="btn-primary text-xs"><Check className="w-3 h-3" /> Accept</button>
                    <button onClick={() => updateStatus(selected.id, 'rejected')} className="btn-danger text-xs"><XCircle className="w-3 h-3" /> Reject</button>
                  </>
                )}
                {selected.status === 'accepted' && (
                  <div className="flex gap-2 items-center">
                    <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="Amount ($)" className="input-field w-28 text-xs" />
                    <button onClick={() => sendPaymentRequest(selected)} className="btn-primary text-xs"><CreditCard className="w-3 h-3" /> Send Payment</button>
                  </div>
                )}
                {selected.status === 'paid' && (
                  <button onClick={() => updateStatus(selected.id, 'in_progress')} className="btn-primary text-xs"><MessageCircle className="w-3 h-3" /> Start Consultation</button>
                )}
                {selected.status === 'in_progress' && (
                  <>
                    <button onClick={() => updateStatus(selected.id, 'follow_up')} className="btn-secondary text-xs"><Clock className="w-3 h-3" /> Follow Up</button>
                    <button onClick={() => updateStatus(selected.id, 'completed')} className="btn-primary text-xs"><Check className="w-3 h-3" /> Complete</button>
                  </>
                )}
                {selected.status === 'follow_up' && (
                  <button onClick={() => updateStatus(selected.id, 'completed')} className="btn-primary text-xs"><Check className="w-3 h-3" /> Complete</button>
                )}
                {selected.status === 'completed' && (
                  <button onClick={() => updateStatus(selected.id, 'archived')} className="btn-secondary text-xs"><Archive className="w-3 h-3" /> Archive</button>
                )}
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-500 block">Age</span><span className="font-medium text-gray-900 dark:text-white">{selected.age}</span></div>
                <div><span className="text-gray-500 block">Gender</span><span className="font-medium text-gray-900 dark:text-white">{selected.gender}</span></div>
                <div><span className="text-gray-500 block">Country</span><span className="font-medium text-gray-900 dark:text-white">{selected.country}</span></div>
                <div><span className="text-gray-500 block">WhatsApp</span><a href={`https://wa.me/${selected.whatsapp}`} target="_blank" className="font-medium text-primary-600 hover:underline">{selected.whatsapp}</a></div>
                {selected.height && <div><span className="text-gray-500 block">Height</span><span className="font-medium text-gray-900 dark:text-white">{selected.height}</span></div>}
                {selected.weight && <div><span className="text-gray-500 block">Weight</span><span className="font-medium text-gray-900 dark:text-white">{selected.weight}</span></div>}
                <div><span className="text-gray-500 block">Service</span><span className="font-medium text-gray-900 dark:text-white">{getServiceName(selected.serviceId)}</span></div>
                <div><span className="text-gray-500 block">Doctor</span><span className="font-medium text-gray-900 dark:text-white">{getDoctorName(selected.doctorId)}</span></div>
              </div>

              {/* Medical Info */}
              <div className="space-y-3">
                {selected.symptoms && <div><h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Symptoms</h4><p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg whitespace-pre-line">{selected.symptoms}</p></div>}
                {selected.duration && <div><h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Duration</h4><p className="text-sm text-gray-600 dark:text-gray-400">{selected.duration}</p></div>}
                {selected.allergies && <div><h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Allergies</h4><p className="text-sm text-gray-600 dark:text-gray-400">{selected.allergies}</p></div>}
                {selected.currentMedications && <div><h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Current Medications</h4><p className="text-sm text-gray-600 dark:text-gray-400">{selected.currentMedications}</p></div>}
                {selected.pastDiseases && <div><h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Past Diseases</h4><p className="text-sm text-gray-600 dark:text-gray-400">{selected.pastDiseases}</p></div>}
              </div>

              {/* Custom Fields */}
              {selected.customFields && Object.keys(selected.customFields).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Additional Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selected.customFields).map(([key, value]) => (
                      <div key={key}><span className="text-gray-500 block text-xs">{key}</span><span className="text-gray-900 dark:text-white">{String(value)}</span></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selected.attachments?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.attachments.map((att, i) => (
                      att.startsWith('data:image') ? (
                        <a key={i} href={att} target="_blank" className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 block">
                          <img src={att} alt="" className="w-full h-full object-cover" />
                        </a>
                      ) : (
                        <a key={i} href={att} target="_blank" className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 px-3 py-2">📎 Attachment {i + 1}</a>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              {selected.paymentAmount && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-400 mb-2">Payment</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-green-600/70 block">Amount</span><span className="font-medium">${selected.paymentAmount}</span></div>
                    {selected.paymentMethod && <div><span className="text-green-600/70 block">Method</span><span className="font-medium">{selected.paymentMethod}</span></div>}
                    {selected.paymentReference && <div><span className="text-green-600/70 block">Reference</span><span className="font-medium">{selected.paymentReference}</span></div>}
                    {selected.paymentDate && <div><span className="text-green-600/70 block">Date</span><span className="font-medium">{new Date(selected.paymentDate).toLocaleString()}</span></div>}
                  </div>
                </div>
              )}

              {/* Clinical Notes */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Clinical Notes</h4>
                <textarea
                  rows={4}
                  value={selected.clinicalNotes || ''}
                  onChange={e => {
                    const notes = e.target.value;
                    setSelected({ ...selected, clinicalNotes: notes });
                    updateNotes(selected.id, notes);
                  }}
                  className="input-field"
                  placeholder="Write clinical notes here..."
                />
              </div>

              {/* WhatsApp Contact */}
              <a
                href={`https://wa.me/${selected.whatsapp}`}
                target="_blank"
                className="btn-primary w-full justify-center"
              >
                <MessageCircle className="w-4 h-4" /> Contact on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
