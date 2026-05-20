import { useState ,useMemo} from 'react';
import { useDispatch } from 'react-redux';
import { login, getMe, register, verifyRegistrationOtp, resendRegistrationOtp, forgotPassword, verifyForgotPasswordOtp, resetPassword } from '../api/auth';
import { setCredentials } from '../store/authSlice';
import bgImg from '../assets/Restaurant_business_plan_main.jpg';

// ─── Shared helpers ───────────────────────────────────────────────────────────
const Spinner = () => (
    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
);

const Alert = ({ msg, type = 'danger' }) =>
    msg ? <div className={`alert alert-${type} py-2 small`} role="alert">{msg}</div> : null;

const RightPanel = () => (
    <div
        className="col-lg-6 d-none d-lg-block"
        style={{
            backgroundImage: `url(${bgImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '0 0.375rem 0.375rem 0',
            minHeight: 460,
            position: 'relative',
        }}
    >
        <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            borderRadius: '0 0.375rem 0.375rem 0',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-end', padding: '2rem',
        }}>
            <h4 className="text-white fw-bold mb-2">Grow your restaurant business</h4>
            <p className="text-white-50 mb-0 small">
                Manage menus, track orders and reach more customers — all in one place.
            </p>
        </div>
    </div>
);

// ─── View: Login ─────────────────────────────────────────────────────────────
const LoginView = ({ onSuccess, goRegister, goForgot }) => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            // 1) Authenticate to get token
            const data = await login(email, password);
            localStorage.setItem('token', data.token);
            // 2) Fetch current user profile to populate Redux + role-based routing
            const me = await getMe();
            dispatch(setCredentials({ token: data.token, userId: me.userId, name: me.name, email: me.email, role: me.role }));
            onSuccess();
        } catch (err) {
            setError(err?.response?.data?.message || err?.response?.data || 'Invalid email or password');
        } finally { setLoading(false); }
    };

    return (
        <div className="p-5">
            <h3 className="fw-bold mb-1" style={{ color: '#e65c00' }}>Food App</h3>
            <p className="text-muted mb-4 small">Sign in to your account</p>
            <h5 className="fw-semibold mb-1">Welcome back!</h5>
            <p className="text-muted small mb-4">Enter your credentials to continue.</p>
            <Alert msg={error} />
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label fw-medium" htmlFor="li-email">Email address</label>
                    <input id="li-email" type="email" className="form-control" placeholder="you@example.com"
                        value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
                </div>
                <div className="mb-1">
                    <label className="form-label fw-medium" htmlFor="li-pass">Password</label>
                    <input id="li-pass" type="password" className="form-control" placeholder="Enter your password"
                        value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                </div>
                <div className="text-end mb-3">
                    <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={goForgot}>
                        Forgot password?
                    </button>
                </div>
                <button type="submit" className="btn btn-dark w-100" disabled={loading}>
                    {loading ? <><Spinner />Signing in...</> : 'Sign In'}
                </button>
            </form>
            <hr className="my-4" />
            <p className="text-center text-muted small mb-0">
                Don't have an account?{' '}
                <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={goRegister}>
                    Register
                </button>
            </p>
        </div>
    );
};

// ─── View: Register (step 1) ─────────────────────────────────────────────────
// ─── Password complexity ──────────────────────────────────────────────────────
const PWD_RULES = [
    { id: 'len',     label: 'At least 8 characters',          test: (p) => p.length >= 8 },
    { id: 'upper',   label: 'One uppercase letter (A-Z)',      test: (p) => /[A-Z]/.test(p) },
    { id: 'lower',   label: 'One lowercase letter (a-z)',      test: (p) => /[a-z]/.test(p) },
    { id: 'digit',   label: 'One number (0-9)',                test: (p) => /[0-9]/.test(p) },
    { id: 'special', label: 'One special character (!@#$…)',   test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const PasswordStrength = ({ password }) => {
    if (!password) return null;
    const results = PWD_RULES.map((r) => ({ ...r, ok: r.test(password) }));
    const passed = results.filter((r) => r.ok).length;
    const segColor =
        passed <= 1 ? '#dc3545' :
        passed <= 2 ? '#fd7e14' :
        passed <= 3 ? '#ffc107' :
        passed === 4 ? '#20c997' :
        '#198754';
    const strengthLabel =
        passed <= 1 ? 'Very weak' :
        passed <= 2 ? 'Weak' :
        passed <= 3 ? 'Fair' :
        passed === 4 ? 'Good' :
        'Strong';
    return (
        <div className="mt-2">
            {/* 5-segment bar */}
            <div className="d-flex gap-1 mb-1">
                {results.map((r, i) => (
                    <div
                        key={r.id}
                        style={{
                            flex: 1,
                            height: 5,
                            borderRadius: 3,
                            background: r.ok ? segColor : '#dee2e6',
                            transition: 'background 0.2s',
                        }}
                    />
                ))}
            </div>
            <div className="d-flex justify-content-between align-items-center mb-1">
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: segColor }}>{strengthLabel}</span>
                <span style={{ fontSize: '0.7rem', color: '#6c757d' }}>{passed}/5</span>
            </div>
            {/* Rule checklist */}
            <ul className="mb-0 ps-0" style={{ listStyle: 'none' }}>
                {results.map((r) => (
                    <li key={r.id} className="d-flex align-items-center gap-1" style={{ fontSize: '0.72rem', color: r.ok ? '#198754' : '#6c757d' }}>
                        <span style={{ fontWeight: 700 }}>{r.ok ? '✓' : '○'}</span>
                        <span>{r.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const RegisterView = ({ onOtpSent, goLogin }) => {
    const [form, setForm] = useState({ age: '', name: '', street: '', city: '', state: '', email: '', password: '', role: 'CUSTOMER' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const failedRules = PWD_RULES.filter((r) => !r.test(form.password));
        if (failedRules.length > 0) {
            setError(`Password must include: ${failedRules.map((r) => r.label.toLowerCase()).join(', ')}.`);
            return;
        }
        setLoading(true); setError('');
        try {
            await register({ ...form, age: form.age ? Number(form.age) : undefined });
            onOtpSent(form.email);
        } catch (err) {
            setError(err?.response?.data?.message || err?.response?.data || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="p-4 p-lg-5 overflow-auto" style={{ maxHeight: '85vh' }}>
            <h5 className="fw-bold mb-1" style={{ color: '#e65c00' }}>Create account</h5>
            <p className="text-muted small mb-3">Fill in your details — we'll send an OTP to verify your email.</p>
            <Alert msg={error} />
            <form onSubmit={handleSubmit}>
                <div className="row g-2">
                    <div className="col-8">
                        <label className="form-label fw-medium small" htmlFor="r-name">Full name</label>
                        <input id="r-name" type="text" className="form-control form-control-sm" placeholder="Jane Doe"
                            value={form.name} onChange={set('name')} required />
                    </div>
                    <div className="col-4">
                        <label className="form-label fw-medium small" htmlFor="r-age">Age</label>
                        <input id="r-age" type="number" className="form-control form-control-sm" placeholder="25"
                            min="0" value={form.age} onChange={set('age')} />
                    </div>
                    <div className="col-12">
                        <label className="form-label fw-medium small" htmlFor="r-email">Email</label>
                        <input id="r-email" type="email" className="form-control form-control-sm" placeholder="you@example.com"
                            value={form.email} onChange={set('email')} required autoComplete="username" />
                    </div>
                    <div className="col-12">
                        <label className="form-label fw-medium small" htmlFor="r-pass">Password</label>
                        <input id="r-pass" type="password" className="form-control form-control-sm" placeholder="Min 8 characters"
                            value={form.password} onChange={set('password')} required autoComplete="new-password" />
                        <PasswordStrength password={form.password} />
                    </div>
                    <div className="col-12">
                        <label className="form-label fw-medium small" htmlFor="r-street">Street</label>
                        <input id="r-street" type="text" className="form-control form-control-sm" placeholder="123 Main St"
                            value={form.street} onChange={set('street')} required />
                    </div>
                    <div className="col-6">
                        <label className="form-label fw-medium small" htmlFor="r-city">City</label>
                        <input id="r-city" type="text" className="form-control form-control-sm" placeholder="Delhi"
                            value={form.city} onChange={set('city')} required />
                    </div>
                    <div className="col-6">
                        <label className="form-label fw-medium small" htmlFor="r-state">State</label>
                        <input id="r-state" type="text" className="form-control form-control-sm" placeholder="DL"
                            value={form.state} onChange={set('state')} required />
                    </div>
                    <div className="col-12">
                        <label className="form-label fw-medium small" htmlFor="r-role">I am a…</label>
                        <select id="r-role" className="form-select form-select-sm" value={form.role} onChange={set('role')}>
                            <option value="CUSTOMER">Customer</option>
                            <option value="OWNER">Restaurant Owner</option>
                        </select>
                    </div>
                </div>
                <button type="submit" className="btn btn-dark w-100 mt-3" disabled={loading}>
                    {loading ? <><Spinner />Sending OTP...</> : 'Continue'}
                </button>
            </form>
            <p className="text-center text-muted small mt-3 mb-0">
                Already have an account?{' '}
                <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={goLogin}>Sign in</button>
            </p>
        </div>
    );
};

// ─── View: OTP verification (used for both registration & forgot-password) ───
const OtpView = ({ title, subtitle, email, onVerify, onResend, loading, error, resendLoading, resendMsg }) => {
    const [otp, setOtp] = useState('');

    return (
        <div className="p-5">
            <h5 className="fw-bold mb-1" style={{ color: '#e65c00' }}>{title}</h5>
            <p className="text-muted small mb-1">{subtitle}</p>
            <p className="small mb-3">
                Code sent to <strong>{email}</strong>
            </p>
            <Alert msg={error} />
            <Alert msg={resendMsg} type="success" />
            <form onSubmit={(e) => { e.preventDefault(); onVerify(otp); }}>
                <div className="mb-4">
                    <label className="form-label fw-medium" htmlFor="otp-input">One-time password</label>
                    <input
                        id="otp-input"
                        type="text"
                        className="form-control form-control-lg text-center tracking-widest"
                        placeholder="______"
                        maxLength={8}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        autoComplete="one-time-code"
                        style={{ letterSpacing: '0.4em', fontSize: '1.4rem' }}
                    />
                </div>
                <button type="submit" className="btn btn-dark w-100" disabled={loading}>
                    {loading ? <><Spinner />Verifying...</> : 'Verify OTP'}
                </button>
            </form>
            <p className="text-center text-muted small mt-3 mb-0">
                Didn't receive it?{' '}
                <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={onResend} disabled={resendLoading}>
                    {resendLoading ? 'Resending…' : 'Resend OTP'}
                </button>
            </p>
        </div>
    );
};

// ─── View: Forgot password — enter email ────────────────────────────────────
const ForgotEmailView = ({ onOtpSent, goLogin }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await forgotPassword(email);
            onOtpSent(email);
        } catch (err) {
            setError(err?.response?.data?.message || err?.response?.data || 'Email not found');
        } finally { setLoading(false); }
    };

    return (
        <div className="p-5">
            <h5 className="fw-bold mb-1" style={{ color: '#e65c00' }}>Forgot password</h5>
            <p className="text-muted small mb-4">Enter your registered email and we'll send you a reset OTP.</p>
            <Alert msg={error} />
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="form-label fw-medium" htmlFor="fp-email">Email address</label>
                    <input id="fp-email" type="email" className="form-control" placeholder="you@example.com"
                        value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
                </div>
                <button type="submit" className="btn btn-dark w-100" disabled={loading}>
                    {loading ? <><Spinner />Sending OTP...</> : 'Send OTP'}
                </button>
            </form>
            <p className="text-center text-muted small mt-3 mb-0">
                <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={goLogin}>← Back to sign in</button>
            </p>
        </div>
    );
};

// ─── View: Reset password ────────────────────────────────────────────────────
const ResetPasswordView = ({ email, otp, onSuccess, goLogin }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const strongEnough = useMemo(
        () => PWD_RULES.every((r) => r.test(newPassword)),
        [newPassword]
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        const failedRules = PWD_RULES.filter((r) => !r.test(newPassword));
        if (failedRules.length > 0) {
            setError(`Password must include: ${failedRules.map((r) => r.label.toLowerCase()).join(', ')}.`);
            return;
        }
        if (newPassword !== confirm) { setError('Passwords do not match'); return; }
        setLoading(true); setError('');
        try {
            await resetPassword(email, otp, newPassword);
            setSuccess('Password reset successfully! You can now sign in.');
        } catch (err) {
            setError(err?.response?.data?.message || err?.response?.data || 'Reset failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="p-5">
            <h5 className="fw-bold mb-1" style={{ color: '#e65c00' }}>Set new password</h5>
            <p className="text-muted small mb-4">Choose a strong password for <strong>{email}</strong>.</p>
            <Alert msg={error} />
            <Alert msg={success} type="success" />
            {!success && (
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-medium" htmlFor="rp-new">New password</label>
                        <input id="rp-new" type="password" className="form-control" placeholder="Min 8 characters"
                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
                        {/* Reuse the same password strength UI as registration */}
                        <PasswordStrength password={newPassword} />
                        {!strongEnough && newPassword && (
                            <div className="small text-muted mt-2">
                                Tip: Use a mix of uppercase, lowercase, number, and special character.
                            </div>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-medium" htmlFor="rp-confirm">Confirm password</label>
                        <input id="rp-confirm" type="password" className="form-control" placeholder="Repeat password"
                            value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" />
                    </div>
                    <button type="submit" className="btn btn-dark w-100" disabled={loading}>
                        {loading ? <><Spinner />Resetting...</> : 'Reset Password'}
                    </button>
                </form>
            )}
            {success && (
                <button type="button" className="btn btn-dark w-100 mt-2" onClick={goLogin}>Sign In</button>
            )}
        </div>
    );
};

// ─── Root component ──────────────────────────────────────────────────────────
const Login = () => {
    // view: 'login' | 'register' | 'reg-otp' | 'forgot' | 'fp-otp' | 'reset'
    const [view, setView] = useState('login');
    const [pendingEmail, setPendingEmail] = useState('');
    const [verifiedOtp, setVerifiedOtp] = useState('');

    // OTP state for registration
    const [regOtpLoading, setRegOtpLoading] = useState(false);
    const [regOtpError, setRegOtpError] = useState('');
    const [regResendLoading, setRegResendLoading] = useState(false);
    const [regResendMsg, setRegResendMsg] = useState('');

    // OTP state for forgot password
    const [fpOtpLoading, setFpOtpLoading] = useState(false);
    const [fpOtpError, setFpOtpError] = useState('');
    const [fpResendLoading, setFpResendLoading] = useState(false);
    const [fpResendMsg, setFpResendMsg] = useState('');

    // Registration OTP handlers
    const handleRegOtpSent = (email) => {
        setPendingEmail(email);
        setRegOtpError(''); setRegResendMsg('');
        setView('reg-otp');
    };
    const handleVerifyRegOtp = async (otp) => {
        setRegOtpLoading(true); setRegOtpError('');
        try {
            await verifyRegistrationOtp(pendingEmail, otp);
            setView('login');
        } catch (err) {
            setRegOtpError(err?.response?.data?.message || err?.response?.data || 'Invalid or expired OTP');
        } finally { setRegOtpLoading(false); }
    };
    const handleResendRegOtp = async () => {
        setRegResendLoading(true); setRegResendMsg(''); setRegOtpError('');
        try {
            await resendRegistrationOtp(pendingEmail);
            setRegResendMsg('OTP resent! Check your inbox.');
        } catch (err) {
            setRegOtpError(err?.response?.data?.message || 'Failed to resend OTP');
        } finally { setRegResendLoading(false); }
    };

    // Forgot password OTP handlers
    const handleFpOtpSent = (email) => {
        setPendingEmail(email);
        setFpOtpError(''); setFpResendMsg('');
        setView('fp-otp');
    };
    const handleVerifyFpOtp = async (otp) => {
        setFpOtpLoading(true); setFpOtpError('');
        try {
            await verifyForgotPasswordOtp(pendingEmail, otp);
            setVerifiedOtp(otp);
            setView('reset');
        } catch (err) {
            setFpOtpError(err?.response?.data?.message || err?.response?.data || 'Invalid or expired OTP');
        } finally { setFpOtpLoading(false); }
    };
    const handleResendFpOtp = async () => {
        setFpResendLoading(true); setFpResendMsg(''); setFpOtpError('');
        try {
            await forgotPassword(pendingEmail);
            setFpResendMsg('OTP resent! Check your inbox.');
        } catch (err) {
            setFpOtpError(err?.response?.data?.message || 'Failed to resend OTP');
        } finally { setFpResendLoading(false); }
    };

    const renderLeft = () => {
        switch (view) {
            case 'register':
                return <RegisterView onOtpSent={handleRegOtpSent} goLogin={() => setView('login')} />;
            case 'reg-otp':
                return (
                    <OtpView
                        title="Verify your email"
                        subtitle="Enter the OTP sent to complete your registration."
                        email={pendingEmail}
                        onVerify={handleVerifyRegOtp}
                        onResend={handleResendRegOtp}
                        loading={regOtpLoading}
                        error={regOtpError}
                        resendLoading={regResendLoading}
                        resendMsg={regResendMsg}
                    />
                );
            case 'forgot':
                return <ForgotEmailView onOtpSent={handleFpOtpSent} goLogin={() => setView('login')} />;
            case 'fp-otp':
                return (
                    <OtpView
                        title="Password reset OTP"
                        subtitle="Enter the OTP sent to reset your password."
                        email={pendingEmail}
                        onVerify={handleVerifyFpOtp}
                        onResend={handleResendFpOtp}
                        loading={fpOtpLoading}
                        error={fpOtpError}
                        resendLoading={fpResendLoading}
                        resendMsg={fpResendMsg}
                    />
                );
            case 'reset':
                return <ResetPasswordView email={pendingEmail} otp={verifiedOtp} onSuccess={() => setView('login')} goLogin={() => setView('login')} />;
            default:
                return (
                    <LoginView
                        onSuccess={() => {}}
                        goRegister={() => setView('register')}
                        goForgot={() => setView('forgot')}
                    />
                );
        }
    };

    return (
        // Full-screen centered login/register container
        <div data-bs-theme="light" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
            {/* Main card with form on left, image on right */}
            <div className="card border-0 shadow-lg" style={{ maxWidth: 900, width: '100%' }}>
                <div className="row g-0">
                    {/* Dynamic form panel (login/register/otp/reset) */}
                    <div className="col-lg-6 overflow-auto" style={{ maxHeight: '90vh' }}>
                        {renderLeft()}
                    </div>
                    {/* Decorative right panel with background image */}
                    <RightPanel />
                </div>
            </div>
        </div>
    );
};

export default Login;
