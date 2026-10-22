import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  HardDrive, 
  ShieldCheck, 
  Ticket, 
  RotateCcw, 
  Layout, 
  FileText, 
  ArrowRight, 
  Check, 
  X, 
  Search, 
  Shield, 
  ChevronDown, 
  Terminal, 
  Play, 
  Clipboard, 
  Mail, 
  RefreshCw, 
  BarChart2, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Wallet, 
  CreditCard, 
  ChevronRight, 
  AlertCircle, 
  Send, 
  Download, 
  Printer, 
  Percent, 
  CheckCircle2, 
  AlertOctagon,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RazorpayBillingPortalProps {
  user: any;
  onNavigate: (page: string) => void;
  onUpdateUser: (updates: any) => void;
  requireSignIn?: () => boolean;
}

// Preloaded mock database records
const INITIAL_PAYMENTS = [
  { id: 'pay_rzp_1a2b3c4d5e', userId: 'simulate-tester-user', plan: 'pro', amount: 29.00, currency: 'USD', status: 'SUCCESS', method: 'UPI', createdAt: '2026-06-10 14:24:11', invoiceNumber: 'INV-2026-9041' },
  { id: 'pay_rzp_9f8e7d6c5b', userId: 'simulate-tester-user', plan: 'creator', amount: 49.00, currency: 'USD', status: 'SUCCESS', method: 'CARD', createdAt: '2026-06-12 09:12:35', invoiceNumber: 'INV-2026-9150' },
  { id: 'pay_rzp_k1j2h3g4f5', userId: 'simulate-tester-user', plan: 'extra_storage_100', amount: 9.00, currency: 'USD', status: 'SUCCESS', method: 'GPLAY', createdAt: '2026-06-14 18:02:44', invoiceNumber: 'INV-2026-9289' },
  { id: 'pay_rzp_z9y8x7w6v5', userId: 'simulate-tester-user', plan: 'pro', amount: 29.00, currency: 'USD', status: 'FAILED', method: 'CARD', createdAt: '2026-06-15 11:30:19', invoiceNumber: 'INV-2026-9302' },
  { id: 'pay_rzp_q5w4e3r2t1', userId: 'simulate-tester-user', plan: 'business', amount: 199.00, currency: 'USD', status: 'SUCCESS', method: 'NETBANKING', createdAt: '2026-06-17 16:45:00', invoiceNumber: 'INV-2026-9411' },
];

export default function RazorpayBillingPortal({
  user,
  onNavigate,
  onUpdateUser,
  requireSignIn
}: RazorpayBillingPortalProps) {
  // Current Tab state
  const [activeTab, setActiveTab] = useState<'admin' | 'user' | 'dev' | 'history' | 'emails'>('user');

  // --- MOCK DATABASE STATE (Sync with User Tier & Local Override) ---
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'creator' | 'business'>(
    (user?.userTier as any)?.toLowerCase() || 'free'
  );
  
  // Storage fields tracker
  const [usedStorage, setUsedStorage] = useState<number>(1.24); // GB
  const [totalStorageLimit, setTotalStorageLimit] = useState<number>(5.0); // GB (Upgrades auto-elevate this)
  const [extraStoragePurchased, setExtraStoragePurchased] = useState<number>(0); // GB
  const [autoRenewal, setAutoRenewal] = useState<boolean>(true);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string>('2026-07-18');
  const [paymentsDatabase, setPaymentsDatabase] = useState<any[]>(INITIAL_PAYMENTS);

  // --- COUPON SYSTEM ---
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  // --- DEVELOPER PLAYGROUND LAB STATES ---
  const [orderPlanChoice, setOrderPlanChoice] = useState<'pro' | 'creator' | 'business'>('pro');
  const [orderApiLogs, setOrderApiLogs] = useState<string>('// API logs idle. Call order simulator to begin.');
  const [orderApiResponse, setOrderApiResponse] = useState<any | null>(null);
  
  const [verifyOrderId, setVerifyOrderId] = useState<string>('');
  const [verifyPaymentId, setVerifyPaymentId] = useState<string>('');
  const [verifySignature, setVerifySignature] = useState<string>('');
  const [verifyApiLogs, setVerifyApiLogs] = useState<string>('// Web Verification logs idle.');
  const [verifyApiResponse, setVerifyApiResponse] = useState<any | null>(null);
  const [isVerifyingSignature, setIsVerifyingSignature] = useState(false);

  // checkout state
  const [showRzpCheckout, setShowRzpCheckout] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'paying' | 'success' | 'failed'>('idle');
  const [rzpCardNumber, setRzpCardNumber] = useState('4111 1111 1111 8904');
  const [rzpCardExpiry, setRzpCardExpiry] = useState('12/28');
  const [rzpCardName, setRzpCardName] = useState(user?.name || 'Sandbox Tester');
  const [rzpCardCvv, setRzpCardCvv] = useState('440');

  // webhook logs
  const [webhookLogs, setWebhookLogs] = useState<string>('// Webhook events logger is ready...');
  const [selectedWebhookEvent, setSelectedWebhookEvent] = useState<string>('payment.captured');

  // --- INVOICES VIEW MODAL ---
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // --- MAIL TEMPLATES TRIGGERED LOGS ---
  const [outgoingMailLogs, setOutgoingMailLogs] = useState<any[]>([]);

  // Clipboard copies
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Admin revenue computations
  const [totalRevenue, setTotalRevenue] = useState<number>(3112.00);
  const [totalRefunds, setTotalRefunds] = useState<number>(149.00);

  // Update backend profile on sandbox change if user exists
  useEffect(() => {
    if (userPlan !== 'free' && onUpdateUser && user?.uid) {
      onUpdateUser({
        userTier: userPlan,
        storageLimit: totalStorageLimit * 1024 * 1024 * 1024 // Bytes
      });
    }
  }, [userPlan, totalStorageLimit]);

  // Adjust total storage default block depending on current plan selection
  useEffect(() => {
    let baseLimit = 5.0; // Free
    if (userPlan === 'pro') baseLimit = 100.0;
    else if (userPlan === 'creator') baseLimit = 500.0;
    else if (userPlan === 'business') baseLimit = 2000.0; // 2 TB
    
    setTotalStorageLimit(baseLimit + extraStoragePurchased);
  }, [userPlan, extraStoragePurchased]);

  // Handle clipboard copies helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // --- CODE BLOCKS REFERENCE ---
  const prismaSchemaCode = `// prisma/schema.prisma

model User {
  id           String        @id @default(uuid())
  name         String?
  email        String        @unique
  currentPlan  String        @default("FREE")
  storageLimit BigInt        @default(5368709120) // 5 GB in Bytes
  createdAt    DateTime      @default(now())
  
  subscriptions Subscription[]
  payments      Payment[]
  invoices      Invoice[]
}

model Subscription {
  id                     String    @id @default(uuid())
  userId                 String
  planName               String
  amount                 Float
  status                 String    // ACTIVE, EXPIRED, CANCELLED
  startDate              DateTime
  endDate                DateTime
  razorpaySubscriptionId String?   @unique
  user                   User      @relation(fields: [userId], references: [id])
}

model Payment {
  id                 String    @id
  userId             String
  razorpayOrderId    String
  razorpayPaymentId  String    @unique
  amount             Float
  currency           String    @default("INR")
  status             String    // SUCCESS, FAILED, PENDING
  method             String?
  createdAt          DateTime  @default(now())
  user               User      @relation(fields: [userId], references: [id])
}

model Invoice {
  id            String    @id @default(uuid())
  userId        String
  paymentId     String    @unique
  invoiceNumber String    @unique
  amount        Float
  createdAt     DateTime  @default(now())
  user          User      @relation(fields: [userId], references: [id])
}`;

  // Plan amounts helper
  const planCosts = {
    pro: 29.00,
    creator: 49.00,
    business: 199.00
  };

  const getPlanDisplayName = (p: string) => {
    if (p === 'pro') return 'Pro Plan';
    if (p === 'creator') return 'Creator+ Plan';
    if (p === 'business') return 'Business Plan';
    if (p === 'extra_storage_50') return 'Extra Storage (+50 GB)';
    if (p === 'extra_storage_100') return 'Extra Storage (+100 GB)';
    if (p === 'extra_storage_500') return 'Extra Storage (+500 GB)';
    if (p === 'extra_storage_1000') return 'Extra Storage (+1 TB)';
    return 'Free Standard';
  };

  // --- SIMULATION CONTROLLERS ---

  // A. Create Order Simulator
  const handleSimulateCreateOrder = () => {
    let price = planCosts[orderPlanChoice];
    let discount = 0;
    
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        discount = price * (appliedCoupon.value / 100);
      }
    }

    const finalAmount = Math.max(0, price - discount);
    const orderId = `order_rzp_${Math.random().toString(36).substring(2, 12)}`;
    
    const reqBody = { plan: orderPlanChoice, coupon: appliedCoupon?.code || undefined };
    const resPayload = {
      order_id: orderId,
      amount: Math.round(finalAmount * 100), // Razorpay handles in paise (amount * 100)
      currency: "INR",
      planName: orderPlanChoice,
      timestamp: Date.now(),
      status: "created"
    };

    setOrderApiResponse(resPayload);
    
    // Auto-populate Verification inputs
    setVerifyOrderId(orderId);
    setVerifyPaymentId(`pay_rzp_${Math.random().toString(36).substring(2, 12)}`);
    setVerifySignature(`sha256_mock_sig_${Math.random().toString(36).substring(2, 16)}`);

    setOrderApiLogs(`// POST /api/payments/create-order -> STATUS: 200 OK
// REQUEST BODY:
${JSON.stringify(reqBody, null, 2)}

// RESPONSE DATA:
${JSON.stringify(resPayload, null, 2)}`);
  };

  // B. Trigger Razorpay Checkout Modal
  const handleOpenRzpCheckout = () => {
    if (!orderApiResponse) {
      alert("Please simulate order creation first to fetch an order_id!");
      return;
    }
    setCheckoutStatus('idle');
    setShowRzpCheckout(true);
  };

  const handleProcessCheckoutPayment = (simulateFailure: boolean = false) => {
    setCheckoutStatus('paying');
    setTimeout(() => {
      if (simulateFailure) {
        setCheckoutStatus('failed');
        // trigger email log
        addEmailLog('Payment Failed', 'Your purchase failed during transit authorization.');
      } else {
        setCheckoutStatus('success');
        // Auto-update verify keys
        const updatedPaymentId = `pay_rzp_${Math.random().toString(36).substring(2, 12)}`;
        const updatedSignature = `sig_sha254_${Math.random().toString(36).substring(2, 14)}`;
        setVerifyPaymentId(updatedPaymentId);
        setVerifySignature(updatedSignature);
      }
    }, 1800);
  };

  // C. Verify Payment and Upgrade Plan
  const handleSimulateVerifyAndUpgrade = () => {
    if (!verifyOrderId || !verifyPaymentId || !verifySignature) {
      alert("Missing verify keys! Simulate checkout first or fill the inputs.");
      return;
    }

    setIsVerifyingSignature(true);
    setVerifyApiLogs('// Authenticating payment signature with secret...\n// RUNNING CRYPTO: HMAC_SHA256(verifyOrderId + "|" + verifyPaymentId, clientSecret)...');

    setTimeout(() => {
      setIsVerifyingSignature(false);

      // Check if duplicate
      const isDuplicate = paymentsDatabase.find(p => p.id === verifyPaymentId || p.razorpayPaymentId === verifyPaymentId);
      if (isDuplicate) {
        setVerifyApiLogs(`// POST /api/payments/verify -> STATUS: 400 Bad Request
// ERROR: Duplicate Payment Key detected. Replay protection actively aborted transaction.
{
  "success": false,
  "error": "DUPLICATE_PAYMENT_REPLAY",
  "message": "Payment record with transaction ID ${verifyPaymentId} already successfully processed! Signature validation redundant."
}`);
        return;
      }

      // Upgrade active database structures and user limits
      const upgradedPlanName = orderPlanChoice;
      setUserPlan(upgradedPlanName);
      let storageEarned = 5.0;
      if (upgradedPlanName === 'pro') storageEarned = 100.0;
      else if (upgradedPlanName === 'creator') storageEarned = 500.0;
      else if (upgradedPlanName === 'business') storageEarned = 2000.0;

      // Add a fresh database record
      const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const pricePaid = planCosts[upgradedPlanName] * (appliedCoupon ? (100 - appliedCoupon.value) / 100 : 1.0);
      
      const newPayment = {
        id: verifyPaymentId,
        userId: user?.uid || 'simulate-tester-user',
        plan: upgradedPlanName,
        amount: Number(pricePaid.toFixed(2)),
        currency: 'USD',
        status: 'SUCCESS',
        method: 'CREDIT_CARD',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        invoiceNumber
      };

      setPaymentsDatabase(prev => [newPayment, ...prev]);
      setTotalRevenue(prev => prev + pricePaid);

      // Trigger automatic Invoice attachment in Mock Outbox
      addEmailLog('Payment Successful & Invoice Attached', `Your subscription to ${getPlanDisplayName(upgradedPlanName)} has been successfully activated. Invoice code ${invoiceNumber} is bound and attached as downloadable.`, invoiceNumber);
      addEmailLog('Subscription Activated', `Your ${getPlanDisplayName(upgradedPlanName)} plan limits have been verified. Enjoy up to ${storageEarned} GB premium workspace storage structure.`, invoiceNumber);

      const verificationSuccessResponse = {
        success: true,
        signatureVerified: true,
        transactionStatus: "TRANSACTION_COMMITTED",
        userUpgraded: {
          uid: user?.uid || "simulate-tester-user",
          newPlan: upgradedPlanName,
          finalCloudStorageLimit: `${storageEarned} GB`,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
        }
      };

      setVerifyApiResponse(verificationSuccessResponse);
      setVerifyApiLogs(`// POST /api/payments/verify -> STATUS: 200 OK
// HMAC SIGNATURE: VALIDATED
// TRANSACTION UPDATE: SUCCESS
${JSON.stringify(verificationSuccessResponse, null, 2)}`);
    }, 1500);
  };

  // D. Emit Webhooks API Simulator
  const handleSimulateWebhook = () => {
    const eventId = `evt_${Math.random().toString(36).substring(2, 12)}`;
    const mockPayload: any = {
      entity: "event",
      account_id: "acc_ok2v893nla8ns",
      event: selectedWebhookEvent,
      contains: ["payment"],
      payload: {
        payment: {
          entity: {
            id: `pay_rzp_${Math.random().toString(36).substring(2, 10)}`,
            amount: 2900,
            currency: "USD",
            status: selectedWebhookEvent.includes('captured') ? "captured" : selectedWebhookEvent.includes('failed') ? "failed" : "authorized",
            order_id: `order_rzp_${Math.random().toString(36).substring(2, 10)}`,
            email: "parzevelh@gmail.com",
            contact: "+919876543210"
          }
        }
      },
      created_at: Math.floor(Date.now() / 1000)
    };

    setWebhookLogs(`// Webhook Event Triggered: ${selectedWebhookEvent} [ID: ${eventId}]
// HEADER [x-razorpay-signature]: sha256_webhook_hash_${Math.random().toString(36).substring(2, 12)}
// VERIFYING SIGNATURE BEFORE PROCESSING... STATUS: SECURE (VALID)

// PAYLOAD SENT:
${JSON.stringify(mockPayload, null, 2)}`);

    // Auto update status states
    if (selectedWebhookEvent === 'payment.failed') {
      addEmailLog('Payment Failed notice', 'A webhook reported payment processing cancellation.');
    } else if (selectedWebhookEvent === 'subscription.cancelled') {
      setAutoRenewal(false);
      addEmailLog('Subscription Cancelled', 'Your subscription was changed to terminate at month maturity.');
    }
  };

  // E. Storage increments
  const handleBuyStorage = (gb: number, cost: number) => {
    // Deduct simulator, or simply trigger state
    setExtraStoragePurchased(prev => prev + gb);
    
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment = {
      id: `pay_rzp_storage_${Math.random().toString(36).substring(2, 8)}`,
      userId: user?.uid || 'simulate-tester-user',
      plan: `extra_storage_${gb}`,
      amount: cost,
      currency: 'USD',
      status: 'SUCCESS',
      method: 'WALLET',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      invoiceNumber
    };

    setPaymentsDatabase(prev => [newPayment, ...prev]);
    setTotalRevenue(prev => prev + cost);
    addEmailLog('Payment Successful & Invoice Attached', `Purchased +${gb} GB Extra Cloud storage. Invoice code ${invoiceNumber} created.`, invoiceNumber);
  };

  // Coupon apply
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'SAVE30') {
      setAppliedCoupon({ code, type: 'percentage', value: 30 });
      setCouponFeedback({ status: 'success', message: 'Coupon applied! Enjoy 30% discount off subscription order billing.' });
    } else if (code === 'EXTRA50') {
      setExtraStoragePurchased(prev => prev + 50);
      setCouponFeedback({ status: 'success', message: 'Storage coupon applied! Added +50 GB Free extra cloud capacity instantly!' });
    } else if (code === 'NEURAL90') {
      setAppliedCoupon({ code, type: 'percentage', value: 90 });
      setCouponFeedback({ status: 'success', message: 'Hyper discount applied! Unlocked 90% discount on subscription orders.' });
    } else {
      setCouponFeedback({ status: 'error', message: 'Invalid or expired coupon credentials.' });
    }
  };

  // Admin issue refund
  const handleIssueRefund = (payId: string, amount: number) => {
    setPaymentsDatabase(prev => prev.map(p => {
      if (p.id === payId) {
        return { ...p, status: 'REFUNDED' };
      }
      return p;
    }));
    setTotalRefunds(prev => prev + amount);
    addEmailLog('Refund Issued successfully', `Your transaction of $${amount} [ID: ${payId}] has been fully refunded.`);
  };

  // Mail logs helper
  const addEmailLog = (subject: string, body: string, invNum?: string) => {
    const freshMail = {
      subject,
      body,
      date: new Date().toLocaleTimeString(),
      invoiceAttached: invNum || null
    };
    setOutgoingMailLogs(prev => [freshMail, ...prev]);
  };

  // Print raw Invoice template
  const handlePrintMockInvoice = () => {
    window.print();
  };

  return (
    <div id="razorpay-devkit-console" className="space-y-8 font-sans pb-12">
      {/* Title Header Banner Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 px-2 rounded-md bg-purple-500/10 text-purple-400 font-mono text-[10px] font-bold border border-purple-500/15">
              Secure Payments Framework v2
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase font-sans">
            Razorpay Billing &amp; Sandbox Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-normal">
            Configure schemas, simulate endpoints, test Razorpay popup gateways, review outgoing transaction receipts, download client invoices, and track revenue health from a unified client portal.
          </p>
        </div>
        
        {/* Short info indicators */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('user')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition-colors cursor-pointer ${
              userPlan !== 'free' 
                ? 'bg-[#8DB8CC]/15 text-[#8DB8CC] border-[#8DB8CC]/40' 
                : 'bg-[#10161B] border-[#26313A] text-slate-300 hover:border-[#AFC3CF]/40'
            }`}
          >
            <Wallet size={14} className="text-[#8DB8CC]" />
            Plan Status: <span className="uppercase text-white">{userPlan}</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Selector Menu Buttons */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        <button
          onClick={() => setActiveTab('user')}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'user'
              ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-[0_0_20px_rgba(255,255,255,0.25)] font-black'
              : 'text-slate-400 hover:text-white bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40'
          }`}
        >
          <Wallet size={14} />
          User Subscriptions &amp; Storage
        </button>

        <button
          onClick={() => setActiveTab('dev')}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'dev'
              ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-[0_0_20px_rgba(255,255,255,0.25)] font-black'
              : 'text-slate-400 hover:text-white bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40'
          }`}
        >
          <Terminal size={14} />
          Developer Sandbox API Gateway
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'admin'
              ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-[0_0_20px_rgba(255,255,255,0.25)] font-black'
              : 'text-slate-400 hover:text-white bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40'
          }`}
        >
          <BarChart2 size={14} />
          Admin Revenue Analytics
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-[0_0_20px_rgba(255,255,255,0.25)] font-black'
              : 'text-slate-400 hover:text-white bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40'
          }`}
        >
          <FileText size={14} />
          Invoice History Logs ({paymentsDatabase.length})
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`relative flex items-center gap-2 px-4.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'emails'
              ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-[0_0_20px_rgba(255,255,255,0.25)] font-black'
              : 'text-slate-400 hover:text-white bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40'
          }`}
        >
          <Mail size={14} />
          Resend Notifications Preview
          {outgoingMailLogs.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-[8px] text-white font-black animate-pulse">
              {outgoingMailLogs.length}
            </span>
          )}
        </button>
      </div>

      {/* --- RENDER ACTIVE TAB --- */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: USER SUBSCRIPTIONS & STORAGE UPGRADES */}
        {activeTab === 'user' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Split layout: Upgrade Panel and Storage controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left card: Current subscription tier specifications */}
              <div className="lg:col-span-8 bg-[#090b11]/90 rounded-3xl border border-white/5 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#00c6ff] font-extrabold block mb-1">
                        YOUR PROFILE LIMITATIONS
                      </span>
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        Active Monetization Tier
                      </h2>
                    </div>
                    
                    <span className="px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest bg-emerald-500/10 text-emerald-405 text-emerald-400 border border-emerald-500/20 uppercase animate-pulse">
                      STATUS: ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/[0.03]">
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1">CURRENT PLAN</span>
                      <span className="text-lg font-black text-white uppercase tracking-tight block">
                        {userPlan} Tier
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Billed automatically</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/[0.03]">
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1">AUTO EXPIRY</span>
                      <span className="text-lg font-black text-white block">
                        {subscriptionExpiry}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{autoRenewal ? 'Set for Auto-Renewal' : 'Ends this period'}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/[0.03]">
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1">STORAGE CAPACITY</span>
                      <span className="text-lg font-black text-white block">
                        {totalStorageLimit} GB
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{usedStorage.toFixed(2)} GB applied</span>
                    </div>
                  </div>

                  {/* Dynamic Cloud Storage Capacity visual representer */}
                  <div className="space-y-2 mb-8">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold flex items-center gap-1.5">
                        <HardDrive size={13} className="text-cyan-400" />
                        Custom Storage Usage Metrics
                      </span>
                      <span className="font-mono text-white font-heavy">
                        {usedStorage.toFixed(2)} GB / {totalStorageLimit} GB ({((usedStorage / totalStorageLimit) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    {/* Visual bar */}
                    <div className="h-2.5 bg-zinc-900 rounded-lg overflow-hidden border border-white/[0.05]">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-lg transition-all duration-500"
                        style={{ width: `${Math.min(100, (usedStorage / totalStorageLimit) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>Available: {(totalStorageLimit - usedStorage).toFixed(2)} GB</span>
                      <span>{extraStoragePurchased > 0 ? `Includes +${extraStoragePurchased} GB purchased extras` : 'Standard allocation limit'}</span>
                    </div>
                  </div>

                  {/* Storage booster list */}
                  <div className="border-t border-white/5 pt-6">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sparkles size={12} className="text-purple-400 animate-pulse" />
                      Extra Storage Add-on Boosters (Pay-as-you-go)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <button
                        onClick={() => handleBuyStorage(50, 5.00)}
                        className="p-3 bg-slate-950/50 hover:bg-[#0c0d12] rounded-xl border border-white/5 hover:border-cyan-500/40 text-left transition-all duration-300 flex flex-col justify-between cursor-pointer"
                      >
                        <span className="text-[11px] text-slate-500 font-bold block mb-1">BOOSTER</span>
                        <span className="text-sm font-heavy text-white block">+50 GB</span>
                        <span className="text-[10px] text-cyan-400 font-semibold">$5.00</span>
                      </button>

                      <button
                        onClick={() => handleBuyStorage(100, 9.00)}
                        className="p-3 bg-slate-950/50 hover:bg-[#0c0d12] rounded-xl border border-white/5 hover:border-cyan-500/40 text-left transition-all duration-300 flex flex-col justify-between cursor-pointer"
                      >
                        <span className="text-[11px] text-slate-500 font-bold block mb-1">POPULAR</span>
                        <span className="text-sm font-heavy text-white block">+100 GB</span>
                        <span className="text-[10px] text-cyan-400 font-semibold">$9.00</span>
                      </button>

                      <button
                        onClick={() => handleBuyStorage(500, 19.00)}
                        className="p-3 bg-slate-950/50 hover:bg-[#0c0d12] rounded-xl border border-white/5 hover:border-purple-500/40 text-left transition-all duration-300 flex flex-col justify-between cursor-pointer"
                      >
                        <span className="text-[11px] text-slate-500 font-bold block mb-1">PRO CHOICE</span>
                        <span className="text-sm font-heavy text-white block">+500 GB</span>
                        <span className="text-[10px] text-purple-400 font-semibold">$19.00</span>
                      </button>

                      <button
                        onClick={() => handleBuyStorage(1000, 29.00)}
                        className="p-3 bg-slate-950/50 hover:bg-[#0c0d12] rounded-xl border border-white/5 hover:border-purple-500/40 text-left transition-all duration-300 flex flex-col justify-between cursor-pointer"
                      >
                        <span className="text-[11px] text-slate-500 font-bold block mb-1">UNLIMITED</span>
                        <span className="text-sm font-heavy text-white block">+1 TB</span>
                        <span className="text-[10px] text-purple-400 font-semibold">$29.00</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6 mt-8">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-400 font-bold cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoRenewal}
                        onChange={(e) => {
                          setAutoRenewal(e.target.checked);
                          addEmailLog('Auto-Renewal Modified', `You changed your subscription auto-renewal settings to: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                        }}
                        className="accent-purple-500 rounded border-white/10"
                      />
                      Enable Auto-Renewal Subscription
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const confirmCancel = window.confirm("Are you sure you want to cancel subscription? Your plan limits will maintain active until expiration grace maturity date.");
                        if (confirmCancel) {
                          setUserPlan('free');
                          addEmailLog('Subscription Cancelled', 'Your paid subscription has cancelled. Account successfully gracefully returned to Free tier limits.');
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider text-rose-400 border border-rose-500/10 hover:bg-rose-500/5 transition-colors cursor-pointer"
                    >
                      Cancel Subscription Gracefully
                    </button>
                  </div>
                </div>

              </div>

              {/* Right card: Subscription Coupon & Discount Apply Panel */}
              <div className="lg:col-span-4 bg-[#090b11]/90 rounded-3xl border border-white/5 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#00c6ff] uppercase tracking-widest mb-1">
                    COUPON SYSTEM CONSOLE
                  </h3>
                  <h2 className="text-lg font-black text-white tracking-tight mb-4">
                    Apply Promo Discount Codes
                  </h2>
                  <p className="text-xs text-slate-400 leading-normal mb-4">
                    Test the coupon engine with the codes below to achieve instant high-percentage discounts of matching price values.
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="p-2 px-3 rounded-lg bg-zinc-950/80 border border-white/[0.02] flex items-center justify-between text-xs font-mono">
                      <span className="text-purple-400 font-bold">SAVE30</span>
                      <span className="text-slate-500 text-[10px]">30% discount subscriptions</span>
                    </div>
                    <div className="p-2 px-3 rounded-lg bg-zinc-950/80 border border-white/[0.02] flex items-center justify-between text-xs font-mono">
                      <span className="text-[#00c6ff] font-bold">EXTRA50</span>
                      <span className="text-slate-500 text-[10px]">+50 GB storage applied instantly</span>
                    </div>
                    <div className="p-2 px-3 rounded-lg bg-zinc-950/80 border border-white/[0.02] flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-400 font-bold">NEURAL90</span>
                      <span className="text-slate-500 text-[10px]">90% absolute order discount</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input 
                      type="text"
                      placeholder="ENTER PROMO OR REFERRAL CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full h-11 px-4 text-xs font-black rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 uppercase font-mono"
                    />

                    <button
                      onClick={handleApplyCoupon}
                      className="w-full h-11 rounded-xl bg-slate-100 hover:bg-white text-zinc-950 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Verify &amp; Apply Coupon
                    </button>
                  </div>

                  {couponFeedback && (
                    <div className={`mt-4 p-3 rounded-xl border text-xs leading-normal flex items-start gap-2 ${
                      couponFeedback.status === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-450 text-rose-400'
                    }`}>
                      <Info size={14} className="flex-shrink-0 mt-0.5" />
                      <span>{couponFeedback.message}</span>
                    </div>
                  )}
                </div>

                {appliedCoupon && (
                  <div className="p-3 Rounded-2xl bg-zinc-950 border border-white/[0.02] mt-6 flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <span className="font-mono bg-indigo-650 text-white bg-indigo-500 px-2 py-0.5 rounded text-[10px] font-bold">
                        {appliedCoupon.code} ACTIVE
                      </span>
                      <span className="text-[10px] text-slate-500 block">Applied order discount: {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `$${appliedCoupon.value}`}</span>
                    </div>
                    <button
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponFeedback(null);
                        setCouponCode('');
                      }}
                      className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: DEVELOPER SANDBOX API CONTROL SUITE */}
        {activeTab === 'dev' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* PRISMA SCHEMAS AND CREATE ORDER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Prisma database models view block */}
              <div className="lg:col-span-6 bg-[#090b11]/90 rounded-3xl border border-white/5 p-6 flex flex-col justify-between relative">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 font-extrabold block">
                        DATABASE OBJECT REPRESENTATIONS
                      </span>
                      <h2 className="text-xl font-black text-white tracking-tight">
                        Prisma Blueprints (No Mock DB)
                      </h2>
                    </div>

                    <button
                      onClick={() => handleCopyText(prismaSchemaCode, 'prisma')}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 text-xs flex items-center gap-1.5"
                    >
                      <Clipboard size={12} />
                      {copiedSection === 'prisma' ? 'Copied' : 'Copy Schema'}
                    </button>
                  </div>

                  {/* Preformatted code panel */}
                  <div className="bg-[#05060b] rounded-2xl border border-slate-900 overflow-hidden font-mono text-[10.5px] p-4 text-slate-300 overflow-x-auto h-[410px] custom-scrollbar relative">
                    <pre className="leading-5">{prismaSchemaCode}</pre>
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/60 border border-white/[0.02] text-xs text-slate-400 flex items-start gap-2.5 leading-relaxed">
                  <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>These Prisma structures support our production security requirements including dynamic cascading storage limits, relational billing keys, and unique, idempotent signature validations.</span>
                </div>
              </div>

              {/* Endpoint simulation playground: Post /api/payments/create-order */}
              <div className="lg:col-span-6 bg-[#090b11]/90 rounded-3xl border border-white/5 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#00c6ff] font-extrabold block mb-1">
                    POST /API/PAYMENTS/CREATE-ORDER
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight mb-4">
                    Create Razorpay Order Playground
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block mb-2">CHOOSE INTENDED UPGRADE PLAN:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {['pro', 'creator', 'business'].map((p: any) => (
                          <button
                            key={p}
                            onClick={() => setOrderPlanChoice(p)}
                            className={`py-3 px-1 rounded-xl border text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                              orderPlanChoice === p
                                ? 'bg-purple-900/40 text-purple-200 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                                : 'bg-zinc-950/60 border-white/5 text-slate-400 hover:border-white/15'
                            }`}
                          >
                            {p === 'creator' ? 'Creator+' : p} Plan
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Show subtotal price with applied promo code */}
                    <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/[0.04] flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold">Base Price / Monthly Period:</span>
                      <span className="font-mono font-heavy text-white">
                        {appliedCoupon ? (
                          <>
                            <span className="line-through text-slate-650 text-slate-500 mr-2">
                              ${planCosts[orderPlanChoice]}.00
                            </span>
                            <span className="text-emerald-400 font-black">
                              ${(planCosts[orderPlanChoice] * (100 - appliedCoupon.value) / 100).toFixed(2)} USD
                            </span>
                          </>
                        ) : (
                          `$${planCosts[orderPlanChoice]}.00 USD`
                        )}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSimulateCreateOrder}
                        className="flex-grow h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Play size={12} />
                        Simulate REST POST Request
                      </button>

                      {orderApiResponse && (
                        <button
                          onClick={handleOpenRzpCheckout}
                          className="px-5 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer animate-bounce"
                        >
                          <CreditCard size={13} />
                          Launch Razorpay Checkout
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Terminal console */}
                  <div className="text-[11px] font-mono p-4 rounded-2xl bg-[#05060b] border border-slate-900 text-[#00ffd2] h-[250px] overflow-y-auto custom-scrollbar relative">
                    <span className="absolute top-2.5 right-3 text-[9px] font-bold text-slate-600 font-sans tracking-wide">MOCK TERMINAL LOGGER</span>
                    <pre className="leading-5 whitespace-pre-wrap">{orderApiLogs}</pre>
                  </div>
                </div>
              </div>

            </div>

            {/* VERIFY PAYMENT GATEWAY & WEBHOOKS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Verify signature interactive endpoint console */}
              <div className="lg:col-span-8 bg-[#090b11]/90 rounded-3xl border border-white/5 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#00c6ff] font-extrabold block mb-1">
                    POST /API/PAYMENTS/VERIFY
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight mb-4">
                    Verify HMAC SHA256 Signature Sandbox
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-bold text-slate-400 block uppercase">Razorpay Order ID</label>
                      <input 
                        type="text"
                        value={verifyOrderId}
                        onChange={(e) => setVerifyOrderId(e.target.value)}
                        placeholder="order_rzp_..."
                        className="w-full h-11 px-3 text-xs font-mono rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-slate-700 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-bold text-slate-400 block uppercase">Razorpay Payment ID</label>
                      <input 
                        type="text"
                        value={verifyPaymentId}
                        onChange={(e) => setVerifyPaymentId(e.target.value)}
                        placeholder="pay_rzp_..."
                        className="w-full h-11 px-3 text-xs font-mono rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-slate-700 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-bold text-slate-400 block uppercase">Generated Cryptographic Signature</label>
                      <input 
                        type="text"
                        value={verifySignature}
                        onChange={(e) => setVerifySignature(e.target.value)}
                        placeholder="sig_sha254_..."
                        className="w-full h-11 px-3 text-xs font-mono rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={handleSimulateVerifyAndUpgrade}
                      disabled={isVerifyingSignature}
                      className="w-full h-11 rounded-xl bg-[#00c6ff] hover:bg-[#00b0e0] text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {isVerifyingSignature ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          Performing HMAC Validation...
                        </>
                      ) : (
                        <>
                          <Shield size={12} />
                          Simulate Signature Cryptography &amp; Database Transaction Block
                        </>
                      )}
                    </button>
                  </div>

                  {/* Terminal verify logger */}
                  <div className="text-[11px] font-mono p-4 rounded-2xl bg-[#05060b] border border-slate-900 text-teal-400 h-[220px] overflow-y-auto custom-scrollbar relative">
                    <span className="absolute top-2.5 right-3 text-[9px] font-bold text-slate-600 font-sans tracking-wide">VERITY CONTROLLER LOGGER</span>
                    <pre className="leading-5 whitespace-pre-wrap">{verifyApiLogs}</pre>
                  </div>
                </div>
              </div>

              {/* Webhooks simulator and triggers */}
              <div className="lg:col-span-4 bg-[#090b11]/90 rounded-3xl border border-white/5 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-extrabold block mb-1">
                    RAZORPAY SYSTEM WEBHOOK LISTENER
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight mb-4">
                    Emit Webhooks Gateway
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block mb-2">SELECT WEBHOOK CALLBACK OBJECT:</span>
                      <select
                        value={selectedWebhookEvent}
                        onChange={(e) => setSelectedWebhookEvent(e.target.value)}
                        className="w-full h-11 px-3.5 text-xs font-bold rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none cursor-pointer"
                      >
                        <option value="payment.authorized">payment.authorized</option>
                        <option value="payment.captured">payment.captured</option>
                        <option value="payment.failed">payment.failed</option>
                        <option value="refund.created">refund.created</option>
                        <option value="subscription.charged">subscription.charged</option>
                        <option value="subscription.cancelled">subscription.cancelled</option>
                      </select>
                    </div>

                    <p className="text-[11.5px] text-slate-400 leading-normal">
                      Emulate events automatically emitted by Razorpay servers straight to our webhook handler, verifying the verification signatures.
                    </p>

                    <button
                      onClick={handleSimulateWebhook}
                      className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Send size={12} />
                      Transmit Event Webhook
                    </button>
                  </div>

                  {/* Terminal webhook logger */}
                  <div className="text-[10px] font-mono p-4 rounded-xl bg-[#05060b] border border-slate-900 text-amber-400/90 h-[220px] overflow-y-auto custom-scrollbar relative">
                    <span className="absolute top-2.5 right-3 text-[8px] font-bold text-slate-600 font-sans tracking-wide">WEBHOOK SYSTEM OUT</span>
                    <pre className="leading-4 whitespace-pre-wrap">{webhookLogs}</pre>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 3: ADMIN & REVENUE HEALTH METRICS */}
        {activeTab === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* KPI overview row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              
              <div className="p-5 rounded-2xl bg-[#090b11]/90 border border-white/5 relative overflow-hidden">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">TOTAL REVENUE (CUMULATIVE)</span>
                <span className="text-2xl font-black text-white block tracking-tight">
                  ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp size={12} /> +12.4% MoM
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#090b11]/90 border border-white/5 relative overflow-hidden">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">RECURRING REVENUE (MRR)</span>
                <span className="text-2xl font-black text-white block tracking-tight">
                  ${(totalRevenue * 0.35).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp size={12} /> +18.9% ARR Forecast
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#090b11]/90 border border-white/5 relative overflow-hidden">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">ACTIVE SUBSCRIBERS</span>
                <span className="text-2xl font-black text-white block tracking-tight">
                  218 Nodes
                </span>
                <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 mt-1">
                  Conversion: 4.8% rate
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#090b11]/90 border border-white/5 relative overflow-hidden">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">FAILED PAYMENTS</span>
                <span className="text-2xl font-black text-[#f43f5e] block tracking-tight">
                  5 Failures
                </span>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                  Recovery actions active
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#090b11]/90 border border-white/5 relative overflow-hidden col-span-2 md:col-span-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">TOTAL REFUNDS ISSUED</span>
                <span className="text-2xl font-black text-slate-400 block tracking-tight">
                  ${totalRefunds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1">
                  Churn Rate: 1.4% (Ultra-Low)
                </span>
              </div>

            </div>

            {/* Split row: Detailed Analytics Charts and Refund/Transaction console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Analytics graph mock area */}
              <div className="lg:col-span-6 bg-[#090b11]/90 rounded-3xl border border-white/5 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#00c6ff] font-extrabold uppercase block mb-1">
                    SAAS metrics visualization
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight mb-4">
                    ARR/MRR Growth &amp; Conversion Analytics
                  </h3>

                  {/* HTML visual chart bars */}
                  <div className="h-[230px] flex items-end gap-5 pt-8 pb-4">
                    {[
                      { month: 'Jan', revenue: 780, color: 'bg-indigo-600' },
                      { month: 'Feb', revenue: 1040, color: 'bg-indigo-600' },
                      { month: 'Mar', revenue: 1250, color: 'bg-indigo-600' },
                      { month: 'Apr', revenue: 1610, color: 'bg-indigo-650' },
                      { month: 'May', revenue: 2100, color: 'bg-indigo-500' },
                      { month: 'Jun', revenue: 3112, color: 'bg-gradient-to-t from-purple-600 to-indigo-500' },
                    ].map((m: any) => {
                      const pct = (m.revenue / 3200) * 100;
                      return (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            ${m.revenue}
                          </span>
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-1000 group-hover:brightness-110 shadow-lg ${m.color}`}
                            style={{ height: `${pct}%` }}
                          />
                          <span className="text-[10px] font-mono text-slate-500 font-heavy">{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                  <div className="text-center">
                    <span className="text-[9px] text-slate-500 font-bold block mb-0.5 uppercase">Arr forecast</span>
                    <span className="text-sm font-black text-white font-mono">$37.1K</span>
                  </div>
                  <div className="text-center border-x border-white/5">
                    <span className="text-[9px] text-slate-500 font-bold block mb-0.5 uppercase">Conversion rate</span>
                    <span className="text-sm font-black text-[#00c6ff] font-mono">4.82%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-slate-500 font-bold block mb-0.5 uppercase">LTV duration</span>
                    <span className="text-sm font-black text-purple-400 font-mono">11.4m</span>
                  </div>
                </div>
              </div>

              {/* Transactions/refunds administration panel */}
              <div className="lg:col-span-6 bg-[#090b11]/90 rounded-3xl border border-white/5 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#f43f5e] font-extrabold uppercase block mb-1">
                    ADMIN GATEWAY OPERATIONS
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight mb-4">
                    Transaction &amp; Refunds Control Center
                  </h3>

                  <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar">
                    {paymentsDatabase.filter(p => p.status === 'SUCCESS' || p.status === 'REFUNDED').map((p) => (
                      <div 
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-zinc-950/80 border border-white/[0.02] flex items-center justify-between text-xs transition-all hover:bg-zinc-900/50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-white text-[11px] font-black">{p.id}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-wide ${
                              p.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {p.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            Plan: <strong className="text-white uppercase">{p.plan}</strong> • {p.createdAt}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-heavy text-white">${p.amount.toFixed(2)}</span>
                          {p.status === 'SUCCESS' && (
                            <button
                              onClick={() => handleIssueRefund(p.id, p.amount)}
                              className="px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase text-rose-450 text-[#f43f5e] bg-[#f43f5e]/10 border border-[#f43f5e]/20 hover:bg-[#f43f5e]/20 hover:scale-105 transition-all cursor-pointer"
                            >
                              Issue Refund
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 4: TRANSACTION HISTORY & INVOICE PDF EXPORTER */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-[#090b11]/90 rounded-3xl border border-white/5 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#00c6ff] font-extrabold block">
                    TRANSACTION INVOICE RECORDS
                  </span>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Billing Payments &amp; PDFs
                  </h2>
                </div>

                <div className="text-xs text-slate-400 max-w-sm text-left sm:text-right">
                  Verify any system transactions. Click <strong className="text-white">"Download Invoice"</strong> to generate downloadable HTML &amp; PDF printable templates dynamically.
                </div>
              </div>

              {/* Payments table structure */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                      <th className="py-3 px-4 font-heavy">PAYMENT ID</th>
                      <th className="py-3 px-4 font-heavy">INVOICE NUMBER</th>
                      <th className="py-3 px-4 font-heavy">DATE</th>
                      <th className="py-3 px-4 font-heavy">METHOD</th>
                      <th className="py-3 px-4 font-heavy">UPGRADE PLAN</th>
                      <th className="py-3 px-4 font-heavy">STATUS</th>
                      <th className="py-3 px-4 font-heavy text-right">AMOUNT Paid</th>
                      <th className="py-3 px-4 text-right">PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02] text-xs">
                    {paymentsDatabase.map((row) => (
                      <tr 
                        key={row.id}
                        className="hover:bg-white/[0.015] transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{row.id}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{row.invoiceNumber}</td>
                        <td className="py-3.5 px-4 text-slate-450 text-slate-400">{row.createdAt}</td>
                        <td className="py-3.5 px-4 font-mono uppercase text-[9.5px] text-slate-400">{row.method || 'Unknown'}</td>
                        <td className="py-3.5 px-4 font-black uppercase text-slate-300">{row.plan}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[8.5px] font-black tracking-wide uppercase ${
                            row.status === 'SUCCESS'
                              ? 'bg-emerald-500/10 text-emerald-450 text-emerald-400'
                              : row.status === 'REFUNDED'
                                ? 'bg-slate-800 text-slate-500'
                                : 'bg-rose-500/10 text-rose-450 text-rose-400'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-heavy text-right text-white">
                          ${row.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedInvoice(row)}
                            className="p-1 px-2.5 rounded-lg bg-zinc-950 border border-white/5 hover:border-cyan-400/30 hover:text-cyan-400 text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer"
                          >
                            Get PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: RESEND INTEGRATED EMAIL NOTIFICATION TEMPLATES LOGGER */}
        {activeTab === 'emails' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left sidebar: Outgoing broadcast list */}
              <div className="lg:col-span-4 bg-[#090b11]/90 rounded-3xl border border-white/5 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-extrabold block">
                    RESEND TRANSACTION OUTBOX
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight mb-4">
                    Mail Templates &amp; Outbox
                  </h3>

                  <div className="space-y-2 mb-6">
                    <button
                      onClick={() => addEmailLog('Payment Successful & Invoice Attached', 'Your checkout completes seamlessly. Attached PDF with custom records is delivered.', 'INV-2026-9041')}
                      className="w-full text-left p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border border-white/[0.02] flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      <span>✉️ Payment Successful Template</span>
                      <ChevronRight size={14} className="text-slate-500" />
                    </button>

                    <button
                      onClick={() => addEmailLog('Subscription Activated', 'Welcome aboard the cinematic creator experience. Full cloud storage allocated.')}
                      className="w-full text-left p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border border-white/[0.02] flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      <span>✉️ Subscription Activated Template</span>
                      <ChevronRight size={14} className="text-slate-500" />
                    </button>

                    <button
                      onClick={() => addEmailLog('Payment Failed Retries Alert', 'A decline has occurred with billing card. Retry scheduling initialized.')}
                      className="w-full text-left p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border border-white/[0.02] flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      <span>✉️ Payment Failed Template</span>
                      <ChevronRight size={14} className="text-slate-500" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal mb-4">
                    Broadcasting transactions directly alerts Resend APIs, deploying HTML templates to user addresses instantly.
                  </p>
                </div>

                {/* Mail logs outbox */}
                <div className="border-t border-white/5 pt-4">
                  <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block mb-3">OUTBOX LOGGER HISTORY</span>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                    {outgoingMailLogs.length === 0 ? (
                      <span className="text-xs text-slate-600 block italic py-2">Outbox remains empty. Trigger templates above or run verify signatures to pop mail items.</span>
                    ) : (
                      outgoingMailLogs.map((m, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5 text-[11px]">
                          <span className="font-bold text-white block truncate">Subject: {m.subject}</span>
                          <span className="text-slate-500 text-[10px] block mt-1">{m.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right panel: Active Email Template Visual HTML layout view */}
              <div className="lg:col-span-8 bg-[#090b11]/90 rounded-3xl border border-white/5 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#00c6ff] font-extrabold uppercase block">
                        Visual Mail Preview
                      </span>
                      <h3 className="text-lg font-black text-white tracking-tight">
                        Compliant Render Container (HTML Mode)
                      </h3>
                    </div>
                  </div>

                  {/* Resend simulated email HTML graphic */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-[#0d0f17] border border-white/[0.03] text-slate-350 text-slate-300 font-sans space-y-6 max-w-xl mx-auto shadow-2xl">
                    <div className="text-center border-b border-white/5 pb-4">
                      <h4 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 inline-block uppercase tracking-tight">
                        ALGOEDIT AI STUDIO
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-1">TRANSACTION CONFIRMATION • RESEND INC</p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm">Hello <strong className="text-white">{user?.name || 'Neural Entity'}</strong>,</p>
                      
                      <p className="text-xs leading-relaxed">
                        This system document serves as your official confirmation regarding activities associated with your premium computer tokens and subscription database.
                      </p>

                      {/* Box for invoice summary details */}
                      <div className="p-4 rounded-xl bg-[#06080d] border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Recipient Email:</span>
                          <span className="text-white font-mono font-bold">{user?.email || 'parzevelh@gmail.com'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Authorized Plan:</span>
                          <span className="text-purple-400 uppercase font-black">{userPlan} Plan</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">System Code status:</span>
                          <span className="text-emerald-400 font-extrabold">TRANSACTION_SUCCESS</span>
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed text-slate-400">
                        Invoices mapping your allocated storage limits and computational weights are accessible inside your history panel. If you maintain questions regarding standard subscription renewal timelines, please contact our network help clearing.
                      </p>
                    </div>

                    <div className="text-center border-t border-white/5 pt-4 text-[10px] text-slate-500 font-mono">
                      ALGOEDIT CO • PREMIUM SECURE GATEWAY HUB
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* --- MODAL OVERLAYS --- */}

      {/* 4. RAZORPAY CUSTOM EMBEDDED MODAL POPUP GATEWAY */}
      {showRzpCheckout && orderApiResponse && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#ffffff] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] text-[#2d2d2d] font-sans"
          >
            {/* Razorpay banner header */}
            <div className="bg-[#1c2541] p-5 text-white flex items-center justify-between border-b-2 border-cyan-500">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500 p-2.5 rounded-lg text-white font-black text-sm select-none leading-none">
                  R
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#00c6ff]">RAZORPAY CHECKOUT</h3>
                  <p className="text-[10px] text-slate-400 font-mono">SECURE TRANSACTION PORTAL</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRzpCheckout(false)}
                className="p-1 px-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Price breakdown details bar */}
            <div className="bg-[#eaeefc] p-4 flex justify-between items-center text-xs border-b border-indigo-100">
              <span className="text-[#3b4b72] font-black uppercase">Plan upgrade to: <span className="text-indigo-900">{orderPlanChoice}</span></span>
              <span className="text-[#1c2541] font-black font-heavy text-sm text-[13px] font-mono">
                INR {orderApiResponse.amount.toLocaleString()}.00 Paise
              </span>
            </div>

            {/* Input credentials area */}
            <div className="p-6 space-y-4">
              {checkoutStatus === 'idle' && (
                <>
                  <p className="text-[11px] text-[#5e6e8c] leading-normal font-medium">
                    This simulates Razorpay checkout overlay. Review order details below and complete transaction parameters.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-black tracking-wider uppercase text-[#3c4a63] block mb-1">
                        Razorpay Order ID Ref:
                      </label>
                      <input 
                        type="text" 
                        readOnly 
                        value={orderApiResponse.order_id} 
                        className="w-full h-10 px-3 border border-indigo-100 bg-indigo-50/40 rounded-xl text-xs font-mono font-bold text-[#1c2541]" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-black tracking-wider uppercase text-[#3c4a63] block mb-1">
                          Payment card credentials
                        </label>
                        <input 
                          type="text" 
                          value={rzpCardNumber} 
                          onChange={(e) => setRzpCardNumber(e.target.value)}
                          className="w-full h-10 px-3 border border-indigo-100 rounded-xl text-xs font-mono text-[#1c2541]" 
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black tracking-wider uppercase text-[#3c4a63] block mb-1">
                          Expiry Code / Cvv
                        </label>
                        <div className="flex gap-1.5">
                          <input 
                            type="text" 
                            value={rzpCardExpiry} 
                            onChange={(e) => setRzpCardExpiry(e.target.value)}
                            className="w-full h-10 px-2 text-center border border-indigo-100 rounded-xl text-xs font-mono text-[#1c2541]" 
                          />
                          <input 
                            type="password" 
                            value={rzpCardCvv} 
                            onChange={(e) => setRzpCardCvv(e.target.value)}
                            className="w-full h-10 px-2 text-center border border-indigo-100 rounded-xl text-xs font-mono text-[#1c2541]" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <button
                      onClick={() => handleProcessCheckoutPayment(true)}
                      className="h-11 rounded-xl bg-rose-500 hover:bg-rose-650 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Simulate Failure
                    </button>

                    <button
                      onClick={() => handleProcessCheckoutPayment(false)}
                      className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Authorize Payment
                    </button>
                  </div>
                </>
              )}

              {checkoutStatus === 'paying' && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw size={36} className="text-indigo-600 animate-spin" />
                  <div className="text-center">
                    <span className="text-sm font-black text-[#1c2541] uppercase tracking-wider block">Verifying card authorization...</span>
                    <span className="text-[10px] text-slate-500 block">Deploying 3DS authentication handshakes</span>
                  </div>
                </div>
              )}

              {checkoutStatus === 'failed' && (
                <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                  <AlertOctagon size={44} className="text-rose-500" />
                  <div>
                    <span className="text-base font-black text-[#1c2541] uppercase tracking-wider block">Payment Verification Failed</span>
                    <span className="text-xs text-slate-500 font-medium block mt-1">Issuer bank reported insufficient balance. Order has aborted.</span>
                  </div>
                  <button
                    onClick={() => setShowRzpCheckout(false)}
                    className="mt-4 px-6 h-10 rounded-xl bg-[#1c2541] hover:bg-[#253258] text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Close Redirection
                  </button>
                </div>
              )}

              {checkoutStatus === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                  <CheckCircle2 size={44} className="text-emerald-500 animate-bounce" />
                  <div>
                    <span className="text-base font-black text-[#1c2541] uppercase tracking-wider block">Authentication Successful</span>
                    <span className="text-xs text-[#3b4b72] font-heavy font-mono block mt-1">signature keys generated. Continue verifying signature.</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 text-[10.5px] font-mono text-[#1c2541] text-left w-full space-y-1">
                    <div><strong>OrderID:</strong> {orderApiResponse.order_id}</div>
                    <div><strong>PaymentID:</strong> {verifyPaymentId}</div>
                    <div><strong>Signature:</strong> {verifySignature}</div>
                  </div>

                  <button
                    onClick={() => setShowRzpCheckout(false)}
                    className="mt-4 w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Transfer Keys to Sandbox
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* 8. INVOICE DETAILED VIEW COMPLIANT WITH RENDER SPECS */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl bg-white rounded-[24px] overflow-hidden text-[#1e1e1e] font-sans shadow-[0_0_60px_rgba(0,0,0,0.9)] border border-slate-200"
          >
            {/* Modal actions header bar */}
            <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center print:hidden">
              <span className="text-[11px] font-black text-slate-500 font-mono tracking-widest uppercase">
                Invoice Preview Console
              </span>

              <div className="flex gap-2">
                <button
                  onClick={handlePrintMockInvoice}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={13} />
                  Print / Save PDF
                </button>

                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Raw HTML Invoice container */}
            <div className="p-8 sm:p-12 space-y-8 bg-white" id="printable-invoice-content">
              {/* Header details */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-xl font-black tracking-tighter text-slate-900 uppercase">
                    ALGOEDIT AI STUDIO
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Secure Clearing Network Inc.</p>
                </div>

                <div className="text-right">
                  <h3 className="text-lg font-black text-slate-900 font-mono">INVOICE</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedInvoice.invoiceNumber}</p>
                </div>
              </div>

              {/* Bill layouts details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1 font-bold">CLIENT RECIPIENT:</span>
                  <span className="font-heavy text-slate-905 font-bold text-slate-900 block">{user?.name || 'Sandbox Tester'}</span>
                  <span className="font-mono text-slate-500 block">{user?.email || 'parzevelh@gmail.com'}</span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block mb-1 font-bold">TRANSACTION:</span>
                  <span className="font-mono text-slate-900 block">ID: {selectedInvoice.id}</span>
                  <span className="font-mono text-slate-500 block">Date: {selectedInvoice.createdAt}</span>
                </div>
              </div>

              {/* Invoice table list */}
              <div className="border-t border-slate-100 pt-6">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-2.5">SERVICE LINE ITEM</th>
                      <th className="py-2.5 text-center">QTY</th>
                      <th className="py-2.5 text-right">UNIT PRICE</th>
                      <th className="py-2.5 text-right">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-4">
                        <span className="font-bold text-slate-900 block uppercase">
                          {getPlanDisplayName(selectedInvoice.plan)}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Includes customized cloud storage limits and continuous rendering weights.
                        </span>
                      </td>
                      <td className="py-4 text-center font-bold">1</td>
                      <td className="py-4 text-right font-mono">${selectedInvoice.amount.toFixed(2)}</td>
                      <td className="py-4 text-right font-mono font-bold text-slate-900">${selectedInvoice.amount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total block */}
              <div className="flex justify-end pt-6">
                <div className="w-56 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Tax (0% Standard GST):</span>
                    <span className="font-mono">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                    <span>TOTAL AMOUNT PAID:</span>
                    <span className="font-mono">${selectedInvoice.amount.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              {/* Signature block */}
              <div className="text-center border-t border-slate-100 pt-8 text-[10px] text-slate-400 font-mono">
                Thank you for your purchase! ALGOEDIT Secure payments are validated under Razorpay API structures.
              </div>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
}
