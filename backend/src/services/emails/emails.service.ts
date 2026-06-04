import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailsService {
  private transporter: nodemailer.Transporter;
  private fromEmail = `"FOMO Tickets" <${process.env.GMAIL_USER}>`;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  async sendWelcomeEmail(toEmail: string, userName: string) {
    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: toEmail,
        subject: '👋 Welcome to FOMO!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #7c3aed;">Hello, ${userName}!</h2>
            <p>Your customer account has been created successfully on the <strong>FOMO</strong> platform.</p>
            <p>You can now explore and purchase tickets for the best events.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">FOMO Team.</p>
          </div>
        `,
      });
      console.log(`Welcome email sent to: ${toEmail}`);
    } catch (e) {
      console.error('Error sending welcome email:', e);
    }
  }

  async sendOrderConfirmation(toEmail: string, userName: string, orderId: number, total: number, quantity: number, eventName: string, qrCodeBuffers: Buffer[]) {
    try {
      let qrCodesHtml = '';
      const attachments: any[] = [];
      
      qrCodeBuffers.forEach((buffer, index) => {
        const cidName = `qrcode_ticket_${index}`;
        
        qrCodesHtml += `
          <div style="display: inline-block; text-align: center; margin: 15px; padding: 10px; border: 1px dashed #7c3aed; border-radius: 8px;">
            <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold; color: #7c3aed;">TICKET ${index + 1}</p>
            <img src="cid:${cidName}" alt="QR Code Ticket ${index + 1}" style="width: 140px; height: 140px;" />
          </div>
        `;

        attachments.push({
          filename: `qrcode_${index}.png`,
          content: buffer,
          cid: cidName
        });
      });

      await this.transporter.sendMail({
        from: this.fromEmail,
        to: toEmail,
        subject: `🎫 Your ${quantity} tickets for ${eventName} are here!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
            <h2 style="color: #7c3aed; text-align: center;">Order Confirmed! 🎉</h2>
            <p>Hello, <strong>${userName}</strong>!</p>
            <p>Your payment for order <strong>#${orderId}</strong> has been processed. Here are your tickets:</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Event:</strong> ${eventName}</p>
              <p style="margin: 0;"><strong>Total Paid:</strong> ${total}€</p>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <p style="margin-bottom: 15px; color: #4b5563; font-size: 14px;"><strong>Each ticket has its unique entry code:</strong></p>
              ${qrCodesHtml}
            </div>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">Present these codes at the entrance. Have fun!</p>
          </div>
        `,
        attachments: attachments
      });
      console.log(`Email with ${qrCodeBuffers.length} QR Codes sent to ${toEmail}`);
    } catch (e) {
      console.error('Error sending email with multiple QR Codes:', e);
    }
  }

  async sendVendorStatusNotification(toEmail: string, userName: string, businessName: string, status: 'approved' | 'rejected') {
    const isApproved = status === 'approved';
    const subject = isApproved ? '🚀 Vendor Profile Approved! - FOMO' : '❌ Update on Your Vendor Profile - FOMO';

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: toEmail,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: ${isApproved ? '#10b981' : '#ef4444'};">Hello, ${userName}!</h2>
            <p>The FOMO team has reviewed your commercial account registration request <strong>${businessName}</strong>.</p>
            ${isApproved 
              ? `<p>We are pleased to inform you that your profile has been <strong>APPROVED</strong>! You can now access your dashboard and start creating events on our platform.</p>`
              : `<p>Unfortunately, your commercial profile does not meet our current requirements and has been <strong>REJECTED</strong>. If you believe this is an error, please contact our support team.</p>`
            }
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">FOMO Administration Team.</p>
          </div>
        `,
      });
    } catch (e) { console.error('Error sending vendor status email:', e); }
  }

  async sendEventStatusNotification(toEmail: string, businessName: string, eventName: string, status: 'approved' | 'rejected') {
    const isApproved = status === 'approved';
    const subject = isApproved ? `✅ Event Approved: ${eventName}` : `❌ Event Rejected: ${eventName}`;
    
    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: toEmail,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: ${isApproved ? '#10b981' : '#ef4444'};">Hello, ${businessName}!</h2>
            <p>Your event submission <strong>"${eventName}"</strong> has been reviewed by our moderation team.</p>
            ${isApproved 
              ? `<p>The event has been <strong>APPROVED</strong> and is now listed publicly for sale on the FOMO app!</p>`
              : `<p>Your event has been <strong>REJECTED</strong> for not meeting the platform's guidelines. Please check the details in your management area.</p>`
            }
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">FOMO Events Moderation.</p>
          </div>
        `,
      });
    } catch (e) { console.error('Error sending event status email:', e); }
  }

  async sendEditStatusNotification(toEmail: string, businessName: string, eventName: string, status: 'approved' | 'rejected') {
    const isApproved = status === 'approved';
    const subject = isApproved ? `✨ Changes Applied: ${eventName}` : `❌ Changes Rejected: ${eventName}`;
    
    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: toEmail,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: ${isApproved ? '#10b981' : '#ef4444'};">Hello, ${businessName}!</h2>
            <p>Your structural modification request for the event <strong>"${eventName}"</strong> has been reviewed.</p>
            ${isApproved 
              ? `<p>The changes to price, capacity, description, or image have been <strong>approved and applied</strong> successfully.</p>`
              : `<p>Your modification request has been <strong>rejected</strong> by the administration, keeping the previous version of the event active in the app.</p>`
            }
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">FOMO Administration.</p>
          </div>
        `,
      });
    } catch (e) { console.error('Error sending edit status email:', e); }
  }
}