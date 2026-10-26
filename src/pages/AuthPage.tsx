import { useState } from 'react';
import { Eye, EyeOff, Mail, Phone, Lock, User, MapPin, ArrowRight, Check } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useApp } from '@/context';
import { COMMUNES } from '@/data';
import type { UserRole } from '@/types';

export function AuthPage() {
  const { login } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('client');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [form, setForm] = useState({
    identifier: '',
    password: '',
    name: '',
    phone: '',
    email: '',
    commune: 'Cocody',
  });

  const update = (key: string, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: '' }));
  };

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!form.identifier.trim()) e.identifier = 'Entrez votre e-mail ou téléphone';
    if (form.password.length < 6) e.password = 'Le mot de passe doit faire au moins 6 caractères';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSignup = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'Entrez votre nom complet';
    if (!/^[+0-9\s]{8,}$/.test(form.phone)) e.phone = 'Numéro de téléphone invalide';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Adresse e-mail invalide';
    if (form.password.length < 6) e.password = 'Le mot de passe doit faire au moins 6 caractères';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (mode === 'login' && validateLogin()) {
      login(role, undefined);
    } else if (mode === 'signup' && validateSignup()) {
      login(role, form.name);
    } else if (mode === 'forgot') {
      setResetSent(true);
    }
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: 'client', label: 'Client' },
    { value: 'driver', label: 'Livreur' },
    { value: 'merchant', label: 'Commerçant' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left: Hero image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(8,43,82,0.75), rgba(8,43,82,0.85)), url(https://images.pexels.com/photos/7381785/pexels-photo-7381785.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200)` }}
      >
        <Logo variant="light" size="lg" />
        <div className="text-white">
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Tout ce dont vous avez besoin,<br />livré à votre porte !
          </h1>
          <p className="text-lg text-navy-100 max-w-md">
            Courses au marché, produits, restaurants, colis et services locaux dans toute l'Abidjan et ses environs.
          </p>
          <div className="flex gap-6 mt-8">
            <div>
              <div className="text-3xl font-extrabold text-orange-400">1200+</div>
              <div className="text-sm text-navy-100">Clients satisfaits</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-orange-400">3400+</div>
              <div className="text-sm text-navy-100">Livraisons effectuées</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-orange-400">50+</div>
              <div className="text-sm text-navy-100">Commerçants partenaires</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="md" />
          </div>

          {mode === 'forgot' ? (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Mot de passe oublié</h2>
              <p className="text-gray-500 mb-6">
                {resetSent
                  ? 'Un lien de réinitialisation a été envoyé si le compte existe.'
                  : 'Entrez votre e-mail ou téléphone pour réinitialiser votre mot de passe.'}
              </p>
              {resetSent ? (
                <div className="bg-success-50 border border-success-100 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <Check className="text-success-600" size={20} />
                  <span className="text-success-700 text-sm font-medium">Demande envoyée avec succès.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label-text">E-mail ou téléphone</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        className="input-field pl-10"
                        placeholder="exemple@email.ci"
                        value={form.identifier}
                        onChange={(e) => update('identifier', e.target.value)}
                      />
                    </div>
                    {errors.identifier && <p className="text-error-500 text-sm mt-1">{errors.identifier}</p>}
                  </div>
                  <button type="submit" className="btn-primary w-full">Envoyer le lien</button>
                </form>
              )}
              <button onClick={() => { setMode('login'); setResetSent(false); }} className="btn-ghost w-full mt-4">
                Retour à la connexion
              </button>
            </div>
          ) : (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold text-navy-900 mb-1">
                {mode === 'login' ? 'Connexion' : 'Créer un compte'}
              </h2>
              <p className="text-gray-500 mb-6">
                {mode === 'login' ? 'Connectez-vous pour accéder à votre espace' : 'Rejoignez CourseCI en quelques secondes'}
              </p>

              {/* Role selector */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`py-2.5 px-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      role === r.value
                        ? 'bg-navy-800 text-white shadow-card'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="label-text">Nom complet</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          className="input-field pl-10"
                          placeholder="Awa Koné"
                          value={form.name}
                          onChange={(e) => update('name', e.target.value)}
                        />
                      </div>
                      {errors.name && <p className="text-error-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label-text">Téléphone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            className="input-field pl-10"
                            placeholder="+225 07 ..."
                            value={form.phone}
                            onChange={(e) => update('phone', e.target.value)}
                          />
                        </div>
                        {errors.phone && <p className="text-error-500 text-sm mt-1">{errors.phone}</p>}
                      </div>
                      <div>
                        <label className="label-text">Commune</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <select
                            className="input-field pl-10 appearance-none"
                            value={form.commune}
                            onChange={(e) => update('commune', e.target.value)}
                          >
                            {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="label-text">E-mail (facultatif)</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          className="input-field pl-10"
                          placeholder="exemple@email.ci"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                        />
                      </div>
                      {errors.email && <p className="text-error-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </>
                )}

                {mode === 'login' && (
                  <div>
                    <label className="label-text">E-mail ou téléphone</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        className="input-field pl-10"
                        placeholder="exemple@email.ci"
                        value={form.identifier}
                        onChange={(e) => update('identifier', e.target.value)}
                      />
                    </div>
                    {errors.identifier && <p className="text-error-500 text-sm mt-1">{errors.identifier}</p>}
                  </div>
                )}

                <div>
                  <label className="label-text">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pl-10 pr-10"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-error-500 text-sm mt-1">{errors.password}</p>}
                </div>

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setMode('forgot')} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                      Mot de passe oublié ?
                    </button>
                  </div>
                )}

                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                  <ArrowRight size={18} />
                </button>

                {submitted && (
                  <p className="text-error-500 text-sm text-center">Veuillez corriger les erreurs ci-dessus.</p>
                )}
              </form>

              <div className="text-center mt-6">
                {mode === 'login' ? (
                  <p className="text-gray-500 text-sm">
                    Pas encore de compte ?{' '}
                    <button onClick={() => { setMode('signup'); setErrors({}); }} className="text-orange-600 hover:text-orange-700 font-semibold">
                      Créer un compte
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Déjà inscrit ?{' '}
                    <button onClick={() => { setMode('login'); setErrors({}); }} className="text-orange-600 hover:text-orange-700 font-semibold">
                      Se connecter
                    </button>
                  </p>
                )}
              </div>

              <div className="mt-6 p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-400">
                  Démo: choisissez un rôle puis connectez-vous. Les réseaux sociaux seront disponibles une fois configurés.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
