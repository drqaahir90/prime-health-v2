import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Pill } from 'lucide-react';
import { db } from '../lib/db';
import type { Prescription, Doctor } from '../types';

/* ===== PATIENTS MANAGER ===== */
export function PatientsManager() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const load = () => {
    setConsultations(db.getAll<any>('consultations'));
  };

  useEffect(() => {
    load();
    return db.subscribe('consultations', load);
  }, []);

  // Aggregate unique patients from consultations
  const patients = Object.values(
    consultations.reduce((acc: Record<string, any>, c: any) => {
      const key = c.whatsapp || c.patientName;
      if (!acc[key]) {
        acc[key] = {
          name: c.patientName,
          whatsapp: c.whatsapp,
          age: c.age,
          gender: c.gender,
          country: c.country,
          consultationCount: 0,
          lastVisit: c.createdAt,
        };
      }
      acc[key].consultationCount++;
      if (c.createdAt > acc[key].lastVisit) acc[key].lastVisit = c.createdAt;
      return acc;
    }, {})
  ) as any[];

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.whatsapp.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patients</h1>
        <span className="text-sm text-gray-500">{patients.length} patient(s)</span>
      </div>

      <div className="mb-4">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..." className="input-field max-w-xs" />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center"><span className="text-5xl block mb-4">👥</span><p className="text-gray-500">No patients found</p></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">WhatsApp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Age/Gender</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Country</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Visits</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    <a href={`https://wa.me/${p.whatsapp}`} target="_blank" className="text-primary-600 hover:underline">{p.whatsapp}</a>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.age} / {p.gender}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.country}</td>
                  <td className="px-4 py-3"><span className="badge badge-accepted">{p.consultationCount}</span></td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{new Date(p.lastVisit).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ===== PRESCRIPTIONS MANAGER ===== */
export function PrescriptionsManager() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setPrescriptions(db.query<Prescription>('prescriptions', {}, { field: 'createdAt', direction: 'desc' }));
    setDoctors(db.getAll<Doctor>('doctors'));
  };

  useEffect(() => {
    load();
    const unsubPrescriptions = db.subscribe('prescriptions', load);
    const unsubDoctors = db.subscribe('doctors', load);
    return () => {
      unsubPrescriptions();
      unsubDoctors();
    };
  }, []);

  const getDoctorName = (id: string) => doctors.find(d => d.id === id)?.name || '';

  const openAdd = () => {
    setEditing({
      consultationId: '', patientName: '', doctorId: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
      notes: '', renewDate: '', active: true,
    });
    setShowModal(true);
  };

  const openEdit = (p: Prescription) => { setEditing({ ...p, medications: [...p.medications] }); setShowModal(true); };

  const handleSave = () => {
    if (editing?.id) db.update<any>('prescriptions', editing.id, editing);
    else db.add<Prescription>('prescriptions', editing);
    setShowModal(false);
    load();
  };

  const handleDelete = (id: string) => { if (confirm('Delete?')) { db.delete('prescriptions', id); load(); } };

  const addMedication = () => {
    setEditing({ ...editing, medications: [...editing.medications, { name: '', dosage: '', frequency: '', duration: '', notes: '' }] });
  };

  const updateMedication = (idx: number, field: string, value: string) => {
    const meds = [...editing.medications];
    meds[idx] = { ...meds[idx], [field]: value };
    setEditing({ ...editing, medications: meds });
  };

  const removeMedication = (idx: number) => {
    setEditing({ ...editing, medications: editing.medications.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prescriptions</h1>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> New Prescription</button>
      </div>

      {prescriptions.length === 0 ? (
        <div className="card p-12 text-center"><span className="text-5xl block mb-4">💊</span><p className="text-gray-500 mb-4">No prescriptions yet</p><button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Create First Prescription</button></div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map(p => (
            <div key={p.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{p.patientName}</h3>
                  <p className="text-sm text-gray-500">Dr. {getDoctorName(p.doctorId)} · {p.medications.length} medication(s)</p>
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${p.active ? 'badge-paid' : 'badge-archived'}`}>{p.active ? 'Active' : 'Expired'}</span>
                  <button onClick={() => openEdit(p)} className="btn-secondary text-xs py-1.5 px-2"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(p.id)} className="btn-danger text-xs py-1.5 px-2"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editing.id ? 'Edit Prescription' : 'New Prescription'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Patient Name</label><input type="text" value={editing.patientName} onChange={e => setEditing({ ...editing, patientName: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium mb-1">Doctor</label><select value={editing.doctorId} onChange={e => setEditing({ ...editing, doctorId: e.target.value })} className="input-field"><option value="">Select Doctor</option>{doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Consultation ID (optional)</label><input type="text" value={editing.consultationId} onChange={e => setEditing({ ...editing, consultationId: e.target.value })} className="input-field" /></div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Medications</label>
                  <button onClick={addMedication} className="btn-secondary text-xs py-1"><Plus className="w-3 h-3" /> Add</button>
                </div>
                {editing.medications.map((med: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Pill className="w-3 h-3" /> Medication #{idx + 1}</span>
                      <button onClick={() => removeMedication(idx)} className="text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                    <input type="text" value={med.name} onChange={e => updateMedication(idx, 'name', e.target.value)} className="input-field text-sm" placeholder="Medication name" />
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" value={med.dosage} onChange={e => updateMedication(idx, 'dosage', e.target.value)} className="input-field text-xs" placeholder="Dosage" />
                      <input type="text" value={med.frequency} onChange={e => updateMedication(idx, 'frequency', e.target.value)} className="input-field text-xs" placeholder="Frequency" />
                      <input type="text" value={med.duration} onChange={e => updateMedication(idx, 'duration', e.target.value)} className="input-field text-xs" placeholder="Duration" />
                    </div>
                    <input type="text" value={med.notes} onChange={e => updateMedication(idx, 'notes', e.target.value)} className="input-field text-xs" placeholder="Notes" />
                  </div>
                ))}
              </div>

              <div><label className="block text-sm font-medium mb-1">Notes</label><textarea rows={3} value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Renewal Date</label><input type="date" value={editing.renewDate || ''} onChange={e => setEditing({ ...editing, renewDate: e.target.value })} className="input-field" /></div>
                <div className="flex items-end pb-1"><label className="flex items-center gap-2"><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="rounded text-primary-600 w-5 h-5" /> Active</label></div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
