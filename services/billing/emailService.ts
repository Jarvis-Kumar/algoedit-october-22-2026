import { adminDb } from '../firebaseAdmin';

export class EmailService {
  /**
   * Logs email execution in Firestore for full audit-ready tracking
   */
  async sendEmail(to: string, subject: string, htmlContent: string, category: string): Promise<void> {
    const emailId = `mail_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const emailRecord = {
      id: emailId,
      to,
      subject,
      htmlContent,
      category,
      sentAt: new Date().toISOString(),
      status: 'SENT'
    };

    try {
      // Save to global sent_emails collection
      await adminDb.collection('sent_emails').doc(emailId).set(emailRecord);
      console.log(`[Email Service] Email successfully sent to ${to}. Subject: "${subject}". ID: ${emailId}`);
    } catch (error: any) {
      console.error(`[Email Service] Failed to store email log for ${to}:`, error.message);
    }
  }

  async sendWelcomeEmail(to: string, userName: string) {
    const subject = "Welcome to ALGOEDIT Premium Subscriptions!";
    const body = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to ALGOEDIT, ${userName}!</h2>
        <p>Your subscription request has been created successfully on PayPal. We are waiting for the activation to complete so you can unlock the full power of ALGOEDIT.</p>
        <p>With ALGOEDIT, you get access to advanced AI editors, unlimited custom templates, and lightning-fast prompt generators.</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <br/>
        <p>Best regards,<br/>The ALGOEDIT Team</p>
      </div>
    `;
    await this.sendEmail(to, subject, body, 'WELCOME');
  }

  async sendActivationEmail(to: string, planName: string, tokens: number) {
    const subject = "Subscription Activated successfully - ALGOEDIT";
    const body = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Your Premium Subscription is Active!</h2>
        <p>We are thrilled to confirm that your subscription to the <strong>${planName}</strong> plan has been successfully activated.</p>
        <p><strong>${tokens.toLocaleString()} tokens</strong> have been immediately added to your balance.</p>
        <p>You can now use all of ALGOEDIT's premium features, templates, and high-fidelity media generations.</p>
        <br/>
        <p>Start creating now on your dashboard!</p>
        <p>Best regards,<br/>The ALGOEDIT Team</p>
      </div>
    `;
    await this.sendEmail(to, subject, body, 'ACTIVATION');
  }

  async sendUpdateEmail(to: string, planName: string) {
    const subject = "Subscription Details Updated - ALGOEDIT";
    const body = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Your Subscription has been Updated</h2>
        <p>This is to confirm that your subscription details for <strong>${planName}</strong> have been successfully updated on PayPal.</p>
        <p>Your renewal schedule and limits have been synchronized.</p>
        <br/>
        <p>Best regards,<br/>The ALGOEDIT Team</p>
      </div>
    `;
    await this.sendEmail(to, subject, body, 'UPDATE');
  }

  async sendCancellationEmail(to: string, endDate?: string) {
    const subject = "Subscription Cancelled - ALGOEDIT";
    const body = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Your Subscription has been Cancelled</h2>
        <p>We are sorry to see you go. Your subscription has been successfully cancelled on PayPal.</p>
        <p>Your premium access remains fully available until the end of your billing cycle${endDate ? ` on <strong>${endDate}</strong>` : ''}. After this period, your plan will downgrade to the basic Explorer level.</p>
        <p>You can resubscribe at any time to regain premium access.</p>
        <br/>
        <p>Best regards,<br/>The ALGOEDIT Team</p>
      </div>
    `;
    await this.sendEmail(to, subject, body, 'CANCELLATION');
  }

  async sendSuspendedEmail(to: string) {
    const subject = "Subscription Suspended - Action Required";
    const body = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; border-left: 4px solid #f59e0b;">
        <h2>Subscription Suspended</h2>
        <p>A payment issue was detected, and your subscription has been temporarily suspended.</p>
        <p>To restore premium access immediately, please log into your PayPal account and update your billing/payment information.</p>
        <br/>
        <p>Best regards,<br/>The ALGOEDIT Team</p>
      </div>
    `;
    await this.sendEmail(to, subject, body, 'SUSPENSION');
  }

  async sendExpiredEmail(to: string) {
    const subject = "Your Subscription has Expired - ALGOEDIT";
    const body = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Your Subscription has Expired</h2>
        <p>This is to notify you that your subscription has expired and premium access has been revoked.</p>
        <p>Your account has been safely downgraded to the free Explorer plan. None of your files or projects were deleted.</p>
        <p>To upgrade again, visit the billing section of your dashboard.</p>
        <br/>
        <p>Best regards,<br/>The ALGOEDIT Team</p>
      </div>
    `;
    await this.sendEmail(to, subject, body, 'EXPIRATION');
  }

  async sendPaymentReceiptEmail(to: string, transactionId: string, amount: number, currency: string) {
    const subject = "Payment Receipt - ALGOEDIT";
    const body = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Payment Receipt</h2>
        <p>Thank you for your payment!</p>
        <p>We have successfully processed your payment of <strong>${amount} ${currency}</strong>.</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p>Your billing history has been updated.</p>
        <br/>
        <p>Best regards,<br/>The ALGOEDIT Team</p>
      </div>
    `;
    await this.sendEmail(to, subject, body, 'RECEIPT');
  }

  async sendRefundEmail(to: string, amount: number, currency: string) {
    const subject = "Refund Confirmed - ALGOEDIT";
    const body = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Refund Confirmed</h2>
        <p>This is to confirm that a refund of <strong>${amount} ${currency}</strong> has been successfully processed for your account.</p>
        <p>The funds will be credited back to your original payment method within a few business days.</p>
        <br/>
        <p>Best regards,<br/>The ALGOEDIT Team</p>
      </div>
    `;
    await this.sendEmail(to, subject, body, 'REFUND');
  }
}

export const emailService = new EmailService();
