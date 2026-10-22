import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Bug, Radio, CloudLightning, Activity, 
  Trash2, FileWarning, RefreshCw, X, Shield, Lock, Eye, AlertTriangle
} from 'lucide-react';
import { monitor } from '../services/security/monitoring';

export const HardeningControlCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'headers' | 'sentry' | 'analytics' | 'uploads' | 'ratelimits' | 'captcha'>('headers');
  const [sentryLogs, setSentryLogs] = useState<any[]>([]);
  const [gaLogs, setGaLogs] = useState<any[]>([]);
  const [perfLogs, setPerfLogs] = useState<any[]>([]);
  const [captchaStatus, setCaptchaStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [rateLimitSim, setRateLimitSim] = useState<{ [key: string]: number }>({
    'ai': 30,
    'auth': 15,
    'storage': 20,
    'payment': 20
  });

  useEffect(() => {
    const updateLogs = () => {
      setSentryLogs([...((window as any)._sentry_errors || [])]);
      setGaLogs([...((window as any)._ga_events || [])]);
      setPerfLogs([...((window as any)._perf_metrics || [])]);
    };

    // Poll for log updates
    const interval = setInterval(updateLogs, 1000);
    return () => clearInterval(interval);
  }, []);

  const simulateError = () => {
    try {
      const target: any = null;
      // Intentionally reference property of null to trigger real runtime error
      const action = target.trigger_simulated_uncaught_fault;
    } catch (e: any) {
      monitor.captureException(e, {
        severity: 'critical',
        simulated: true,
        triggerPath: 'HardeningControlCenter > buttonClick'
      });
      showToast('Simulated Exception Captured', 'Sentry pipeline logged the error event.', 'success');
    }
  };

  const simulateCustomEvent = () => {
    monitor.trackEvent('manual_dev_audit_trigger', {
      timestamp: Date.now(),
      auditor: 'parzevelh@gmail.com',
      verifiedPass: true
    });
    showToast('Analytics Event Logged', 'Google Analytics tracked manual_dev_audit_trigger.', 'info');
  };

  const simulateLatencyTracker = () => {
    const fakeLatency = Math.floor(Math.random() * 450) + 50;
    monitor.measurePerformance('/api/ai/image-recreate', fakeLatency);
    showToast('Latency Measured', `Logged /api/ai/image-recreate at ${fakeLatency}ms.`, 'info');
  };

  const triggerRateLimitDeduction = (key: string) => {
    setRateLimitSim(prev => {
      const current = prev[key];
      if (current <= 1) {
        showToast('Rate Limit Exceeded', `API 429 Status code simulated for /api/${key}`, 'error');
        return { ...prev, [key]: 0 };
      }
      return { ...prev, [key]: current - 1 };
    });
  };

  const resetLimits = () => {
    setRateLimitSim({
      'ai': 30,
      'auth': 15,
      'storage': 20,
      'payment': 20
    });
    showToast('Limits Refreshed', 'Rate limit simulator counters reset to standard values.', 'success');
  };

  const resolveCaptcha = (isSuccess: boolean) => {
    setCaptchaStatus(isSuccess ? 'success' : 'failed');
    monitor.trackEvent('captcha_verification_completed', { success: isSuccess });
    showToast('CAPTCHA Token Action', isSuccess ? 'Google Recaptcha token response validated' : 'Verification token mismatch', isSuccess ? 'success' : 'error');
  };

  const clearCapturedLogs = () => {
    (window as any)._sentry_errors = [];
    (window as any)._ga_events = [];
    (window as any)._perf_metrics = [];
    setSentryLogs([]);
    setGaLogs([]);
    setPerfLogs([]);
    showToast('Audit Console Wiped', 'Active local sessions storage log vectors cleared.', 'info');
  };

  const showToast = (title: string, desc: string, filter: 'success' | 'info' | 'error') => {
    // Inject a notification dispatch matching standard structures
    console.log(`[Toast] ${title}: ${desc}`);
  };

  const securityPolicies = [
    { name: 'Content-Security-Policy', value: 'default-src \'self\'; script-src \'self\' https://www.googletagmanager.com; frame-src \'self\' https://ais-pre-rosawfzwgoqac6egsaum7x-145278888165.asia-east1.run.app;', status: 'ARMED' },
    { name: 'X-Frame-Options', value: 'SAMEORIGIN (strict iframe hijacking prevention)', status: 'ARMED' },
    { name: 'X-Content-Type-Options', value: 'nosniff (mime-type sniffing block)', status: 'ARMED' },
    { name: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload (HSTS Forced TLS)', status: 'ARMED' },
    { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin', status: 'ARMED' },
    { name: 'X-XSS-Protection', value: '1; mode=block', status: 'ARMED' },
  ];

  const forbiddenExtensions = ['.exe', '.bat', '.cmd', '.sh', '.msi', '.vbs', '.js', '.jar', '.vbe', '.wsf', '.paf'];
  const uploadBands = [
    { plan: 'Free', limit: '25 MB' },
    { plan: 'Pro', limit: '100 MB' },
    { plan: 'Creator', limit: '250 MB' },
    { plan: 'Business', limit: '5 GB' },
  ];

  return (
    <>
      {/* Floating Launcher Trigger Badge */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] group flex items-center justify-center p-3.5 bg-gradient-to-r from-red-600 to-fuchsia-600 text-white rounded-full shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.7)] hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/10"
        title="Open Pre-Launch Shield Console"
      >
        <Shield size={22} className="text-white animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300">
          Shield Console
        </span>
      </button>

      {/* Main Console Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#0b0c10] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden font-mono text-xs text-gray-300">
            
            {/* Header section with telemetry pulse */}
            <div className="flex items-center justify-between p-5 bg-[#12131a] border-b border-white/5 relative">
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-amber-500 via-red-500 to-fuchsia-500" />
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-amber-400" /> Pre-Launch Hardening Audit Control Node
                  </h3>
                  <p className="text-[9.5px] text-slate-500 uppercase tracking-wider">Enterprise Reliability • Active Threat Defenses</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-white/5 hover:bg-red-500/10 rounded-lg hover:text-red-400 transition-all cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Sub-navigation tabs */}
            <div className="flex bg-[#0f1017] border-b border-white/5 overflow-x-auto select-none">
              {[
                { id: 'headers', label: 'CSP Headers', icon: Lock },
                { id: 'sentry', label: 'Sentry Captures', icon: Bug },
                { id: 'analytics', label: 'Telemetry Events', icon: Radio },
                { id: 'uploads', label: 'File Policies', icon: FileWarning },
                { id: 'ratelimits', label: 'Rate-Limit Simulator', icon: CloudLightning },
                { id: 'captcha', label: 'CAPTCHA Toggles', icon: Eye },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3.5 border-b-2 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'border-amber-400 text-amber-300 bg-white/5' 
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <tab.icon size={12} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content screens */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6">
              
              {activeTab === 'headers' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5">
                    <h4 className="font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <Shield size={14} /> Global Security Headers Verification
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Express custom middleware injects secure, compliant transport layers blocking visual hijacking, framing, and clickjacking attacks in standard iframe sandboxes.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {securityPolicies.map((p, i) => (
                      <div key={i} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2 hover:border-amber-400/20 transition-all">
                        <div className="space-y-1">
                          <span className="text-[10.5px] font-black text-white">{p.name}</span>
                          <p className="text-[10px] text-slate-400 font-mono select-all break-all">{p.value}</p>
                        </div>
                        <span className="self-start md:self-center bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2.5 py-1 rounded border border-emerald-500/25 tracking-widest uppercase">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'sentry' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-black text-red-400 uppercase tracking-wider flex items-center gap-2">
                        <Bug size={14} /> Sentry Integrated Exception Logs
                      </h4>
                      <p className="text-[10px] text-slate-400">Captured runtime errors and promise exceptions are reported instantly.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={simulateError}
                        className="px-4 py-2 bg-red-600/15 text-red-300 hover:bg-red-600 hover:text-white rounded-lg font-bold border border-red-500/30 transition-all uppercase tracking-wider text-[9.5px] cursor-pointer cursor-pulse"
                      >
                        Simulate Uncaught UI Fault
                      </button>
                      <button
                        onClick={clearCapturedLogs}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Clear Local Log Arrays"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {sentryLogs.length === 0 ? (
                    <div className="p-10 border border-dashed border-white/5 rounded-xl text-center flex flex-col items-center justify-center gap-2.5">
                      <ShieldCheck size={28} className="text-emerald-500/50" />
                      <p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest">No exceptions captured yet in active workspace</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto">
                      {sentryLogs.map((log, index) => (
                        <div key={index} className="p-3.5 bg-red-950/10 border border-red-500/15 rounded-xl space-y-2">
                          <div className="flex justify-between text-[10px] pb-1 border-b border-red-500/10">
                            <span className="font-black text-red-400">{log.name || 'Error'}</span>
                            <span className="text-slate-500 text-[9px]">{log.timestamp}</span>
                          </div>
                          <span className="text-white font-bold leading-normal block">{log.message}</span>
                          {log.stack && (
                            <pre className="p-2 bg-black/40 rounded text-[9.5px] text-slate-400 overflow-x-auto whitespace-pre font-mono max-h-[100px]">
                              {log.stack}
                            </pre>
                          )}
                          <div className="text-[9px] text-slate-500">
                            DSN Node: <span className="text-[8px] text-amber-500">{log.sentryDsn}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                        <Radio size={14} /> Telemetry & Google Analytics Stream
                      </h4>
                      <p className="text-[10px] text-slate-400">Live operational events dispatched from the front-end user actions.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={simulateCustomEvent}
                        className="px-3.5 py-2 bg-[#8DB8CC]/15 text-[#8DB8CC] hover:bg-[#8DB8CC] hover:text-[#050709] rounded-lg font-bold border border-[#8DB8CC]/30 transition-all uppercase tracking-wider text-[9.5px] cursor-pointer"
                      >
                        Log Custom Event
                      </button>
                      <button
                        onClick={simulateLatencyTracker}
                        className="px-3.5 py-2 bg-[#10161B] text-[#AFC3CF] hover:bg-[#1A2229] hover:text-white rounded-lg font-bold border border-[#26313A] hover:border-[#8DB8CC]/40 transition-all uppercase tracking-wider text-[9.5px] cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Activity size={10} className="text-[#8DB8CC]" /> Sync Latency Metric
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Event Pipeline Column */}
                    <div className="space-y-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#8DB8CC] flex items-center gap-1.5">
                        <Radio size={10} className="animate-pulse" /> Active Event Pipeline ({gaLogs.length})
                      </span>
                      {gaLogs.length === 0 ? (
                        <div className="p-6 border border-dashed border-white/5 rounded-xl text-center text-slate-500 uppercase tracking-wider text-[9.5px]">
                          Waiting for event dispatches...
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto">
                          {gaLogs.map((evt, i) => (
                            <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1 hover:bg-white/[0.04]">
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="font-bold text-slate-400">gtag_event</span>
                                <span className="text-slate-500 text-[8px]">{evt.timestamp}</span>
                              </div>
                              <span className="font-black text-[#8DB8CC] block">{evt.eventName}</span>
                              <pre className="text-[8.5px] text-slate-500 font-mono whitespace-pre-wrap leading-tight">{JSON.stringify(evt.params, null, 2)}</pre>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Performance Latency Trackers */}
                    <div className="space-y-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#AFC3CF] flex items-center gap-1.5">
                        <Activity size={10} className="text-[#8DB8CC]" /> API Performance Metrics ({perfLogs.length})
                      </span>
                      {perfLogs.length === 0 ? (
                        <div className="p-6 border border-dashed border-white/5 rounded-xl text-center text-slate-500 uppercase tracking-wider text-[9.5px]">
                          No latency measurements logged...
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto">
                          {perfLogs.map((p, i) => (
                            <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5">
                              <div className="flex justify-between text-[9px] leading-tight text-slate-400">
                                <span className="truncate max-w-[200px] text-slate-300 font-mono block">{p.label}</span>
                                <span className="text-[#8DB8CC] font-bold">{p.durationMs}ms</span>
                              </div>
                              <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${p.durationMs > 350 ? 'bg-red-500' : p.durationMs > 200 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                  style={{ width: `${Math.min(100, (p.durationMs / 500) * 100)}%` }} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'uploads' && (
                <div className="space-y-5">
                  <div className="p-4 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-xl space-y-1.5">
                    <h4 className="font-black text-fuchsia-300 uppercase tracking-wider flex items-center gap-2">
                      <FileWarning size={14} /> File Extension & Plan Size Hardening
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Uploads undergo verification. Executable variants, reverse traversals (`../`), and files exceeding plan size thresholds are instantly blocked and rejected by the server boundary.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Extension Block panel */}
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                      <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 block pb-1 border-b border-white/5">
                        Executable Extensions Blocked (400 Bad Request)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {forbiddenExtensions.map((ext, idx) => (
                          <span key={idx} className="bg-red-500/10 text-red-400 text-[10px] font-bold font-mono px-2 py-1 rounded border border-red-500/20 uppercase">
                            {ext}
                          </span>
                        ))}
                      </div>
                      <p className="text-[9px] text-slate-500 italic leading-snug pt-1">
                        * Verification: The backend checks files both by parameter extension suffix AND MIME signatures.
                      </p>
                    </div>

                    {/* Plan upload limits */}
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                      <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 block pb-1 border-b border-white/5">
                        Plan upload size limits
                      </span>
                      <div className="space-y-2">
                        {uploadBands.map((band, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] p-1.5 bg-black/40 rounded border border-white/5">
                            <span className="font-bold text-white uppercase">{band.plan} Plan</span>
                            <span className="font-bold text-amber-300 font-mono uppercase">{band.limit} max</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ratelimits' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <CloudLightning size={14} /> Server-Side Rate Limiting Sandbox
                      </h4>
                      <p className="text-[10px] text-slate-400">Simulate rapid API traffic across specific subpaths. Limits refresh automatically each minute.</p>
                    </div>
                    <button
                      onClick={resetLimits}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-white/10 transition-all uppercase tracking-wider text-[9.5px] cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw size={11} /> Reset Simulator
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'ai', route: '/api/ai/*', desc: 'Model generation rates limit', limit: 30 },
                      { key: 'auth', route: '/api/mobile/*', desc: 'Login, registration & token credentials', limit: 15 },
                      { key: 'storage', route: '/api/storage/*', desc: 'Storage uploads and files cataloging ops', limit: 20 },
                      { key: 'payment', route: '/api/paypal/*', desc: 'Database stripe recharges, order checks', limit: 20 },
                    ].map(lim => {
                      const rem = rateLimitSim[lim.key] ?? lim.limit;
                      const ratio = (rem / lim.limit) * 100;
                      return (
                        <div key={lim.key} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 hover:border-amber-400/20 transition-all">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-black text-[10.5px] text-white block font-mono">{lim.route}</span>
                              <p className="text-[9.5px] text-slate-500 uppercase">{lim.desc}</p>
                            </div>
                            <span className={`text-[10.5px] font-black font-mono ${rem === 0 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
                              {rem}/{lim.limit}
                            </span>
                          </div>

                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${rem === 0 ? 'bg-red-500' : ratio < 35 ? 'bg-rose-500 animate-pulse' : ratio < 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${ratio}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center gap-2">
                            <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">INTERVAL: 60 SECS</span>
                            <button
                              onClick={() => triggerRateLimitDeduction(lim.key)}
                              className="px-2.5 py-1 bg-white/5 hover:bg-amber-400/10 hover:text-amber-300 rounded font-bold font-mono text-[9px] border border-white/5 transition-all text-slate-400 cursor-pointer"
                            >
                              Dispatch simulated hit
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'captcha' && (
                <div className="space-y-5">
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5">
                    <h4 className="font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <Eye size={14} /> Cloudflare Turnstile / reCAPTCHA Verification
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Protects entrypoints (Registration, Login, Payment checkouts) from bot abuse.
                    </p>
                  </div>

                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-5 max-w-md mx-auto text-center">
                    
                    {/* Simulated CAPTCHA widget Box */}
                    <div className="w-full bg-[#16171e] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-3">
                        {captchaStatus === 'success' ? (
                          <div className="w-7 h-7 bg-emerald-500/15 rounded-full flex items-center justify-center border border-emerald-500/30">
                            <ShieldCheck size={14} className="text-emerald-400" />
                          </div>
                        ) : captchaStatus === 'failed' ? (
                          <div className="w-7 h-7 bg-red-500/15 rounded-full flex items-center justify-center border border-red-500/30">
                            <ShieldAlert size={14} className="text-red-400" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 bg-amber-500/15 rounded-full flex items-center justify-center border border-amber-500/30 animate-spin">
                            <RefreshCw size={13} className="text-amber-400" />
                          </div>
                        )}
                        <div className="text-left font-sans select-none">
                          <span className="text-[10.5px] font-bold text-white block">Protected by reCAPTCHA</span>
                          <span className="text-[8.5px] text-slate-500 font-mono tracking-wide uppercase">Mock validation sequence</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => resolveCaptcha(true)}
                          className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500 hover:text-white rounded text-[9.5px] font-bold transition-all border border-emerald-500/30 cursor-pointer"
                        >
                          Pass Token
                        </button>
                        <button 
                          onClick={() => resolveCaptcha(false)}
                          className="px-2.5 py-1 bg-red-500/15 text-red-300 hover:bg-red-500 hover:text-white rounded text-[9.5px] font-bold transition-all border border-red-500/30 cursor-pointer"
                        >
                          Fail Token
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 text-[9px] uppercase tracking-wider block font-bold">CURRENT SECURED TOKEN STATUS</span>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${
                        captchaStatus === 'success' ? 'text-emerald-400' : captchaStatus === 'failed' ? 'text-red-400' : 'text-amber-400 animate-pulse'
                      }`}>
                        {captchaStatus === 'success' ? 'TOKEN_VERIFIED_SUCCESS' : captchaStatus === 'failed' ? 'VERIFICATION_REJECTED' : 'AWAITING_CHALLENGE'}
                      </p>
                    </div>

                    <div className="w-full pt-3 border-t border-white/5 text-left space-y-1 text-slate-500 text-[9px] leading-relaxed">
                      <span>• Keys deployed: <code className="font-mono text-amber-500 text-[8px] bg-black/40 px-1 py-0.5 rounded">6LeIxAcTAAAAAJcZVRKbAE6g...</code></span>
                      <span className="block">• Handled by: Server verification via POST body captcha response proxy checks.</span>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Footer console controller block */}
            <div className="p-4 bg-[#12131a] border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
              <span className="text-slate-500 text-[9px] leading-none uppercase tracking-wider font-bold">
                AUDITOR SECURE NODE: PARZEVELH@GMAIL.COM • PLATFORM STATUS: 200 OK
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all text-[9.5px] shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                CLOSE CONSOLE
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
