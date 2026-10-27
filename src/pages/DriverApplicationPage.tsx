import { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Check, User, Bike, FileText, HelpCircle,
  Mail, Phone, MapPin, Upload, Loader2, AlertCircle, MessageSquare,
  CheckCircle, Clock, XCircle, Car,
} from 'lucide-react';
import { useApp } from '@/context';
import { supabase } from '@/lib/supabase';
import { COMMUNES } from '@/data';

interface TestQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  category: string;
}

interface ApplicationForm {
  fullName: string;
  phone: string;
  email: string;
  commune: string;
  workZone: string;
  vehicleType: 'moto' | 'velo' | 'voiture' | 'autre';
  vehicleInfo: string;
  availabilityHours: string;
  experience: string;
  idDocumentType: string;
  idDocumentNumber: string;
  messageToAdmin: string;
}

const vehicleIcons: Record<string, typeof Bike> = {
  moto: Bike,
  velo: Bike,
  voiture: Car,
  autre: Car,
};

const steps = ['Identité', 'Véhicule', 'Documents', 'Test', 'Message', 'Confirmation'];

export function DriverApplicationPage() {
  const { setPage, user } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [testScore, setTestScore] = useState<number | null>(null);
  const [existingApp, setExistingApp] = useState<{ id: string; application_status: string; application_number: string | null } | null>(null);

  const [form, setForm] = useState<ApplicationForm>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    commune: user?.commune || 'Cocody',
    workZone: '',
    vehicleType: 'moto',
    vehicleInfo: '',
    availabilityHours: '',
    experience: '',
    idDocumentType: 'CNI',
    idDocumentNumber: '',
    messageToAdmin: '',
  });

  const update = (key: keyof ApplicationForm, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  useEffect(() => {
    fetchQuestions();
    checkExistingApplication();
  }, []);

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const { data, error } = await supabase
        .from('driver_test_questions')
        .select('id, question, option_a, option_b, option_c, option_d, category')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setQuestions((data || []) as TestQuestion[]);
    } catch {
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const checkExistingApplication = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data } = await supabase
        .from('driver_applications')
        .select('id, application_status, application_number')
        .eq('applicant_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setExistingApp(data as { id: string; application_status: string; application_number: string | null });
      }
    } catch {
      // No existing application
    }
  };

  const validateStep = (): boolean => {
    setError('');
    switch (stepIndex) {
      case 0:
        if (!form.fullName.trim()) { setError('Le nom complet est requis'); return false; }
        if (!/^[+0-9\s]{8,}$/.test(form.phone)) { setError('Numéro de téléphone invalide'); return false; }
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('E-mail invalide'); return false; }
        if (!form.commune) { setError('La commune est requise'); return false; }
        return true;
      case 1:
        if (!form.vehicleType) { setError('Choisissez un type de véhicule'); return false; }
        if (!form.vehicleInfo.trim()) { setError('Décrivez votre véhicule'); return false; }
        return true;
      case 2:
        if (!form.idDocumentType) { setError('Type de pièce requis'); return false; }
        if (!form.idDocumentNumber.trim()) { setError('Numéro de pièce requis'); return false; }
        return true;
      case 3:
        if (Object.keys(answers).length < questions.length) {
          setError('Répondez à toutes les questions'); return false;
        }
        return true;
      case 4:
        if (form.messageToAdmin.trim().length < 20) {
          setError('Votre message doit faire au moins 20 caractères'); return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (stepIndex === 3) {
      // Calculate test score
      let correct = 0;
      questions.forEach((q) => {
        if (answers[q.id] === 'correct') correct++;
      });
      const score = Math.round((correct / questions.length) * 100);
      setTestScore(score);
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const handleSubmit = async () => {
    if (testScore === null) return;
    setSubmitting(true);
    setError('');

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setError('Vous devez être connecté pour soumettre une candidature.');
        setSubmitting(false);
        return;
      }

      const appNumber = `CAND-${Date.now().toString().slice(-6)}`;
      const { data, error: insertErr } = await supabase
        .from('driver_applications')
        .insert({
          applicant_id: authUser.id,
          full_name: form.fullName,
          phone: form.phone,
          email: form.email || null,
          commune: form.commune,
          work_zone: form.workZone || null,
          vehicle_type: form.vehicleType,
          availability_hours: form.availabilityHours || null,
          experience: form.experience || null,
          id_document_type: form.idDocumentType,
          id_document_number: form.idDocumentNumber,
          message_to_admin: form.messageToAdmin,
          application_status: 'submitted',
          application_number: appNumber,
        })
        .select('id')
        .single();

      if (insertErr) throw insertErr;

      // Save test answers if we have an application ID
      if (data) {
        const answerRows = questions.map((q) => ({
          application_id: data.id,
          question_id: q.id,
          selected_answer: answers[q.id] || 'a',
          is_correct: answers[q.id] === 'correct',
        }));
        await supabase.from('driver_test_answers').insert(answerRows);
      }

      setSubmitted(true);
    } catch {
      setError('Erreur lors de la soumission. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  // Show submitted state
  if (submitted || (existingApp && existingApp.application_status !== 'draft')) {
    const status = existingApp?.application_status || 'submitted';
    const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
      draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-600', icon: Clock },
      submitted: { label: 'Candidature soumise', color: 'bg-blue-100 text-blue-700', icon: Clock },
      under_review: { label: 'En cours d\'examen', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      info_requested: { label: 'Informations complémentaires demandées', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
      accepted: { label: 'Candidature acceptée', color: 'bg-success-100 text-success-700', icon: CheckCircle },
      rejected: { label: 'Candidature refusée', color: 'bg-error-100 text-error-700', icon: XCircle },
    };
    const cfg = statusConfig[status] || statusConfig.submitted;
    const StatusIcon = cfg.icon;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setPage('driver-home')} className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft size={20} className="text-navy-700" />
          </button>
          <h1 className="text-xl font-extrabold text-navy-900">Candidature livreur</h1>
        </div>

        <div className="card p-8 text-center space-y-4">
          <div className={`w-16 h-16 rounded-full ${cfg.color} flex items-center justify-center mx-auto`}>
            <StatusIcon size={32} />
          </div>
          <h2 className="text-lg font-bold text-navy-900">{cfg.label}</h2>
          {existingApp?.application_number && (
            <p className="text-sm text-gray-500">
              Numéro de candidature: <strong>{existingApp.application_number}</strong>
            </p>
          )}
          {testScore !== null && (
            <div className="bg-navy-50 rounded-xl p-4">
              <p className="text-sm text-navy-700">
                Score au test: <strong className="text-lg">{testScore}%</strong>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                La réussite au test ne remplace pas l'approbation humaine de l'administration.
              </p>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-4 text-left">
            <p className="text-sm text-gray-600">
              Votre candidature sera examinée par notre équipe. Vous recevrez une réponse à l'adresse e-mail
              et au téléphone que vous avez fournis. Un compte livreur actif ne sera créé qu'après approbation
              de votre dossier par un administrateur autorisé.
            </p>
          </div>
          <button onClick={() => setPage('driver-home')} className="btn-primary w-full">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setPage('driver-home')} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-navy-700" />
        </button>
        <h1 className="text-xl font-extrabold text-navy-900">Devenir livreur Course CI</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 ${i <= stepIndex ? 'text-navy-900' : 'text-gray-300'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i < stepIndex ? 'bg-success-500 text-white' :
                i === stepIndex ? 'bg-navy-800 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {i < stepIndex ? <Check size={14} /> : i + 1}
              </div>
              <span className="text-xs font-semibold hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < stepIndex ? 'bg-success-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-error-50 border border-error-100 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-error-500 shrink-0" size={20} />
          <p className="text-sm text-error-700">{error}</p>
        </div>
      )}

      {/* Step 0: Identity */}
      {stepIndex === 0 && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <User size={20} className="text-orange-500" />
            <h2 className="font-bold text-navy-900">Informations d'identité</h2>
          </div>
          <div>
            <label className="label-text">Nom et prénom *</label>
            <input className="input-field" placeholder="Ex: Ibrahim Traoré" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Téléphone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input className="input-field pl-9" placeholder="+225 07 ..." value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label-text">E-mail (facultatif)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input className="input-field pl-9" placeholder="exemple@email.ci" value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Commune *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select className="input-field pl-9" value={form.commune} onChange={(e) => update('commune', e.target.value)}>
                  {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label-text">Zone de travail</label>
              <input className="input-field" placeholder="Ex: Cocody Riviera" value={form.workZone} onChange={(e) => update('workZone', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Vehicle */}
      {stepIndex === 1 && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <Bike size={20} className="text-orange-500" />
            <h2 className="font-bold text-navy-900">Véhicule</h2>
          </div>
          <div>
            <label className="label-text">Type de véhicule *</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {(['moto', 'velo', 'voiture', 'autre'] as const).map((v) => {
                const Icon = vehicleIcons[v];
                return (
                  <button
                    key={v}
                    onClick={() => update('vehicleType', v)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      form.vehicleType === v ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={22} className={form.vehicleType === v ? 'text-orange-500' : 'text-gray-400'} />
                    <span className="text-xs font-semibold capitalize">{v === 'velo' ? 'Vélo' : v === 'voiture' ? 'Voiture' : v === 'moto' ? 'Moto' : 'Autre'}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label-text">Description du véhicule *</label>
            <input className="input-field" placeholder="Ex: Yamaha 125cc, plaque CI-1234" value={form.vehicleInfo} onChange={(e) => update('vehicleInfo', e.target.value)} />
          </div>
          <div>
            <label className="label-text">Disponibilité</label>
            <input className="input-field" placeholder="Ex: 7h - 20h, lundi à samedi" value={form.availabilityHours} onChange={(e) => update('availabilityHours', e.target.value)} />
          </div>
          <div>
            <label className="label-text">Expérience (facultatif)</label>
            <textarea className="input-field min-h-20" placeholder="Décrivez votre expérience de livraison" value={form.experience} onChange={(e) => update('experience', e.target.value)} />
          </div>
        </div>
      )}

      {/* Step 2: Documents */}
      {stepIndex === 2 && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={20} className="text-orange-500" />
            <h2 className="font-bold text-navy-900">Documents justificatifs</h2>
          </div>
          <p className="text-sm text-gray-500">
            Vos documents seront vérifiés manuellement par notre administration.
            Ils ne sont pas accessibles publiquement.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Type de pièce *</label>
              <select className="input-field" value={form.idDocumentType} onChange={(e) => update('idDocumentType', e.target.value)}>
                <option value="CNI">Carte nationale d'identité</option>
                <option value="Passeport">Passeport</option>
                <option value="Permis">Permis de conduire</option>
                <option value="Attestation">Attestation d'identité</option>
              </select>
            </div>
            <div>
              <label className="label-text">Numéro de pièce *</label>
              <input className="input-field" placeholder="Ex: CI123456789" value={form.idDocumentNumber} onChange={(e) => update('idDocumentNumber', e.target.value)} />
            </div>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <Upload size={24} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500 font-medium">Téléversez vos documents</p>
            <p className="text-xs text-gray-400 mt-1">
              Pièce d'identité, permis, photo de profil. La vérification se fera après soumission.
            </p>
            <button className="btn-outline mt-3 text-sm" disabled>
              <Upload size={14} /> Téléverser (bientôt disponible)
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Test */}
      {stepIndex === 3 && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle size={20} className="text-orange-500" />
            <h2 className="font-bold text-navy-900">Test de recrutement</h2>
          </div>
          <p className="text-sm text-gray-500">
            Répondez aux questions sur la sécurité routière, la relation client et les procédures de livraison.
            La réussite au test ne remplace pas l'approbation humaine.
          </p>
          {loadingQuestions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-orange-500" size={24} />
            </div>
          ) : questions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucune question disponible pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={q.id} className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-sm text-navy-900 mb-3">
                    {i + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswers((p) => ({ ...p, [q.id]: opt }))}
                        className={`text-left p-3 rounded-lg border-2 text-sm transition-all ${
                          answers[q.id] === opt
                            ? 'border-orange-500 bg-orange-50 text-navy-900'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <span className="font-bold mr-2">{opt.toUpperCase()}.</span>
                        {q[`option_${opt}`]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Message */}
      {stepIndex === 4 && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={20} className="text-orange-500" />
            <h2 className="font-bold text-navy-900">Message à l'administration</h2>
          </div>
          <p className="text-sm text-gray-500">
            Présentez votre candidature et expliquez pourquoi vous souhaitez devenir livreur Course CI.
            Ce message est obligatoire.
          </p>
          <textarea
            className="input-field min-h-32"
            placeholder="Présentez-vous, votre motivation, votre disponibilité..."
            value={form.messageToAdmin}
            onChange={(e) => update('messageToAdmin', e.target.value)}
          />
          <p className="text-xs text-gray-400">{form.messageToAdmin.length} caractères (minimum 20)</p>
        </div>
      )}

      {/* Step 5: Confirmation */}
      {stepIndex === 5 && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} className="text-success-600" />
            <h2 className="font-bold text-navy-900">Validation de votre candidature</h2>
          </div>

          {testScore !== null && (
            <div className={`rounded-xl p-4 ${testScore >= 70 ? 'bg-success-50' : 'bg-orange-50'}`}>
              <p className="text-sm font-bold">
                Score au test: {testScore}%
              </p>
              <p className="text-xs mt-1 text-gray-600">
                {testScore >= 70
                  ? 'Vous avez réussi le test. L\'approbation finale reste à l\'administration.'
                  : 'Votre score est sous le seuil recommandé. L\'administration examinera votre dossier.'}
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Nom</span><span className="font-semibold">{form.fullName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span className="font-semibold">{form.phone}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Commune</span><span className="font-semibold">{form.commune}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Véhicule</span><span className="font-semibold capitalize">{form.vehicleType}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Pièce</span><span className="font-semibold">{form.idDocumentType} ({form.idDocumentNumber})</span></div>
          </div>

          <div className="bg-navy-50 rounded-xl p-4">
            <p className="text-xs text-navy-700">
              En soumettant cette candidature, vous acceptez que vos informations soient examinées
              par l'administration de Course CI. Votre compte livreur ne sera activé qu'après approbation.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <><Loader2 size={18} className="animate-spin" /> Soumission...</> : <><Check size={18} /> Valider ma candidature</>}
          </button>
        </div>
      )}

      {/* Navigation buttons */}
      {stepIndex < 5 && (
        <div className="flex gap-3">
          <button onClick={handleBack} disabled={stepIndex === 0} className="btn-outline flex-1 disabled:opacity-50">
            Retour
          </button>
          <button onClick={handleNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
            Continuer <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
