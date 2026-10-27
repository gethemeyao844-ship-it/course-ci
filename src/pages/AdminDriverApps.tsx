import { useState, useEffect } from 'react';
import {
  Bike, Loader2, CheckCircle, XCircle, Clock, AlertCircle,
  Search, Eye, Phone, Mail, MapPin, MessageSquare, FileText,
  HelpCircle, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ApplicationRow {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  commune: string;
  work_zone: string | null;
  vehicle_type: string;
  availability_hours: string | null;
  experience: string | null;
  id_document_type: string | null;
  id_document_number: string | null;
  message_to_admin: string | null;
  application_status: string;
  admin_response: string | null;
  application_number: string | null;
  is_activated: boolean;
  created_at: string;
}

interface AnswerRow {
  id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
}

interface QuestionRow {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-600', icon: Clock },
  submitted: { label: 'Soumise', color: 'bg-blue-100 text-blue-700', icon: Clock },
  under_review: { label: 'En examen', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  info_requested: { label: 'Info demandée', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  accepted: { label: 'Acceptée', color: 'bg-success-100 text-success-700', icon: CheckCircle },
  rejected: { label: 'Refusée', color: 'bg-error-100 text-error-700', icon: XCircle },
};

const vehicleLabels: Record<string, string> = {
  moto: 'Moto',
  velo: 'Vélo',
  voiture: 'Voiture',
  autre: 'Autre',
};

export function AdminDriverApps() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('driver_applications')
        .select('id, full_name, phone, email, commune, work_zone, vehicle_type, availability_hours, experience, id_document_type, id_document_number, message_to_admin, application_status, admin_response, application_number, is_activated, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setApplications((data || []) as ApplicationRow[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(msg);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (appId: string) => {
    setLoadingDetail(true);
    try {
      const { data: ansData } = await supabase
        .from('driver_test_answers')
        .select('id, question_id, selected_answer, is_correct')
        .eq('application_id', appId);

      const { data: qData } = await supabase
        .from('driver_test_questions')
        .select('id, question, option_a, option_b, option_c, option_d, correct_answer');

      setAnswers((ansData || []) as AnswerRow[]);
      setQuestions((qData || []) as QuestionRow[]);
    } catch {
      setAnswers([]);
      setQuestions([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const updateStatus = async (appId: string, newStatus: string, response: string) => {
    setActionLoading(true);
    try {
      const updateData: Record<string, unknown> = {
        application_status: newStatus,
        admin_response: response || null,
      };
      if (newStatus === 'accepted') {
        updateData.is_activated = true;
      }

      const { error } = await supabase
        .from('driver_applications')
        .update(updateData)
        .eq('id', appId);

      if (error) throw error;
      await fetchApplications();
      setSelectedApp(null);
      setAdminResponse('');
    } catch {
      setError('Erreur lors de la mise à jour');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = applications.filter((app) => {
    const matchesSearch = app.full_name.toLowerCase().includes(search.toLowerCase()) ||
      app.phone.includes(search);
    const matchesStatus = filterStatus === 'all' || app.application_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Detail view
  if (selectedApp) {
    const status = statusConfig[selectedApp.application_status] || statusConfig.submitted;
    const StatusIcon = status.icon;
    const correctCount = answers.filter((a) => a.is_correct).length;
    const score = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : null;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
        <button onClick={() => setSelectedApp(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-700 mb-4">
          <Eye size={16} /> Retour à la liste
        </button>

        <div className="card p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                <Bike size={28} className="text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-navy-900">{selectedApp.full_name}</h2>
                {selectedApp.application_number && (
                  <p className="text-xs text-gray-400">{selectedApp.application_number}</p>
                )}
              </div>
            </div>
            <span className={`badge ${status.color}`}>
              <StatusIcon size={12} className="mr-1" /> {status.label}
            </span>
          </div>

          {/* Identity */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> <span className="font-semibold">{selectedApp.phone}</span></div>
            {selectedApp.email && <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> <span className="font-semibold">{selectedApp.email}</span></div>}
            <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> <span className="font-semibold">{selectedApp.commune}</span></div>
            {selectedApp.work_zone && <div className="text-xs text-gray-500">Zone: {selectedApp.work_zone}</div>}
          </div>

          {/* Vehicle */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-bold text-navy-900 text-xs uppercase">Véhicule</p>
            <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-semibold">{vehicleLabels[selectedApp.vehicle_type] || selectedApp.vehicle_type}</span></div>
            {selectedApp.availability_hours && <div className="flex justify-between"><span className="text-gray-500">Disponibilité</span><span className="font-semibold">{selectedApp.availability_hours}</span></div>}
            {selectedApp.experience && <div className="flex justify-between"><span className="text-gray-500">Expérience</span><span className="font-semibold">{selectedApp.experience}</span></div>}
          </div>

          {/* Documents */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-bold text-navy-900 text-xs uppercase flex items-center gap-1"><FileText size={12} /> Documents</p>
            <div className="flex justify-between"><span className="text-gray-500">Type de pièce</span><span className="font-semibold">{selectedApp.id_document_type}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Numéro</span><span className="font-semibold">{selectedApp.id_document_number}</span></div>
            <p className="text-xs text-gray-400 mt-2">
              Les documents téléversés sont privés et ne sont accessibles qu'à l'administration.
            </p>
          </div>

          {/* Test results */}
          {loadingDetail ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-orange-500" size={20} />
            </div>
          ) : answers.length > 0 ? (
            <div className="bg-navy-50 rounded-xl p-4 space-y-3">
              <p className="font-bold text-navy-900 text-xs uppercase flex items-center gap-1"><HelpCircle size={12} /> Test de recrutement</p>
              {score !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Score</span>
                  <span className={`font-bold text-lg ${score >= 70 ? 'text-success-600' : 'text-orange-600'}`}>{score}%</span>
                </div>
              )}
              <div className="space-y-2">
                {answers.map((ans, i) => {
                  const q = questions.find((qq) => qq.id === ans.question_id);
                  if (!q) return null;
                  return (
                    <div key={ans.id} className="bg-white rounded-lg p-3 text-xs">
                      <p className="font-semibold text-navy-900 mb-1">{i + 1}. {q.question}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Réponse: {q[`option_${ans.selected_answer}` as keyof QuestionRow] as string}</span>
                        {ans.is_correct
                          ? <CheckCircle size={14} className="text-success-600" />
                          : <XCircle size={14} className="text-error-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Message to admin */}
          {selectedApp.message_to_admin && (
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="font-bold text-navy-900 text-xs uppercase flex items-center gap-1 mb-2"><MessageSquare size={12} /> Message du candidat</p>
              <p className="text-sm text-gray-600">{selectedApp.message_to_admin}</p>
            </div>
          )}

          {/* Admin response input */}
          {selectedApp.application_status !== 'accepted' && selectedApp.application_status !== 'rejected' && (
            <div>
              <label className="label-text">Réponse de l'administration (facultatif pour approuver/refuser)</label>
              <textarea
                className="input-field min-h-20"
                placeholder="Message au candidat..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
              />
            </div>
          )}

          {/* Actions */}
          {selectedApp.application_status !== 'accepted' && selectedApp.application_status !== 'rejected' && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => updateStatus(selectedApp.id, 'accepted', adminResponse)}
                  disabled={actionLoading}
                  className="btn-primary flex-1 bg-success-500 hover:bg-success-600 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle size={18} /> Approuver
                </button>
                <button
                  onClick={() => updateStatus(selectedApp.id, 'rejected', adminResponse)}
                  disabled={actionLoading}
                  className="btn-outline flex-1 text-error-600 border-error-200 hover:bg-error-50 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <XCircle size={18} /> Refuser
                </button>
              </div>
              <button
                onClick={() => updateStatus(selectedApp.id, 'info_requested', adminResponse)}
                disabled={actionLoading}
                className="btn-outline w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <AlertCircle size={18} /> Demander des informations complémentaires
              </button>
              <button
                onClick={() => updateStatus(selectedApp.id, 'under_review', '')}
                disabled={actionLoading}
                className="btn-ghost w-full text-sm disabled:opacity-60"
              >
                Marquer en cours d'examen
              </button>
            </div>
          )}

          {selectedApp.admin_response && (
            <div className="bg-navy-50 rounded-xl p-4">
              <p className="font-bold text-navy-900 text-xs uppercase mb-1">Réponse précédente</p>
              <p className="text-sm text-gray-600">{selectedApp.admin_response}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy-900">Candidatures livreurs</h1>
        <p className="text-gray-500 text-sm">Examinez les candidatures, les tests et les documents</p>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="input-field pl-10"
            placeholder="Rechercher par nom ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-40"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="submitted">Soumises</option>
          <option value="under_review">En examen</option>
          <option value="info_requested">Info demandée</option>
          <option value="accepted">Acceptées</option>
          <option value="rejected">Refusées</option>
        </select>
      </div>

      {error && (
        <div className="card p-4 mb-4 bg-error-50 border border-error-100">
          <p className="text-sm text-error-700">
            Impossible de charger les candidatures: {error}. Les données seront accessibles une fois l'authentification configurée.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-orange-500" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Bike size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Aucune candidature à afficher.</p>
          <p className="text-xs text-gray-300 mt-1">Les candidatures soumises par les livreurs apparaîtront ici.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {filtered.map((app, i) => {
            const status = statusConfig[app.application_status] || statusConfig.submitted;
            const StatusIcon = status.icon;
            return (
              <button
                key={app.id}
                onClick={() => { setSelectedApp(app); fetchDetail(app.id); }}
                className={`w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0 font-bold text-orange-600">
                  {app.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-navy-900 text-sm truncate">{app.full_name}</h3>
                  <p className="text-xs text-gray-400">{vehicleLabels[app.vehicle_type]} · {app.commune} · {app.phone}</p>
                  {app.application_number && <p className="text-xs text-gray-300">{app.application_number}</p>}
                </div>
                <span className={`badge ${status.color} shrink-0`}>
                  <StatusIcon size={10} className="mr-1" /> {status.label}
                </span>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
