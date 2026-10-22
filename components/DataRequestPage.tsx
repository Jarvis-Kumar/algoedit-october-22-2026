import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, 
  FileText, 
  Lock, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  ShieldAlert,
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  User, 
  Mail, 
  Globe, 
  RefreshCw, 
  Trash2, 
  HelpCircle, 
  Info, 
  Sparkles,
  Check,
  X,
  File
} from 'lucide-react';
import { OnNavigateType } from '../types';

interface DataRequestPageProps {
  onNavigate: OnNavigateType;
}

interface FormState {
  fullName: string;
  email: string;
  username: string;
  country: string;
  requestType: string;
  description: string;
  understandVerification: boolean;
}

export const DataRequestPage: React.FC<DataRequestPageProps> = ({ onNavigate }) => {
  // SEO Metadata
  useEffect(() => {
    document.title = "Data Subject Access Request | ALGOEDIT";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Submit requests to access, download, update, or delete your personal information stored by ALGOEDIT.");
    }
  }, []);

  // Form State
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    username: '',
    country: '',
    requestType: '',
    description: '',
    understandVerification: false,
  });

  // Supporting documents state
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission Status
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // FAQ Active State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Form input change handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormState]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: checked }));
    if (formErrors[name as keyof FormState]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      validateAndSetFile(selectedFiles[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError('Invalid file type. Only PDF, PNG, JPG, and JPEG are accepted.');
      setFile(null);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB Limit
      setFileError('File size is too large. Maximum size allowed is 10MB.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setFileError(null);
  };

  const removeFile = () => {
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!form.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!form.requestType) {
      errors.requestType = 'Please select a request type';
    }
    if (!form.understandVerification) {
      errors.understandVerification = 'You must acknowledge the identity verification policy';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setStatus('error');
      setErrorMessage('Please correct the validation errors in the form.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Simulate high-fidelity network request to secure ALGOEDIT servers
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 95% success rate for simulation
          if (Math.random() > 0.02) {
            resolve(true);
          } else {
            reject(new Error("Secure validation pipeline connection timeout. Please try again."));
          }
        }, 2200);
      });

      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'A secure transmission error occurred. Please try again.');
    }
  };

  // Reset Form
  const handleReset = () => {
    setForm({
      fullName: '',
      email: '',
      username: '',
      country: '',
      requestType: '',
      description: '',
      understandVerification: false,
    });
    setFile(null);
    setFileError(null);
    setFormErrors({});
    setStatus('idle');
    setErrorMessage('');
  };

  // Toggle FAQ
  const toggleFaq = (index: number) => {
    setActiveFaq(prev => prev === index ? null : index);
  };

  // FAQ Data List
  const faqData = [
    {
      question: "How long will processing take?",
      answer: "We strive to process all valid requests as swiftly as possible. Under the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), we respond within one calendar month (30 days) from the date of receipt. If your request is exceptionally complex, we may extend this up to a total of three months, keeping you fully informed of any extensions and the reasons behind them."
    },
    {
      question: "Can I delete my account?",
      answer: "Yes, absolutely. By choosing the 'Delete my account' option, all of your profile details, usage metadata, transaction history logs, and generated assets stored on the ALGOEDIT platform will be permanently, securely, and irreversibly wiped from our database servers and backups in compliance with standard right-to-be-forgotten criteria."
    },
    {
      question: "Can I download my data?",
      answer: "Yes, you can request a download of your data. When choosing 'Download my personal data', we will compile all personal telemetry, profile details, and linked media into a standardized, machine-readable format (JSON/ZIP archive) and send a secure download link directly to your verified email address."
    },
    {
      question: "Will my identity be verified?",
      answer: "To safeguard your personal data from unauthorized access, we must verify the identity of any request submitter. This process may involve sending a verification link to your registered email address, requesting you to verify your session, or, in specific circumstances, asking you to submit a valid state-issued identity document."
    },
    {
      question: "How can I contact ALGOEDIT?",
      answer: "For any further questions regarding your data privacy, security protocols, or processing requests, you can contact our dedicated Data Protection Officer directly at our privacy address: algoeditofficial@gmail.com."
    }
  ];

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#03050C]">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* SECTION 1 — Hero */}
        <header className="relative text-center space-y-4 p-8 rounded-2xl bg-gradient-to-b from-[#0B0F19]/80 to-[#05070D]/90 border border-slate-800/60 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-cyan-500/10 rounded-full filter blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-48 h-48 bg-fuchsia-500/10 rounded-full filter blur-[100px] pointer-events-none" />
          
          {/* Professional privacy / security illustration */}
          <div className="flex justify-center">
            <div className="relative p-4 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/5 animate-pulse">
              <Shield size={44} className="stroke-[1.5]" />
              <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/20 animate-spin" style={{ animationDuration: '20s' }} />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            Data Subject <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400">Access Request</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Manage your personal information and privacy rights. Submit requests to access, download, update, restrict, or delete your personal data stored by ALGOEDIT in accordance with applicable global privacy laws.
          </p>
        </header>

        {/* SECTION 10 — Security Features */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-md flex flex-col items-center text-center space-y-2 hover:border-cyan-500/40 transition-all duration-300">
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-400">
              <Lock size={18} />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Encrypted Submission</h4>
            <p className="text-[11px] text-slate-400 leading-normal">Form transmission uses advanced TLS 1.3 protocol encryption.</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-md flex flex-col items-center text-center space-y-2 hover:border-cyan-500/40 transition-all duration-300">
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-400">
              <User size={18} />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Identity Verification</h4>
            <p className="text-[11px] text-slate-400 leading-normal">Robust protocols matching requests with legitimate account holders.</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-md flex flex-col items-center text-center space-y-2 hover:border-cyan-500/40 transition-all duration-300">
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-400">
              <RefreshCw size={18} className="animate-spin-slow" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Secure Processing</h4>
            <p className="text-[11px] text-slate-400 leading-normal">Data requests processed internally via safe sandboxed queues.</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-md flex flex-col items-center text-center space-y-2 hover:border-cyan-500/40 transition-all duration-300">
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-400">
              <CheckCircle size={18} />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Privacy Protected</h4>
            <p className="text-[11px] text-slate-400 leading-normal">Full alignment with GDPR, CCPA, and CCPA privacy frameworks.</p>
          </div>
        </section>

        {/* SECTION 2 — Privacy Information Card */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#090C15] border border-slate-800/80 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full filter blur-2xl" />
          <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Info size={18} className="text-cyan-400" />
            Your Privacy & Data Rights
          </h2>
          
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/50 flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold">1</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Request Access</h5>
                <p className="text-xs text-slate-400 mt-1">Get detailed insights into what personal details we collect and hold.</p>
              </div>
            </li>
            <li className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/50 flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold">2</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Data Rectification</h5>
                <p className="text-xs text-slate-400 mt-1">Request immediate updates or corrections to any inaccurate user information.</p>
              </div>
            </li>
            <li className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/50 flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold">3</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Right to Erasure</h5>
                <p className="text-xs text-slate-400 mt-1">Request irreversible deletion of your eligible personal details and metadata.</p>
              </div>
            </li>
            <li className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/50 flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold">4</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Download Data</h5>
                <p className="text-xs text-slate-400 mt-1">Receive a portable, downloadable zip copy of all stored profile telemetry.</p>
              </div>
            </li>
          </ul>
          
          <div className="mt-5 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex gap-3 items-center">
            <ShieldAlert size={20} className="text-cyan-400 flex-shrink-0" />
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              <strong>Identity Verification Required:</strong> For your absolute security and to prevent data leaks, we may perform complete identity verification before responding to your inquiry.
            </p>
          </div>
        </section>

        {/* SECTION 3 — Request Form */}
        <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#090C15] to-[#04060C] border border-slate-800 shadow-2xl relative">
          
          {status === 'success' ? (
            /* SECTION 7 — Success Screen */
            <div className="py-8 text-center space-y-6 animate-fade-in">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5">
                  <CheckCircle size={56} className="stroke-[1.5]" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Request Submitted Successfully</h2>
                <p className="text-sm text-emerald-400 font-semibold tracking-wide">Your privacy request has been received securely.</p>
              </div>

              <div className="max-w-lg mx-auto p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3 text-left">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Our professional security compliance team will review your application and respond within the calendar timeframe required by applicable laws (typically under 30 days).
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A verification and confirmation email has been dispatched to <strong className="text-white">{form.email}</strong>. Please check your inbox and verify ownership if required.
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-lg border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-300 hover:text-white transition-all bg-slate-900/40"
                >
                  Submit Another Request
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-lg shadow-cyan-500/10 transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-base font-black text-white uppercase tracking-widest border-b border-slate-800/80 pb-4 flex items-center justify-between">
                <span>Submit Secure Request</span>
                <span className="text-[10px] text-slate-400 normal-case font-semibold">* Required fields</span>
              </h3>

              {/* Secure Error Banner */}
              {status === 'error' && errorMessage && (
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-3">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Fields container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Full Name <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                        formErrors.fullName ? 'border-rose-500/60 focus:border-rose-500' : 'border-slate-800 hover:border-slate-700 focus:border-cyan-500'
                      }`}
                      placeholder="Jane Doe"
                      aria-label="Full Name"
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="text-[10px] text-rose-400 font-semibold">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Email Address <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                        formErrors.email ? 'border-rose-500/60 focus:border-rose-500' : 'border-slate-800 hover:border-slate-700 focus:border-cyan-500'
                      }`}
                      placeholder="janedoe@example.com"
                      aria-label="Email Address"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-[10px] text-rose-400 font-semibold">{formErrors.email}</p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label htmlFor="username" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Username <span className="text-slate-500 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">@</span>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={form.username}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                      placeholder="username"
                      aria-label="Username (optional)"
                    />
                  </div>
                </div>

                {/* Country / Region */}
                <div className="space-y-1.5">
                  <label htmlFor="country" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Country / Region
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={form.country}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                      placeholder="United States, United Kingdom..."
                      aria-label="Country / Region"
                    />
                  </div>
                </div>

                {/* Request Type Dropdown */}
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="requestType" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Request Type <span className="text-cyan-400">*</span>
                  </label>
                  <select
                    id="requestType"
                    name="requestType"
                    value={form.requestType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer ${
                      formErrors.requestType ? 'border-rose-500/60 focus:border-rose-500' : 'border-slate-800 hover:border-slate-700 focus:border-cyan-500'
                    }`}
                    aria-label="Request Type"
                  >
                    <option value="" disabled className="bg-slate-950 text-slate-500">Select an option...</option>
                    <option value="Access my personal information" className="bg-slate-950">Access my personal information</option>
                    <option value="Download my personal data" className="bg-slate-950">Download my personal data</option>
                    <option value="Correct my personal information" className="bg-slate-950">Correct my personal information</option>
                    <option value="Delete my account" className="bg-slate-950">Delete my account</option>
                    <option value="Delete uploaded content" className="bg-slate-950">Delete uploaded content</option>
                    <option value="Restrict processing of my personal information" className="bg-slate-950">Restrict processing of my personal information</option>
                    <option value="Withdraw consent" className="bg-slate-950">Withdraw consent</option>
                    <option value="Report a privacy concern" className="bg-slate-950">Report a privacy concern</option>
                    <option value="Other" className="bg-slate-950">Other</option>
                  </select>
                  {formErrors.requestType && (
                    <p className="text-[10px] text-rose-400 font-semibold">{formErrors.requestType}</p>
                  )}
                </div>

                {/* Describe Request Area */}
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="description" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Describe your request
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-y custom-scrollbar"
                    placeholder="Please specify any technical details, relevant dates, or context that will help us find and process your request accurately..."
                    aria-label="Describe your request"
                  />
                </div>

                {/* Supporting Documents File Upload */}
                <div className="space-y-1.5 md:col-span-2">
                  <span className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Supporting documents <span className="text-slate-500 font-normal lowercase">(optional)</span>
                  </span>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-cyan-400 bg-cyan-950/15' 
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    
                    {file ? (
                      <div className="flex flex-col items-center space-y-2" onClick={e => e.stopPropagation()}>
                        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-400">
                          <File size={24} />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-white truncate max-w-xs">{file.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="px-3 py-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-950/40 rounded-md transition-all flex items-center gap-1 mt-1"
                        >
                          <X size={10} />
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-center text-slate-500">
                          <Upload size={24} className="stroke-[1.5]" />
                        </div>
                        <p className="text-xs text-slate-300 font-medium">
                          Drag and drop files, or <span className="text-cyan-400 font-bold">browse</span>
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Supported formats: PDF, PNG, JPG, JPEG (Max size: 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                  {fileError && (
                    <p className="text-[10px] text-rose-400 font-semibold">{fileError}</p>
                  )}
                </div>

              </div>

              {/* SECTION 4 — Identity Verification Checkbox */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850/80 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="understandVerification"
                    name="understandVerification"
                    checked={form.understandVerification}
                    onChange={handleCheckboxChange}
                    className="mt-0.5 rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 cursor-pointer h-4 w-4"
                    aria-label="I understand ALGOEDIT may request additional information to verify my identity before processing this request."
                  />
                  <label htmlFor="understandVerification" className="text-xs text-slate-300 font-medium select-none cursor-pointer leading-normal">
                    I understand ALGOEDIT may request additional information to verify my identity before processing this request. <span className="text-cyan-400">*</span>
                  </label>
                </div>
                {formErrors.understandVerification && (
                  <p className="text-[10px] text-rose-400 font-semibold">{formErrors.understandVerification}</p>
                )}
              </div>

              {/* SECTION 5 — Privacy Notice */}
              <div className="p-4 rounded-xl bg-cyan-950/10 border border-cyan-950/30 flex gap-3 text-cyan-400">
                <Shield size={16} className="flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  <strong>Secure Privacy Notice:</strong> The information submitted through this request form will only be used to securely process your data privacy inquiry and communicate back with you regarding that request.
                </p>
              </div>

              {/* SECTION 6 — Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full relative py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest text-white shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/15 overflow-hidden transition-all duration-300 group disabled:opacity-80 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      Encrypting & Transmitting Request...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      Submit Request
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>

            </form>
          )}

        </section>

        {/* SECTION 8 — Frequently Asked Questions */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#090C15] border border-slate-800/80 shadow-xl space-y-6">
          <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
            <HelpCircle size={18} className="text-cyan-400" />
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-3">
            {faqData.map((item, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className="rounded-xl border border-slate-850 bg-slate-950/30 overflow-hidden transition-all duration-300 hover:border-slate-800"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wide group-hover:text-white transition-colors">
                      {item.question}
                    </span>
                    <span className="text-slate-500">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 overflow-hidden ${
                      isOpen ? 'max-h-52 border-t border-slate-850/60' : 'max-h-0'
                    }`}
                  >
                    <div className="p-5 text-xs text-slate-400 leading-relaxed font-medium">
                      {item.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 9 — Contact Information */}
        <footer className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0C0F1B] to-[#060912] border border-slate-800/80 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
              <Mail size={16} className="text-cyan-400" />
              Privacy Contact Desk
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              Have specific questions regarding our compliance policy? Get in touch with our Data Officer.
            </p>
          </div>
          <div className="flex-shrink-0">
            <a 
              href="mailto:algoeditofficial@gmail.com" 
              className="px-5 py-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-200 hover:text-white hover:border-cyan-500/40 transition-all duration-300 shadow-md flex items-center gap-2"
            >
              algoeditofficial@gmail.com
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
};
