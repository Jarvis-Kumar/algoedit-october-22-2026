import React, { useEffect, useState, useRef } from 'react';
import { 
  FileText, 
  Shield, 
  Cookie, 
  Lock, 
  Copyright, 
  CreditCard, 
  BookOpen, 
  Users, 
  Cpu, 
  Scale,
  Search, 
  ArrowLeft, 
  ChevronRight, 
  Calendar, 
  ArrowUp, 
  Printer, 
  Moon, 
  Sun,
  Check,
  AlertTriangle,
  Mail,
  Info
} from 'lucide-react';
import { OnNavigateType, Page } from '../types';

interface LegalCenterPageProps {
  activePage: Page;
  onNavigate: OnNavigateType;
}

// Interfaces for structured document content
interface LegalSection {
  title: string;
  anchor: string;
  paragraphs: string[];
  bullets?: string[];
}

interface LegalDoc {
  id: Page;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  lastUpdated: string;
  readingTime: string;
  badge: string;
  sections: LegalSection[];
}

export const LegalCenterPage: React.FC<LegalCenterPageProps> = ({ activePage, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [highContrast, setHighContrast] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  // Back to Top and Scroll Progress listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      if (activePage !== 'legal-center') {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          const scrolled = (window.scrollY / docHeight) * 100;
          setReadingProgress(scrolled);
        }
      } else {
        setReadingProgress(0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activePage]);

  // Scroll Spy Observer
  useEffect(() => {
    if (activePage === 'legal-center') {
      setActiveSection('');
      return;
    }

    const doc = documents.find(d => d.id === activePage);
    if (!doc || !doc.sections || doc.sections.length === 0) {
      setActiveSection('');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find entries that are intersecting
        const intersecting = entries.filter(e => e.isIntersecting);
        if (intersecting.length > 0) {
          // Sort by bounding client rect to find the one closest to top
          intersecting.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSection(intersecting[0].target.id);
        }
      },
      {
        rootMargin: '-10% 0px -55% 0px',
        threshold: [0, 0.1, 0.2]
      }
    );

    doc.sections.forEach((section) => {
      const el = document.getElementById(section.anchor);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [activePage]);

  // SEO updates matching page metadata
  useEffect(() => {
    let titleStr = "Legal Center | ALGOEDIT";
    let descStr = "Read original legal agreements, privacy safeguards, security standards, and operational guidelines for the ALGOEDIT platform.";
    
    if (activePage !== 'legal-center') {
      const doc = documents.find(d => d.id === activePage);
      if (doc) {
        titleStr = `${doc.title} | ALGOEDIT`;
        descStr = `Official guidelines: ${doc.description}`;
      }
    }

    document.title = titleStr;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", descStr);
    }
  }, [activePage]);

  // Master Legal Document Content Written Fully from Scratch
  const documents: LegalDoc[] = [
    {
      id: 'terms-and-conditions',
      title: 'Terms & Conditions',
      description: 'The master agreement governing the use of the ALGOEDIT software, payment tokens, and cloud servers.',
      icon: Scale,
      lastUpdated: 'July 17, 2026',
      readingTime: '12 min read',
      badge: 'Master Agreement',
      sections: [
        {
          title: '1. Acceptance of Terms',
          anchor: 'acceptance',
          paragraphs: [
            'These Terms & Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("User," "Licensee," or "you") and ALGOEDIT ("Company," "we," "us," or "our"), concerning your access to and use of the ALGOEDIT website, web-based software, neural rendering networks, software editor interfaces, and cloud computing pipelines (collectively, the "Services").',
            'By accessing, registering with, or utilizing the Services, you acknowledge that you have read, understood, and agreed to be bound by all of these terms, including any guidelines, schedules, or updates referenced herein. If you do not agree with any part of these Terms, you are explicitly prohibited from accessing the platform and must discontinue use of all Services immediately.'
          ]
        },
        {
          title: '2. Definitions',
          anchor: 'definitions',
          paragraphs: [
            'To ensure maximum clarity and compliance throughout our documentation, the following specialized definitions shall apply:',
            '"Platform" refers to the ALGOEDIT website, client-facing dashboard, editor UI, and backend neural networks. "Compute Credits" or "Credit Tokens" refer to the non-fiat, virtual metrics utilized to initiate, process, and scale generative tasks. "User-Uploaded Content" refers to any text prompt, reference image, or configuration template uploaded to our systems. "AI-Generated Outputs" are the media files, images, or video frames synthesized by our backend pipelines.'
          ]
        },
        {
          title: '3. Eligibility and Account Creation',
          anchor: 'eligibility',
          paragraphs: [
            'By creating an account or using our Services, you represent and warrant that you are at least 18 years of age and possess the legal authority to enter into a binding contractual agreement. If you are under the age of 18 but at least 13 years old, you may only access the platform under the supervision of a parent or legal guardian who agrees to be bound by these terms.',
            'If you are accessing the platform on behalf of a corporation, partnership, or team workspace, you represent that you hold proper authorization to bind that entity to these conditions. You agree to provide true, accurate, and current registration information.'
          ]
        },
        {
          title: '4. User Accounts & Platform Security',
          anchor: 'accounts',
          paragraphs: [
            'To access our advanced generative workspace, you must create a verified account and maintain active credentials. You are entirely responsible for maintaining the confidentiality of your session tokens, passwords, and security profiles. You agree to notify us immediately at security@algoedit.ai of any unauthorized access or security breach.',
            'To protect backend configurations, we employ server-side proxy layers and access control policies. All database queries, critical API integrations, and billing endpoints are routed through secure, server-side code layers, preventing direct client-side exposure of database credentials and API keys.'
          ]
        },
        {
          title: '5. User Responsibilities & Conduct',
          anchor: 'responsibilities',
          paragraphs: [
            'You agree to utilize ALGOEDIT solely for lawful purposes and in strict accordance with these Terms, our Acceptable Use Policy, and our Community Guidelines. You remain fully responsible for all inputs, prompts, and assets uploaded to your profile, as well as all generative actions initiated under your active credentials.'
          ]
        },
        {
          title: '6. Prohibited Activities',
          anchor: 'prohibited-activities',
          paragraphs: [
            'You are strictly prohibited from engaging in any behavior that degrades, disrupts, or exploits our platform infrastructure. Prohibited activities include, but are not limited to:',
            'Automated scraping of public showcase assets, reverse engineering model weights, script injection, pipeline flooding, and double-spending virtual credits. Any attempt to bypass page boundaries, simulate payment gateway transaction callbacks, or exploit database rules will result in immediate permanent account termination and credit forfeiture.'
          ]
        },
        {
          title: '7. Virtual Compute Credits',
          anchor: 'credits',
          paragraphs: [
            'ALGOEDIT utilizes a proprietary virtual Credit Token system to distribute high-performance GPU processing capabilities. Compute Credits are consumed instantly when rendering or styling tasks are initiated, reflecting the immediate physical cost of renting cloud GPU hardware.',
            'Credits have no cash value, are non-transferable, and cannot be redeemed for fiat currency. Because model initialization and high-resolution rendering consume hardware resources immediately upon initiation, credit consumption is final and non-refundable, subject to our Refund Policy.'
          ]
        },
        {
          title: '8. Payment Terms & Subscription Billing',
          anchor: 'payment-terms',
          paragraphs: [
            'Subscription plans are billed periodically (monthly or annually) depending on the package selected. All payments are securely routed and authorized via our designated global payment gateway (including Razorpay).',
            'By subscribing, you authorize our payment processor to charge the designated payment method for the recurring fee, plus any applicable taxes, until you cancel your subscription. Cancellations must be completed through your secure Billing Portal.'
          ]
        },
        {
          title: '9. Refund Reference & Cancellation',
          anchor: 'refund-reference',
          paragraphs: [
            'Because our backend immediately reserves cloud-hosted GPU resources for each generation, all purchases of credits are non-refundable. You may cancel your subscription at any time via the billing portal. Upon cancellation, your access to advanced features will remain active until the end of your active billing cycle, as outlined in our Refund Policy.'
          ]
        },
        {
          title: '10. Intellectual Property Rights',
          anchor: 'intellectual-property',
          paragraphs: [
            'All proprietary logos, user interface designs, visual styling, vector marks, underlying software, and neural network orchestration algorithms owned by ALGOEDIT are protected by copyright, trademark, and other intellectual property laws.',
            'You are granted a limited, non-transferable, revocable license to access the platform. You are prohibited from copying, adapting, mirroring, or redistributing our structural codebase, design assets, or custom system designs.'
          ]
        },
        {
          title: '11. AI Generated Content Ownership',
          anchor: 'ai-content',
          paragraphs: [
            'Subject to your strict compliance with these Terms and your payment of all applicable fees, you retain all intellectual property rights, title, and interest in and to the AI-Generated Outputs you synthesize on ALGOEDIT.',
            'We claim zero ownership over your outputs, nor do we claim royalty rights or place limits on your commercial exploitation of generated files. You retain perpetual, royalty-free commercial rights, subject to any underlying model licenses or third-party asset restrictions, as detailed in our Digital Asset License.'
          ]
        },
        {
          title: '12. Privacy Reference & Data Collection',
          anchor: 'privacy-reference',
          paragraphs: [
            'We respect your privacy and are committed to safeguarding your personal data. Any personal data collected, stored, or processed is done so in accordance with our official Privacy Policy and Cookie Policy, which are fully incorporated into these Terms.'
          ]
        },
        {
          title: '13. Account Suspension & Termination',
          anchor: 'suspension',
          paragraphs: [
            'We reserve the right, without notice or liability, to suspend, terminate, or restrict access to any account that violates these Terms, our Acceptable Use Policy, or is found to engage in platform operations that compromise system integrity or security.'
          ]
        },
        {
          title: '14. Limitation of Liability',
          anchor: 'liability',
          paragraphs: [
            'IN NO EVENT SHALL ALGOEDIT, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF REVENUE, LOSS OF BRAND REPUTATION, OR LOSS OF DATA.',
            'ALGOEDIT DOES NOT GUARANTEE UNINTERRUPTED SYSTEM UPTIME, PARTICULARLY DURING SPONTANEOUS CLOUD GPU BOTTLENECKS. THE PLATFORM AND ALL NEURAL SERVICES ARE PROVIDED "AS-IS" WITHOUT WARRANTY OF ANY KIND.'
          ]
        },
        {
          title: '15. Governing Law',
          anchor: 'governing-law',
          paragraphs: [
            'These Terms, their interpretation, and any legal disputes arising out of your use of the ALGOEDIT platform shall be governed by and construed in accordance with the laws of the jurisdiction of our incorporation, without regard to conflict of law principles.'
          ]
        },
        {
          title: '16. Dispute Resolution',
          anchor: 'dispute-resolution',
          paragraphs: [
            'In the interest of resolving disputes in the most expedient and cost-effective manner, you and ALGOEDIT agree that any dispute arising out of or in connection with these Terms shall be resolved through binding individual arbitration rather than court proceedings, except where prohibited by law.'
          ]
        },
        {
          title: '17. Changes to These Terms',
          anchor: 'changes-to-terms',
          paragraphs: [
            'We reserve the right, at our sole discretion, to modify or replace these Terms at any time. When material updates are made, we will notify users by updating the "Last Updated" date at the top of this document or via platform banner announcements. Your continued use of the platform constitutes acceptance of the updated terms.'
          ]
        },
        {
          title: '18. Contact Information',
          anchor: 'contact-info',
          paragraphs: [
            'If you have any questions, compliance concerns, or comments regarding these Terms, you can reach out directly to our operations desk at legal@algoedit.ai.'
          ]
        }
      ]
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      description: 'Detailed details on data collection safeguards, secure cloud logs, hashing algorithms, and your control rights.',
      icon: Shield,
      lastUpdated: 'July 17, 2026',
      readingTime: '7 min read',
      badge: 'Data Protection',
      sections: [
        {
          title: '1. Introduction and Scope',
          anchor: 'scope',
          paragraphs: [
            'ALGOEDIT ("we," "us," or "our") respects your privacy and is dedicated to protecting your personal data. This Privacy Policy describes how we collect, use, store, and safeguard your personal information when you access or register with our platform.',
            'This policy applies to all users of our web application, subscription plans, and API interfaces. By utilizing our Services, you consent to the data practices described in this policy, which is fully aligned with our Terms & Conditions.'
          ]
        },
        {
          title: '2. Information We Collect',
          anchor: 'collection',
          paragraphs: [
            'We collect information that identifies or relates to you, categorized as follows:',
            'Account Credentials: Name, email address, custom username, and securely hashed passwords. Usage Data: IP addresses, browser metadata, operating system specs, page interaction records, and neural generation logs. Uploaded Inputs: Text prompts, configuration templates, or reference files uploaded for processing. Payment Details: Transaction reference IDs (all payment data is processed directly by certified third-party payment gateways; we do not store raw card numbers).'
          ]
        },
        {
          title: '3. Legal Basis for Processing (GDPR)',
          anchor: 'legal-basis',
          paragraphs: [
            'For individuals residing in the European Economic Area (EEA), our legal basis for processing your personal data depends on the specific context:',
            'Performance of Contract: Processing is necessary to deliver the Services you requested. Legitimate Interests: Processing supports our interest in maintaining platform security, preventing abuse, and improving performance. Legal Obligation: Processing is required to comply with financial, taxation, and corporate disclosure laws. Consent: Where you have provided explicit consent for specific promotional channels.'
          ]
        },
        {
          title: '4. Data Storage and Retention',
          anchor: 'retention',
          paragraphs: [
            'Your personal data and uploaded files are stored securely in encrypted database clusters. We retain personal information only for as long as necessary to fulfill the purposes outlined in this policy or to comply with statutory legal requirements.',
            'Active assets and generated images are retained in secure cloud storage under user control. Upon account deletion requests, personal records are permanently purged, subject to our Data Request Desk procedures.'
          ]
        },
        {
          title: '5. Security Measures',
          anchor: 'security-measures',
          paragraphs: [
            'We implement technical and organizational security measures to protect your personal data against unauthorized access, alteration, or disclosure. These measures include HTTPS transport encryption, TLS 1.3 protocol standards, secure password hashing, and server-side processing gates.',
            'While we make diligent efforts to protect your personal information, no digital transmission or storage system can be guaranteed as entirely risk-free. Please refer to our Security Policy for additional infrastructure details.'
          ]
        },
        {
          title: '6. Your Privacy Rights',
          anchor: 'rights',
          paragraphs: [
            'Depending on your location, you may possess specific rights regarding your personal information under frameworks like GDPR or CCPA. These rights include:',
            'The right to access and download a portable copy of your data; the right to rectify inaccurate records; the right to request the permanent erasure of your personal data; the right to restrict or object to certain processing activities. You can submit these requests through our Data Request Desk.'
          ]
        },
        {
          title: '7. Cookies and Tracking',
          anchor: 'cookies',
          paragraphs: [
            'We utilize cookies, local storage objects, and similar tracking technologies to handle session authentication, remember user preferences, and compile anonymous performance metrics. For comprehensive details, please review our Cookie Policy.'
          ]
        },
        {
          title: '8. Contact Information',
          anchor: 'privacy-contact',
          paragraphs: [
            'If you have questions regarding this Privacy Policy or wish to exercise your privacy rights, please contact our Data Protection Officer at privacy@algoedit.ai.'
          ]
        }
      ]
    },
    {
      id: 'cookie-policy',
      title: 'Cookie Policy',
      description: 'Clear details on browser storage, local session security, analytics trackers, and cookie preferences.',
      icon: Cookie,
      lastUpdated: 'July 17, 2026',
      readingTime: '5 min read',
      badge: 'Storage & Consent',
      sections: [
        {
          title: '1. Understanding Cookies & Local Storage',
          anchor: 'what-cookies',
          paragraphs: [
            'Cookies are small text files stored on your computer or mobile device when navigating websites. In addition to standard cookies, ALGOEDIT utilizes browser HTML5 LocalStorage and session cookies to retain UI layout preferences, active workspace tabs, and secure login states.',
            'These technologies are critical for tracking authentication state and maintaining your creative workflow across page refreshes, and are utilized in accordance with our Privacy Policy.'
          ]
        },
        {
          title: '2. Types of Cookies We Use',
          anchor: 'cookie-types',
          paragraphs: [
            'We utilize the following categories of cookies and local storage objects:',
            'Strictly Necessary: Essential to authenticate users, protect sessions, enforce rate-limit quotas, and process payment transactions securely. Functional & Preference: Retains your workspace settings, dark/light contrast choices, active model selections, and custom view filters. Performance & Analytics: Collects anonymous, aggregated usage statistics regarding page interaction speeds to help optimize our backend GPU queues.'
          ]
        },
        {
          title: '3. Third-Party Cookies',
          anchor: 'third-party-cookies',
          paragraphs: [
            'Certain third-party integrations on our platform may set cookies in your browser. These include Firebase Authentication (to maintain your secure sign-in session) and secure payment processors like Razorpay (to facilitate checkout transactions). We do not control these third-party trackers, and their usage is governed by their respective owners.'
          ]
        },
        {
          title: '4. Managing Your Choices',
          anchor: 'cookie-controls',
          paragraphs: [
            'Most modern web browsers allow you to manage your cookie preferences, including blocking third-party cookies or disabling storage completely. Please note that blocking strictly necessary cookies will prevent ALGOEDIT from verifying your session, which will break core features like workspace access and account sign-in.'
          ]
        }
      ]
    },
    {
      id: 'security-policy',
      title: 'Security Policy',
      description: 'Overview of our client-side proxy structures, secure database syncing, and threat mitigation practices.',
      icon: Lock,
      lastUpdated: 'July 17, 2026',
      readingTime: '6 min read',
      badge: 'Infrastructure',
      sections: [
        {
          title: '1. Secure Frontend Architecture & Gateway Proxies',
          anchor: 'zero-exposure',
          paragraphs: [
            'ALGOEDIT is designed with security-focused software principles. To protect backend assets, sensitive database credentials, API integrations, and billing endpoints are executed exclusively server-side. The user browser only handles presentation layers and secure tokenized authentication payloads.',
            'This architecture helps prevent client-side extraction of connection strings, API tokens, and private database structures, in alignment with our Terms & Conditions.'
          ]
        },
        {
          title: '2. Data Protection & Encryption',
          anchor: 'data-protection',
          paragraphs: [
            'We implement industry-standard encryption protocols to safeguard data throughout its lifecycle:',
            'In Transit: All communications between your browser and our servers are encrypted using HTTPS with TLS 1.3 standards. At Rest: Passive database records, account data, and user profiles are stored in encrypted databases with automated access controls. Credentials: User passwords are processed using robust one-way cryptographic hashing before storage.'
          ]
        },
        {
          title: '3. API Security & Session Management',
          anchor: 'api-security',
          paragraphs: [
            'Our backend APIs utilize security tokens to authenticate and authorize every computation and credit transaction. We employ strict session management policies, automatically invalidating stale or compromised tokens to prevent unauthorized account access. Access logs are monitored to detect anomalies.'
          ]
        },
        {
          title: '4. Security Monitoring & Intrusion Detection',
          anchor: 'monitoring',
          paragraphs: [
            'Our cloud servers monitor traffic patterns and connection frequencies to detect rate-limit exploitation, prompt-injection attacks, SQL injections, and buffer-overflow behaviors.',
            'Automated abuse detection filters immediately quarantine suspicious IP addresses and profiles, preventing DDoS saturation of shared model execution servers and maintaining platform availability.'
          ]
        },
        {
          title: '5. Responsible Vulnerability Disclosure',
          anchor: 'disclosure',
          paragraphs: [
            'We welcome compliance findings from security researchers. If you identify a potential security flaw or permission bypass within our databases, database rules, or backend APIs, please report it to security@algoedit.ai.',
            'We pledge to evaluate and address all validated, responsibly disclosed security concerns within 48 hours of secure transmission. We request that you avoid public disclosure until we have resolved the issue.'
          ]
        }
      ]
    },
    {
      id: 'copyright-policy',
      title: 'Copyright & Intellectual Property',
      description: 'Guidelines for trademark protection, synthesized art parameters, and the DMCA takedown process.',
      icon: Copyright,
      lastUpdated: 'July 17, 2026',
      readingTime: '6 min read',
      badge: 'DMCA & IP',
      sections: [
        {
          title: '1. Protection of ALGOEDIT Brand',
          anchor: 'brand-protection',
          paragraphs: [
            'All proprietary logos, trade names, user interface designs, custom graphics, vector marks, software code, and neural network orchestration mechanisms owned by ALGOEDIT are protected by copyright, trademark, and trade secret laws.',
            'You are granted a limited license to access the platform. You are strictly prohibited from copying, adapting, mirroring, or reverse-engineering our structural codebases or branding assets without express written consent.'
          ]
        },
        {
          title: '2. DMCA Takedown Notifications',
          anchor: 'dmca',
          paragraphs: [
            'We respect intellectual property rights and respond to notices of alleged copyright infringement under the Digital Millennium Copyright Act (DMCA). If you believe that any material hosted on the ALGOEDIT public showcase infringes upon your copyright, you may submit a formal takedown notice to our designated agent at legal@algoedit.ai.',
            'Your notice must include: A physical or electronic signature of the copyright owner or authorized representative; identification of the copyrighted work claimed to have been infringed; identification of the infringing material with specific URL paths; your contact details; and statements of good faith and accuracy under penalty of perjury.'
          ]
        },
        {
          title: '3. Counter-Notification Procedure',
          anchor: 'counter-notice',
          paragraphs: [
            'If you believe that your content was removed by mistake or misidentification, you may submit a written counter-notification to our agent. Your counter-notification must contain: Your signature; identification of the removed material and its former location; a statement under penalty of perjury that you have a good faith belief the material was removed in error; and your consent to local federal court jurisdiction.'
          ]
        },
        {
          title: '4. Repeat Infringer Rule',
          anchor: 'repeat-infringers',
          paragraphs: [
            'In accordance with the DMCA, ALGOEDIT enforces a strict three-strike policy. Users who repeatedly upload unauthorized, copyright-infringing source files as inputs or public showcase listings will suffer permanent workspace suspension and credit forfeiture, as detailed in our Terms & Conditions.'
          ]
        },
        {
          title: '5. AI Output Legal Status Disclaimer',
          anchor: 'ai-copyright-disclaimer',
          paragraphs: [
            'Please note that copyright laws surrounding AI-Generated Outputs remain highly dynamic and vary significantly by country. ALGOEDIT claims no ownership over your generated works, as specified in our Digital Asset License. However, we advise users to consult their own legal counsel regarding the protectability and commercial registration of AI-synthesized media in their respective jurisdictions.'
          ]
        }
      ]
    },
    {
      id: 'refund-policy',
      title: 'Refund & Cancellation',
      description: 'Clear rules regarding payment tokenization, server reservation fees, and credit consumption.',
      icon: CreditCard,
      lastUpdated: 'July 17, 2026',
      readingTime: '4 min read',
      badge: 'Billing Policy',
      sections: [
        {
          title: '1. Compute Allocation and Non-Refundability',
          anchor: 'billing-rules',
          paragraphs: [
            'ALGOEDIT processes neural generations by renting high-performance cloud GPUs. Because model loading, weights initialization, and rendering tasks consume expensive physical server resources instantly upon initiation, all purchases of Compute Credits and subscriptions are non-refundable.',
            'We do not offer credits or cash refunds for unused tokens once they are successfully deposited into your secure workspace balance, except as explicitly required by local consumer protection laws.'
          ]
        },
        {
          title: '2. Subscription Cancellation',
          anchor: 'subscription-cancel',
          paragraphs: [
            'You may cancel your recurring monthly or annual subscription at any time via your secure Billing Portal. Upon cancellation, your access to premium editor features and active tools will remain fully operational until the conclusion of your current paid billing cycle. No further recurring charges will be processed.'
          ]
        },
        {
          title: '3. Billing Disputes and Exceptions',
          anchor: 'disputes',
          paragraphs: [
            'If you identify a duplicate credit card charge, billing anomaly, or transaction error, please notify our billing team within 7 days of the transaction at billing@algoedit.ai. Verified double-charges or processing faults will be promptly corrected and refunded to your original payment method.',
            'Disputes initiated after the 7-day window or those stemming from automated subscription renewals that were not cancelled prior to the billing date are not eligible for exceptions, in compliance with our Terms & Conditions.'
          ]
        },
        {
          title: '4. Token Forfeiture',
          anchor: 'forfeiture',
          paragraphs: [
            'If an account is permanently terminated or suspended due to severe terms violations, such as fraudulent activity, platform abuse, or breaches of our Acceptable Use Policy, all remaining Compute Credits and inactive balances associated with that account are immediately forfeited and will not be refunded.'
          ]
        }
      ]
    },
    {
      id: 'digital-license',
      title: 'Digital Asset License',
      description: 'Scope of usage for synthesized materials, commercial redistributions, and digital template sharing.',
      icon: BookOpen,
      lastUpdated: 'July 17, 2026',
      readingTime: '5 min read',
      badge: 'Asset Licensing',
      sections: [
        {
          title: '1. Grant of License for Outputs',
          anchor: 'license-grant',
          paragraphs: [
            'Subject to your full compliance with our Terms & Conditions and prompt payment of all fees, ALGOEDIT grants you a perpetual, worldwide, non-exclusive, royalty-free license to use, display, modify, distribute, and commercially exploit all AI-Generated Outputs produced through your paid compute profile.',
            'You retain the right to sell, license, or publish your outputs. However, you acknowledge that AI-synthesized outputs may be subject to public domain exceptions or the license terms of underlying open-source model weights (e.g. Stable Diffusion), which ALGOEDIT does not control.'
          ]
        },
        {
          title: '2. License to Inputs',
          anchor: 'inputs-license',
          paragraphs: [
            'By uploading User-Uploaded Content (images, text prompts, or configurations) to the platform, you grant ALGOEDIT a limited, secure, non-exclusive, worldwide, royalty-free license to host, process, reproduce, and transmit your input materials solely as necessary to perform the requested neural synthesis and deliver the Services to you.',
            'We do not sell your inputs to third parties, nor do we use them to train public model checkpoints without your explicit, opt-in consent.'
          ]
        },
        {
          title: '3. Marketplace Terms & Shared Presets',
          anchor: 'marketplace-terms',
          paragraphs: [
            'If you choose to upload custom configurations, rendering presets, or style templates to the public showcase or ALGOEDIT community hubs, you grant other registered builders a personal, non-exclusive, non-transferable license to utilize those presets to synthesize assets within their individual workspaces.',
            'Redistributing, repackaging, or reselling ALGOEDIT raw style templates, configurations, or model checkpoints on external stock media websites or competing platforms is strictly prohibited.'
          ]
        }
      ]
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable Use Policy',
      description: 'Boundaries of legal modeling workflows, prohibiting reverse engineering, prompt injections, and script spamming.',
      icon: Shield,
      lastUpdated: 'July 17, 2026',
      readingTime: '5 min read',
      badge: 'Rules of Conduct',
      sections: [
        {
          title: '1. General Compliance & Acceptable Conduct',
          anchor: 'general-conduct',
          paragraphs: [
            'Our Services must be utilized solely for lawful and ethical purposes. You agree to comply with all applicable local, national, and international laws and regulations when interacting with the ALGOEDIT platform, including intellectual property laws and privacy statutes.'
          ]
        },
        {
          title: '2. Prohibited Generative Outputs',
          anchor: 'prohibited-outputs',
          paragraphs: [
            'You are strictly prohibited from utilizing our neural pipelines to synthesize, upscale, or share content that:',
            'Promotes or depicts child sexual abuse material (CSAM) or exploitation; promotes self-harm, suicide, or extreme physical cruelty; incites racial, religious, or gender-based violence or hatred; constitutes systematic harassment, defamation, or stalking; or creates deceptive non-consensual deepfakes of private individuals.'
          ]
        },
        {
          title: '3. System Integrity & Infrastructure Abuse',
          anchor: 'system-abuse',
          paragraphs: [
            'To ensure fair access to high-performance GPU resources for all users, you may not engage in:',
            'Automated scraping of showcase assets or metadata; reverse-engineering model checkpoints; prompt injection attacks intended to compromise backend filters; pipeline flooding with spam requests; or double-spending credit tokens. Bypassing billing walls or exploiting Firestore rules is grounds for immediate account termination.'
          ]
        },
        {
          title: '4. Screening, Monitoring & Enforcement',
          anchor: 'enforcement',
          paragraphs: [
            'We employ automated safety screening tools that analyze prompts and input images for compliance. Flagged prompt strings will be blocked from execution. We reserve the right to review public listings and suspend accounts that repeatedly violate this Acceptable Use Policy, in accordance with our Terms & Conditions.'
          ]
        }
      ]
    },
    {
      id: 'community-guidelines',
      title: 'Community Guidelines',
      description: 'Our standards for creative collaboration, public showcase listings, and report moderations.',
      icon: Users,
      lastUpdated: 'July 17, 2026',
      readingTime: '4 min read',
      badge: 'Collaboration',
      sections: [
        {
          title: '1. Creative Collaboration & Showcase Principles',
          anchor: 'collaboration',
          paragraphs: [
            'The ALGOEDIT community and Public Showcase are built to foster inspiration, creative exchange, and design innovation. We encourage users to share their rendering configurations, celebrate artistic breakthroughs, and maintain respect when interacting with other builders.'
          ]
        },
        {
          title: '2. Content Standards for Public Listings',
          anchor: 'showcase-rules',
          paragraphs: [
            'When publishing files to our public feed or shared libraries, you must ensure they remain civilized. Do not post imagery or prompt strings designed to degrade individuals, incite political conflict, deliver commercial spam, or contain highly controversial elements.',
            'All public listings are subject to community flagging and manual moderation. Content deemed unsuitable for the public feed may be hidden or unlisted without notice.'
          ]
        },
        {
          title: '3. Community Feedback and Moderation',
          anchor: 'moderation',
          paragraphs: [
            'We support respectful feedback, constructive technical advice, and positive reinforcement. Harassment, systematic trolling, stalking, or hostile communication within our showcase descriptions or user profiles will result in immediate suspension.',
            'Users can report suspicious listings or offensive comments directly to our team at legal@algoedit.ai.'
          ]
        },
        {
          title: '4. Appeals and Re-activation Process',
          anchor: 'appeals',
          paragraphs: [
            'If your public listing has been hidden or your account suspended due to a guidelines infraction, you may file a formal appeal within 14 days of enforcement by contacting legal@algoedit.ai. Our moderation team will evaluate the appeal and respond within 7 business days.'
          ]
        }
      ]
    },
    {
      id: 'ai-usage-policy',
      title: 'AI Usage Policy',
      description: 'Understanding neural limitations, ethical output disclosures, and stochastic verification requirements.',
      icon: Cpu,
      lastUpdated: 'July 17, 2026',
      readingTime: '5 min read',
      badge: 'AI Compliance',
      sections: [
        {
          title: '1. Ethical Model Interaction & Transparency',
          anchor: 'ethical-ai',
          paragraphs: [
            'Our neural synthesis engines are trained to assist, augment, and accelerate human creativity. While we respect user autonomy, we strongly encourage honest disclosures when publishing synthesized content in journalistic, scientific, or critical public media.',
            'Transparency about generative methods builds trust and prevents misinformation in public spheres, aligning with our Acceptable Use Policy.'
          ]
        },
        {
          title: '2. Stochastic Limitations & Disclaimers',
          anchor: 'stochastic-limit',
          paragraphs: [
            'AI generative pipelines operate based on complex statistical probability distributions. Consequently, models can display stochastic inaccuracies (sometimes referred to as "hallucinations"), visual rendering anomalies, anatomical glitches, or physical impossibilities.',
            'Users must carefully inspect and verify outputs before utilizing them in critical applications or professional projects. ALGOEDIT assumes no liability for errors, logical inconsistencies, or physical inaccuracies in generated outputs.'
          ]
        },
        {
          title: '3. Bias Mitigation and safety',
          anchor: 'safety',
          paragraphs: [
            'Neural network weights reflect the historical datasets they were trained on, which can occasionally contain implicit biases. We actively work to update safety filters and mitigate biased representations in our outputs. We encourage users to report any systematic bias anomalies to safety@algoedit.ai.'
          ]
        },
        {
          title: '4. Model License Compliance',
          anchor: 'model-compliance',
          paragraphs: [
            'Our platform coordinates multiple generative models. By using ALGOEDIT, you agree to comply with any specific licensing terms or restrictions associated with the underlying open-source model weights (such as CreativeML OpenRAIL-M for Stable Diffusion components) that power our pipelines.'
          ]
        }
      ]
    },
    {
      id: 'creator-guidelines',
      title: 'Content & Creator Guidelines',
      description: 'The creative standards, disclosure requirements, commercial parameters, and ethical guidelines for ALGOEDIT creators.',
      icon: BookOpen,
      lastUpdated: 'July 17, 2026',
      readingTime: '5 min read',
      badge: 'Creator Conduct',
      sections: [
        {
          title: '1. Empowering Responsible Creation',
          anchor: 'responsible-creation',
          paragraphs: [
            'ALGOEDIT is committed to empowering artists, designers, developers, and filmmakers to push the boundaries of media synthesis. We believe that AI-assisted media should elevate human imagination, rather than replace human critical judgment.',
            'As an ALGOEDIT creator, you are expected to operate with transparency and professional integrity. When publishing high-impact media generated on our platform, particularly in journalistic, educational, or corporate public domains, we encourage a simple disclosure of AI-assisted methods.'
          ]
        },
        {
          title: '2. Commercial Usage & Original Workflows',
          anchor: 'commercial-standards',
          paragraphs: [
            'All creators are granted full commercial rights to their synthesized outputs, as detailed in our Digital Asset License. However, to maintain high platform credibility, you are encouraged to combine AI-generated layers with custom human inputs, post-production touches, or direct design refinements.',
            'Repackaging and selling raw, unmodified AI outputs as "exclusive 100% human-made photography" or "original hand-drawn vector art" is highly discouraged, as it degrades trust across the creative industry.'
          ]
        },
        {
          title: '3. Prohibited & Restricted Content Themes',
          anchor: 'content-restrictions',
          paragraphs: [
            'To maintain an safe and inspiring creative environment for all, you must not use our AI engines or public feeds to generate or publish content containing:',
            'Severe violence, physical cruelty, self-harm prompts, racial or religious hate speech, non-consensual deepfakes of private figures, systematic harassment, and adult content that violates local regulations. Creators who repeatedly attempt to bypass prompt filters for prohibited themes will face temporary or permanent account termination, in alignment with our Acceptable Use Policy.'
          ]
        },
        {
          title: '4. Presets and Community Sharing',
          anchor: 'community-presets',
          paragraphs: [
            'When contributing rendering configurations, custom styling presets, or workflow templates to our public showcase, you must provide helpful descriptions and accurate metadata.',
            'Do not engage in prompt-scamming or flood the showcase feed with repetitive, near-identical style templates. Respect the community space and celebrate the diversity of designs generated by other creators.'
          ]
        }
      ]
    },
    {
      id: 'data-request',
      title: 'Data Request Desk',
      description: 'Submit an automated Data Subject Access Request (DSAR) to download, update, or permanently purge your personal account records.',
      icon: Users,
      lastUpdated: 'July 17, 2026',
      readingTime: '2 min read',
      badge: 'Privacy Controls',
      sections: [
        {
          title: '1. Managing Your Privacy Rights',
          anchor: 'dsar-overview',
          paragraphs: [
            'In compliance with data protection laws like GDPR and CCPA, ALGOEDIT provides this Data Request Desk to allow you to exercise complete control over your personal records.',
            'You may submit requests to access, download, update, or permanently delete your account data. To submit a request, please navigate to our Data Subject Access Request page, which is fully secure.'
          ]
        },
        {
          title: '2. Verification of Identity',
          anchor: 'dsar-verification',
          paragraphs: [
            'To protect your privacy and secure our systems, we must verify the identity of the request submitter before processing any DSAR. This may involve sending a verification link to your registered email or asking you to confirm your active session details.'
          ]
        }
      ]
    }
  ];

  // Filters documents by search query
  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDoc = documents.find(d => d.id === activePage);

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy link: ", err);
    });
  };

  const handleDownloadTxt = () => {
    if (!activeDoc) return;
    let content = `${activeDoc.title.toUpperCase()}\n`;
    content += `Last Updated: ${activeDoc.lastUpdated}\n`;
    content += `Version: 1.0\n\n`;
    content += `Description: ${activeDoc.description}\n\n`;
    content += `========================================================\n\n`;
    
    activeDoc.sections.forEach(sec => {
      content += `${sec.title}\n\n`;
      sec.paragraphs.forEach(p => {
        content += `${p}\n\n`;
      });
      if (sec.bullets) {
        sec.bullets.forEach(b => {
          content += `* ${b}\n`;
        });
        content += `\n`;
      }
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `algoedit-${activeDoc.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCrossLink = (pageId: Page) => {
    onNavigate(pageId);
  };

  if (activePage === 'legal-center' || activePage === 'legal') {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-10 pb-20 animate-fade-in px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumbs & Back */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onNavigate('home')} 
            className="group flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-wider bg-slate-900/40 hover:bg-cyan-950/20 border border-slate-800/40 hover:border-cyan-500/20 px-3.5 py-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            id="legal-home-back-btn"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            BACK_TO_HOME
          </button>
          
          <nav aria-label="Legal Center Breadcrumbs" className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <button onClick={() => onNavigate('home')} className="hover:text-cyan-400 transition-colors focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:outline-none rounded px-1">HOME</button>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-bold uppercase">LEGAL CENTER</span>
          </nav>
        </div>

        {/* Hero Section */}
        <header id="legal-center-hero-header" className="relative text-center space-y-5 p-10 md:p-14 rounded-3xl bg-gradient-to-b from-[#0B101E]/80 to-[#04060C]/95 border border-slate-800/60 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full filter blur-[150px] pointer-events-none" />
          <div className="absolute -bottom-10 right-10 w-72 h-72 bg-fuchsia-500/10 rounded-full filter blur-[120px] pointer-events-none" />
          
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 shadow-xl shadow-cyan-500/5 animate-pulse">
              <Shield size={44} className="stroke-[1.5]" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            Legal <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400">Center</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Welcome to the ALGOEDIT compliance resource terminal. Here you can access original, binding legal agreements, user policies, and privacy protocols written from scratch to ensure absolute regulatory transparency.
          </p>

          {/* Real-time compliance code */}
          <div className="inline-flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-900/60 border border-slate-800/80 px-4 py-1.5 rounded-full">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ALL POLICIES CURRENT & COMPLIANT AS OF JULY 2026
          </div>
        </header>

        {/* Filter and Search Section */}
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            id="legal-policy-search-input"
            type="text"
            aria-label="Search our legal policies"
            placeholder="Search our legal policies (e.g. refund, privacy)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#080B15]/95 border border-slate-800 hover:border-cyan-500/40 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 text-sm text-white placeholder-slate-500 transition-all font-sans focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          />
        </div>

        {/* Bento Grid layout of policies */}
        {filteredDocs.length > 0 ? (
          <div id="legal-policies-bento-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc, idx) => {
              const DocIcon = doc.icon;
              return (
                <button
                  key={doc.id}
                  id={`legal-card-${doc.id}`}
                  onClick={() => onNavigate(doc.id)}
                  aria-label={`Open policy: ${doc.title} - ${doc.badge}`}
                  className="group text-left relative p-6 sm:p-8 rounded-2xl bg-[#080B15]/90 hover:bg-[#0C101F]/90 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between h-full hover:-translate-y-1 hover:shadow-cyan-500/5 focus:border-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <div className="space-y-4 w-full">
                    {/* Header bar within bento card */}
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-cyan-500/20 group-hover:bg-cyan-950/20 text-cyan-400 transition-colors">
                        <DocIcon size={22} className="stroke-[1.5]" />
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/40 border border-cyan-800/30 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                        {doc.badge}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors uppercase font-mono tracking-tight">
                        {doc.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans line-clamp-3">
                        {doc.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer details within card */}
                  <div className="pt-6 mt-6 border-t border-slate-900/60 flex items-center justify-between text-[11px] font-mono text-slate-500 w-full">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-600" />
                      {doc.lastUpdated}
                    </span>
                    <span className="text-cyan-400 group-hover:translate-x-1.5 transition-transform flex items-center gap-1 font-bold">
                      READ POLICY
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/20 border border-slate-800/40 rounded-2xl max-w-md mx-auto space-y-4">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
            <h3 className="text-base font-bold text-white uppercase font-mono">No matching documents found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              We couldn\'t find any legal documentation matching your terms. Try searching for "privacy", "refund", or "intellectual".
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-cyan-400 hover:underline font-mono"
            >
              CLEAR_SEARCH_FILTER
            </button>
          </div>
        )}
        
        {/* Legal Contact Disclaimer Banner */}
        <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/60 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 flex-shrink-0">
            <Mail size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white uppercase font-mono">Have compliance or privacy inquiries?</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Our legal operations and compliance desks are online to support security audits, DMCA processing, or GDPR inquiries. Read our policies or contact us directly at <span className="text-cyan-400 font-mono font-bold">legal@algoedit.ai</span>.
            </p>
          </div>
        </div>

      </div>
    );
  }

  // Active Policy Document Reader View
  if (!activeDoc) return null;
  const ActiveDocIcon = activeDoc.icon;

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-8 pb-20 px-4 sm:px-6 lg:px-8 ${highContrast ? 'light-document' : 'animate-fade-in'}`} ref={contentRef}>
      
      {/* Scroll progress bar */}
      <div 
        className="fixed top-0 left-0 w-full h-1 bg-slate-900/40 z-50 pointer-events-none"
        style={{ contentVisibility: 'auto' }}
      >
        <div 
          className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-100"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Top Header Control Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/50 pb-4">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('legal-center')} 
            className="group flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors uppercase tracking-wider bg-slate-900/40 hover:bg-cyan-950/20 border border-slate-800/40 hover:border-cyan-500/20 px-3.5 py-1.5 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#03050C]"
            id="reader-back-to-center-btn"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            LEGAL_CENTER
          </button>
          
          <nav aria-label="Policy document breadcrumbs" className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-300">
            <button onClick={() => onNavigate('home')} className="hover:text-cyan-400 transition-colors focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:outline-none rounded px-1">HOME</button>
            <span className="text-slate-600">/</span>
            <button onClick={() => onNavigate('legal-center')} className="hover:text-cyan-400 transition-colors uppercase focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:outline-none rounded px-1">LEGAL</button>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-bold uppercase">{activeDoc.title}</span>
          </nav>
        </div>

        {/* Reader controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors bg-slate-900/50 hover:bg-cyan-950/10 border border-slate-800 hover:border-cyan-500/20 px-3 py-1.5 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#03050C]"
            title="Copy document link to clipboard"
            id="copy-legal-link-btn"
            aria-label="Copy document link to clipboard"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <FileText size={13} />}
            <span>{copied ? "COPIED" : "COPY_LINK"}</span>
          </button>

          {/* Download TXT Button */}
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors bg-slate-900/50 hover:bg-cyan-950/10 border border-slate-800 hover:border-cyan-500/20 px-3 py-1.5 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#03050C]"
            title="Download document as text file"
            id="download-legal-doc-btn"
            aria-label="Download document as text file"
          >
            <ArrowUp size={13} className="rotate-180" />
            <span>DOWNLOAD_TXT</span>
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors bg-slate-900/50 hover:bg-cyan-950/10 border border-slate-800 hover:border-cyan-500/20 px-3 py-1.5 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#03050C]"
            title="Print Document"
            id="print-legal-doc-btn"
            aria-label="Print this legal document"
          >
            <Printer size={13} />
            <span className="hidden sm:inline">PRINT_DOC</span>
          </button>

          {/* High Contrast Swapper */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`flex items-center gap-2 text-xs font-mono border px-3 py-1.5 rounded-lg cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#03050C] ${
              highContrast 
                ? 'bg-slate-900 border-slate-700 text-slate-100 hover:text-cyan-400' 
                : 'bg-slate-900/50 hover:bg-cyan-950/10 border-slate-800 hover:border-cyan-500/20 text-slate-300 hover:text-cyan-400'
            }`}
            title={highContrast ? "Switch to Neural Dark" : "Switch to Ink Light"}
            id="high-contrast-toggle-btn"
            aria-label={highContrast ? "Switch page theme to dark" : "Switch page theme to light"}
          >
            {highContrast ? <Moon size={13} /> : <Sun size={13} />}
            <span className="hidden sm:inline">{highContrast ? "NEURAL_DARK" : "INK_LIGHT"}</span>
          </button>
        </div>
      </div>

      {/* Hero Header Section */}
      <header className={`relative text-center space-y-4 p-8 sm:p-10 rounded-3xl border shadow-xl overflow-hidden transition-colors ${
        highContrast 
          ? 'bg-slate-50 border-slate-300' 
          : 'bg-gradient-to-b from-[#0B101F]/80 to-[#04060C]/95 border-slate-800/60'
      }`}>
        {!highContrast && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-cyan-500/10 rounded-full filter blur-[120px] pointer-events-none" />}
        
        <div className="flex justify-center">
          <div className={`p-4 rounded-full border shadow-md ${
            highContrast ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-900/90 border-cyan-500/30 text-cyan-400'
          }`}>
            <ActiveDocIcon size={36} className="stroke-[1.5]" />
          </div>
        </div>
        
        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight uppercase ${
          highContrast ? 'text-slate-900' : 'text-white'
        }`}>
          {activeDoc.title}
        </h1>
        
        <p className={`max-w-2xl mx-auto text-xs sm:text-sm font-medium ${
          highContrast ? 'text-slate-600' : 'text-slate-300'
        }`}>
          {activeDoc.description}
        </p>


      </header>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sticky Sidebar Navigation (Table of Contents) */}
        <div className="lg:col-span-1 space-y-4 hidden lg:block">
          <div className={`sticky top-24 p-5 rounded-2xl border backdrop-blur-xl space-y-4 transition-colors ${
            highContrast 
              ? 'bg-slate-100/90 border-slate-300 text-slate-800' 
              : 'bg-[#080B15]/90 border-slate-800/80 text-white'
          }`}>
            <div className={`flex items-center gap-2 pb-3 border-b ${highContrast ? 'border-slate-300' : 'border-slate-800/60'}`}>
              <FileText size={16} className={highContrast ? 'text-slate-800' : 'text-cyan-400'} />
              <h4 className="text-xs font-black uppercase tracking-wider font-mono">TABLE OF CONTENTS</h4>
            </div>
            
            <nav className="flex flex-col gap-1 text-xs font-mono">
              {activeDoc.sections.map(section => {
                const isActive = activeSection === section.anchor;
                return (
                  <a
                    key={section.anchor}
                    href={`#${section.anchor}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(section.anchor);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-[11px] uppercase font-bold flex items-center justify-between focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                      isActive
                        ? highContrast
                          ? 'border-cyan-300 bg-cyan-50 text-cyan-700 shadow-[0_2px_8px_rgba(6,182,212,0.1)]'
                          : 'border-cyan-500/30 bg-cyan-950/30 text-cyan-400 [text-shadow:0_0_10px_rgba(34,211,238,0.5)] shadow-[0_0_15px_rgba(34,211,238,0.08)]'
                        : highContrast
                          ? 'border-transparent text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                    }`}
                  >
                    <span className="truncate">{section.title}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)] animate-pulse flex-shrink-0 ml-2" />
                    )}
                  </a>
                );
              })}
            </nav>

            <div className={`pt-4 border-t space-y-3 font-mono ${highContrast ? 'border-slate-300' : 'border-slate-800/60'}`}>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1">ALGOEDIT LEGAL CENTER:</div>
              <nav aria-label="Legal documents directory list" className="flex flex-col gap-1 text-[11px] max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                {documents.map(linkDoc => {
                  const isActive = linkDoc.id === activePage;
                  return (
                    <button
                      key={linkDoc.id}
                      onClick={() => handleCrossLink(linkDoc.id)}
                      className={`text-left font-semibold flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 cursor-pointer w-full focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                        isActive
                          ? highContrast
                            ? 'bg-cyan-50 border-cyan-300 text-cyan-700 font-black pl-3 shadow-[0_2px_8px_rgba(6,182,212,0.1)]'
                            : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400 font-black pl-3 [text-shadow:0_0_8px_rgba(34,211,238,0.5)] shadow-[0_0_12px_rgba(34,211,238,0.08)]'
                          : highContrast
                            ? 'border-transparent text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                            : 'border-transparent text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/10 hover:border-cyan-500/10'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="truncate">{linkDoc.title.toUpperCase()}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Primary Legal Text Container - Ink Light / Cyber Dark Glassmorphism Card */}
        <div className="lg:col-span-3">
          <div className={`relative p-6 sm:p-10 rounded-3xl border shadow-xl overflow-hidden transition-colors ${
            highContrast 
              ? 'bg-white border-slate-300 text-slate-900' 
              : 'bg-[#080B15]/90 border-slate-800/80 text-slate-300'
          }`}>
            {!highContrast && <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />}
            


            {/* Document Content Sections */}
            <div className="space-y-8 font-sans">
              {activeDoc.sections.map((section) => (
                <section key={section.anchor} id={section.anchor} className="space-y-4">
                  <h2 className={`text-base sm:text-lg font-bold font-mono uppercase pb-1 border-b tracking-tight ${
                    highContrast 
                      ? 'text-slate-900 border-slate-200' 
                      : 'text-white border-slate-800/60'
                  }`}>
                    {section.title}
                  </h2>
                  
                  {section.paragraphs.map((p, pIdx) => {
                    // Check for custom inline link keywords
                    let paragraphElement: React.ReactNode = p;
                    
                    // Render custom link insertions inside policy texts for perfect SaaS cross-linking
                    if (p.includes('Privacy Policy') && activePage !== 'privacy-policy') {
                      paragraphElement = (
                        <span>
                          {p.split('Privacy Policy')[0]}
                          <button onClick={() => handleCrossLink('privacy-policy')} className="text-cyan-400 hover:underline font-bold bg-transparent border-none p-0 inline cursor-pointer">Privacy Policy</button>
                          {p.split('Privacy Policy')[1]}
                        </span>
                      );
                    } else if (p.includes('Cookie Policy') && activePage !== 'cookie-policy') {
                      paragraphElement = (
                        <span>
                          {p.split('Cookie Policy')[0]}
                          <button onClick={() => handleCrossLink('cookie-policy')} className="text-cyan-400 hover:underline font-bold bg-transparent border-none p-0 inline cursor-pointer">Cookie Policy</button>
                          {p.split('Cookie Policy')[1]}
                        </span>
                      );
                    } else if (p.includes('Refund Policy') && activePage !== 'refund-policy') {
                      paragraphElement = (
                        <span>
                          {p.split('Refund Policy')[0]}
                          <button onClick={() => handleCrossLink('refund-policy')} className="text-cyan-400 hover:underline font-bold bg-transparent border-none p-0 inline cursor-pointer">Refund Policy</button>
                          {p.split('Refund Policy')[1]}
                        </span>
                      );
                    } else if (p.includes('Terms & Conditions') && activePage !== 'terms-and-conditions') {
                      paragraphElement = (
                        <span>
                          {p.split('Terms & Conditions')[0]}
                          <button onClick={() => handleCrossLink('terms-and-conditions')} className="text-cyan-400 hover:underline font-bold bg-transparent border-none p-0 inline cursor-pointer">Terms & Conditions</button>
                          {p.split('Terms & Conditions')[1]}
                        </span>
                      );
                    } else if (p.includes('Security Policy') && activePage !== 'security-policy') {
                      paragraphElement = (
                        <span>
                          {p.split('Security Policy')[0]}
                          <button onClick={() => handleCrossLink('security-policy')} className="text-cyan-400 hover:underline font-bold bg-transparent border-none p-0 inline cursor-pointer">Security Policy</button>
                          {p.split('Security Policy')[1]}
                        </span>
                      );
                    } else if (p.includes('Data Request') && activePage !== 'data-request') {
                      paragraphElement = (
                        <span>
                          {p.split('Data Request')[0]}
                          <button onClick={() => handleCrossLink('data-request')} className="text-cyan-400 hover:underline font-bold bg-transparent border-none p-0 inline cursor-pointer">Data Request Desk</button>
                          {p.split('Data Request')[1]}
                        </span>
                      );
                    }

                    return (
                      <p 
                        key={pIdx} 
                        className={`text-xs sm:text-sm leading-relaxed ${
                          highContrast ? 'text-slate-700' : 'text-slate-300'
                        }`}
                      >
                        {paragraphElement}
                      </p>
                    );
                  })}

                  {/* Bullet points if present */}
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="list-disc pl-5 space-y-2.5">
                      {section.bullets.map((bullet, bIdx) => (
                        <li 
                          key={bIdx} 
                          className={`text-xs sm:text-sm leading-relaxed ${
                            highContrast ? 'text-slate-700' : 'text-slate-300'
                          }`}
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            {/* Document Signature Signoff */}
            <div className={`mt-12 pt-6 border-t font-mono text-[10px] sm:text-xs text-center flex flex-col sm:flex-row items-center justify-between gap-4 ${
              highContrast ? 'border-slate-200 text-slate-500' : 'border-slate-800/60 text-slate-500'
            }`}>
              <span>DOC_ID: ALGOEDIT-{activePage.toUpperCase()}-2026-V3</span>
              <span>VERIFIED SECURE PLATFORM NODE</span>
            </div>
          </div>
          
          {/* Quick legal center return option */}
          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('legal-center')}
              className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-widest bg-slate-900/40 hover:bg-cyan-950/20 border border-slate-800/40 hover:border-cyan-500/20 px-5 py-2.5 rounded-xl cursor-pointer"
              id="reader-bottom-return-btn"
            >
              RETURN_TO_LEGAL_CENTER
            </button>
          </div>
        </div>

      </div>

      {/* Back to Top floating button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-3 rounded-full bg-slate-900/90 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 transition-all hover:-translate-y-1 shadow-lg z-50 cursor-pointer shadow-cyan-500/5 animate-fade-in"
          title="Back to Top"
          id="legal-back-to-top-btn"
        >
          <ArrowUp size={16} />
        </button>
      )}

    </div>
  );
};
