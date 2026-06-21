import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Stethoscope, ClipboardList, CreditCard, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { db } from '../lib/db';

export default function Dashboard() {
  const [stats, setStats] = useState({
    doctors: 0, services: 0, consultations: 0, pending: 0,
    accepted: 0, paid: 0, completed: 0, rejected: 0,
    patients: 0, blogPosts: 0, messages: 0, prescriptions: 0,
  });
  const [recentConsultations, setRecentConsultations] = useState<any[]>([]);

  const loadStats = () => {
    const consultations = db.getAll<any>('consultations');
    setStats({
      doctors: db.count('doctors', { active: true }),
      services: db.count('services', { active: true }),
      consultations: consultations.length,
      pending: consultations.filter(c => c.status === 'pending').length,
      accepted: consultations.filter(c => c.status === 'accepted' || c.status === 'payment_requested').length,
      paid: consultations.filter(c => c.status === 'paid' || c.status === 'in_progress').length,
      completed: consultations.filter(c => c.status === 'completed').length,
      rejected: consultations.filter(c => c.status === 'rejected').length,
      patients: db.count('patients'),
      blogPosts: db.count('blog'),
      messages: db.count('contact_messages', { read: false }),
      prescriptions: db.count('prescriptions'),
    });
    setRecentConsultations(
      consultations.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
    );
  };

  useEffect(() => {
    loadStats();
    const unsubDocs = db.subscribe('doctors', loadStats);
    const unsubServices = db.subscribe('services', loadStats);
    const unsubConsultations = db.subscribe('consultations', loadStats);
    const unsubBlog = db.subscribe('blog', loadStats);
    const unsubMessages = db.subscribe('contact_messages', loadStats);
    const unsubPrescriptions = db.subscribe('prescriptions', loadStats);
    return () => {
      unsubDocs();
      unsubServices();
      unsubConsultations();
      unsubBlog();
      unsubMessages();
      unsubPrescriptions();
    };
  }, []);

  const statCards = [
    { label: 'Total Consultations', value: stats.consultations, icon: ClipboardList, color: 'bg-blue-500', link: '/admin/consultations' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500', link: '/admin/consultations' },
    { label: 'Paid / In Progress', value: stats.paid, icon: CreditCard, color: 'bg-green-500', link: '/admin/consultations' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-purple-500', link: '/admin/consultations' },
    { label: 'Doctors', value: stats.doctors, icon: Users, color: 'bg-primary-500', link: '/admin/doctors' },
    { label: 'Services', value: stats.services, icon: Stethoscope, color: 'bg-indigo-500', link: '/admin/services' },
    { label: 'Blog Posts', value: stats.blogPosts, icon: FileText, color: 'bg-pink-500', link: '/admin/blog' },
    { label: 'Unread Messages', value: stats.messages, icon: XCircle, color: 'bg-red-500', link: '/admin/contact' },
  ];

  const statusColors: Record<string, string> = {
    pending: 'badge-pending',
    accepted: 'badge-accepted',
    payment_requested: 'badge-accepted',
    paid: 'badge-paid',
    in_progress: 'badge-paid',
    follow_up: 'badge-accepted',
    completed: 'badge-completed',
    rejected: 'badge-rejected',
    archived: 'badge-archived',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <Link key={card.label} to={card.link} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent consultations */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Consultations</h2>
          <Link to="/admin/consultations" className="text-sm text-primary-600 hover:underline">View All</Link>
        </div>
        {recentConsultations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No consultations yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Patient</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">WhatsApp</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentConsultations.map(c => (
                  <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3">
                      <Link to={`/admin/consultations`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                        {c.patientName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{c.whatsapp}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusColors[c.status] || 'badge-pending'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
