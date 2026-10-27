import { useState } from 'react';
import { Eye, EyeOff, Mail, Phone, Lock, User, MapPin, ArrowRight, Check, Shield, Loader2, KeyRound } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useApp } from '@/context';
import { COMMUNES } from '@/data';
import type { UserRole, User as AppUser } from '@/types';
import { supabase } from '@/lib/supabase';

export function AuthPage() {
  const { login, loginWithSession } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'admin' | 'admin-code'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('client');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Admin 2FA state
  const [adminEmail2FA, setAdminEmail2FA] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [devCode, setDevCode] = useState('');

  const [form, setForm] = useState({
    identifier: '',
    password: '',
    name: '',
    phone: '',
    email: '',
    commune: 'Cocody',
    adminEmail: '',
  });

  const update = (key: string, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: '' }));
    setAuthError('');
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
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Adresse e-mail valide requise';
    if (form.password.length < 6) e.password = 'Le mot de passe doit faire au moins 6 caractères';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateAdmin = () => {
    const e: Record<string, string> = {};
    if (!form.adminEmail.trim()) e.adminEmail = 'Entrez votre e-mail administrateur';
    if (form.password.length < 11) e.password = 'Le mot de passe administrateur doit faire au moins 11 caractères';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setAuthError('');
    if (mode === 'login' && validateLogin()) {
      await handleLogin();
    } else if (mode === 'signup' && validateSignup()) {
      await handleSignup();
    } else if (mode === 'forgot') {
      setResetSent(true);
    } else if (mode === 'admin' && validateAdmin()) {
      await handleAdminLogin();
    } else if (mode === 'admin-code') {
      await handleVerifyCode();
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.identifier.includes('@') ? form.identifier : `${form.identifier}@course.ci`,
        password: form.password,
      });

      if (error) {
        setAuthError(error.message || 'Identifiants incorrects');
        setSubmitted(true);
        return;
      }

      if (data.user) {
        const meta = data.user.user_metadata || {};
        const userRole = (meta.role as UserRole) || 'client';
        const sessionUser: AppUser = {
          id: data.user.id,
          name: meta.name || data.user.email?.split('@')[0] || 'Utilisateur',
          phone: meta.phone || '',
          email: data.user.email || '',
          role: userRole,
          commune: meta.commune || 'Cocody',
          avatarUrl: meta.avatarUrl || 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&h=120&w=120',
        };
        loginWithSession(sessionUser, userRole);
      }
    } catch {
      setAuthError('Erreur de connexion. Vérifiez votre connexion internet et réessayez.');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            phone: form.phone,
            commune: form.commune,
            role: role,
            avatarUrl: role === 'driver'
              ? 'https://images.pexels.com/photos/37059837/pexels-photo-37059837.jpeg?auto=compress&cs=tinysrgb&h=120&w=120'
              : role === 'merchant'
              ? 'https://images.pexels.com/photos/32459865/pexels-photo-32459865.jpeg?auto=compress&cs=tinysrgb&h=120&w=120'
              : 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&h=120&w=120',
          },
        },
      });

      if (error) {
        setAuthError(error.message || 'Erreur lors de la création du compte');
        setSubmitted(true);
        return;
      }

      if (data.user) {
        const sessionUser: AppUser = {
          id: data.user.id,
          name: form.name,
          phone: form.phone,
          email: form.email,
          role: role,
          commune: form.commune,
          avatarUrl: role === 'driver'
            ? 'https://images.pexels.com/photos/37059837/pexels-photo-37059837.jpeg?auto=compress&cs=tinysrgb&h=120&w=120'
            : role === 'merchant'
            ? 'https://images.pexels.com/photos/32459865/pexels-photo-32459865.jpeg?auto=compress&cs=tinysrgb&h=120&w=120'
            : 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&h=120&w=120',
        };
        loginWithSession(sessionUser, role);
      }
    } catch {
      setAuthError('Erreur lors de la création du compte. Réessayez.');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-login`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: form.adminEmail,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || 'Connexion administrateur refusée');
        setSubmitted(true);
        return;
      }

      if (data.success) {
        // Password verified — now request 2FA code
        setAdminEmail2FA(form.adminEmail);
        await sendVerificationCode(form.adminEmail);
      } else {
        setAuthError('Connexion administrateur refusée');
        setSubmitted(true);
      }
    } catch {
      setAuthError('Erreur de connexion au serveur. Vérifiez votre connexion et réessayez.');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (email: string) => {
    setLoading(true);
    setAuthError('');
    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-admin-code`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ admin_email: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || 'Erreur lors de l\'envoi du code');
        setMode('admin');
        setSubmitted(true);
        return;
      }

      if (data.test_mode && data.dev_code) {
        setDevCode(data.dev_code);
      }

      setMode('admin-code');
    } catch {
      setAuthError('Erreur lors de l\'envoi du code de vérification. Réessayez.');
      setMode('admin');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-admin-code`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          admin_email: adminEmail2FA,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || 'Code de vérification invalide');
        setSubmitted(true);
        return;
      }

      if (data.verified) {
        login('admin', undefined);
      } else {
        setAuthError('Code de vérification invalide ou expiré');
        setSubmitted(true);
      }
    } catch {
      setAuthError('Erreur lors de la vérification. Réessayez.');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: 'client', label: 'Client' },
    { value: 'driver', label: 'Livreur' },
    { value: 'merchant', label: 'Commerçant' },
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
                  : 'Entrez votre e-mail pour réinitialiser votre mot de passe.'}
              </p>
              {resetSent ? (
                <div className="bg-success-50 border border-success-100 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <Check className="text-success-600" size={20} />
                  <span className="text-success-700 text-sm font-medium">Demande envoyée avec succès.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label-text">E-mail</label>
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
          ) : mode === 'admin-code' ? (
            <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-navy-800 flex items-center justify-center">
                  <KeyRound className="text-orange-400" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-navy-900">Code de vérification</h2>
                  <p className="text-gray-500 text-sm">Un code temporaire a été envoyé à {adminEmail2FA}</p>
                </div>
              </div>

              {devCode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-yellow-700">
                    <strong>Mode test :</strong> le code est <strong>{devCode}</strong>.
                    Configurez un service d'e-mail pour l'envoi réel.
                  </p>
                </div>
              )}

              {authError && (
                <div className="bg-error-50 border border-error-100 rounded-xl p-4 mb-6">
                  <p className="text-error-700 text-sm font-medium">{authError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-text">Code à 6 chiffres</label>
                  <input
                    className="input-field text-center text-2xl tracking-widest font-bold"
                    placeholder="000000"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => { setVerificationCode(e.target.value.replace(/[^0-9]/g, '')); setAuthError(''); }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Vérifier le code</>}
                </button>
              </form>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => sendVerificationCode(adminEmail2FA)}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Renvoyer le code
                </button>
                <button
                  onClick={() => { setMode('admin'); setAuthError(''); setVerificationCode(''); }}
                  className="text-sm text-gray-500 hover:text-navy-700 font-medium"
                >
                  Retour
                </button>
              </div>
            </div>
          ) : mode === 'admin' ? (
            <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-navy-800 flex items-center justify-center">
                  <Shield className="text-orange-400" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-navy-900">Accès administration</h2>
                  <p className="text-gray-500 text-sm">Réservé aux administrateurs autorisés</p>
                </div>
              </div>

              {authError && (
                <div className="bg-error-50 border border-error-100 rounded-xl p-4 mb-6">
                  <p className="text-error-700 text-sm font-medium">{authError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-text">E-mail administrateur</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      className="input-field pl-10"
                      placeholder="admin@course.ci"
                      value={form.adminEmail}
                      onChange={(e) => update('adminEmail', e.target.value)}
                    />
                  </div>
                  {errors.adminEmail && <p className="text-error-500 text-sm mt-1">{errors.adminEmail}</p>}
                </div>

                <div>
                  <label className="label-text">Mot de passe (11 caractères minimum)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pl-10 pr-10"
                      placeholder="•••••••••••"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>'Accéder au tableau de bord' <ArrowRight size={18} /></>}
                </button>
              </form>

              <button
                onClick={() => { setMode('login'); setErrors({}); setAuthError(''); }}
                className="text-sm text-gray-500 hover:text-navy-700 font-medium mt-6 block w-full text-center"
              >
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

              {/* Role selector — Admin removed from public options */}
              <div className="grid grid-cols-3 gap-2 mb-6">
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

              {authError && (
                <div className="bg-error-50 border border-error-100 rounded-xl p-4 mb-4">
                  <p className="text-error-700 text-sm font-medium">{authError}</p>
                </div>
              )}

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
                      <label className="label-text">E-mail</label>
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
                    <label className="label-text">E-mail</label>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'} <ArrowRight size={18} /></>}
                </button>
              </form>

              <div className="text-center mt-6">
                {mode === 'login' ? (
                  <p className="text-gray-500 text-sm">
                    Pas encore de compte ?{' '}
                    <button onClick={() => { setMode('signup'); setErrors({}); setAuthError(''); }} className="text-orange-600 hover:text-orange-700 font-semibold">
                      Créer un compte
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Déjà inscrit ?{' '}
                    <button onClick={() => { setMode('login'); setErrors({}); setAuthError(''); }} className="text-orange-600 hover:text-orange-700 font-semibold">
                      Se connecter
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Discrete admin access link — bottom corner */}
          {mode !== 'admin' && mode !== 'admin-code' && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => { setMode('admin'); setErrors({}); setAuthError(''); setSubmitted(false); }}
                className="text-xs text-gray-300 hover:text-gray-400 font-medium transition-colors flex items-center gap-1.5"
              >
                <Shield size={12} />
                Accès administration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
