import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailsService {
  private transporter: nodemailer.Transporter;
  private fromEmail = `"FOMO Bilhetes" <${process.env.GMAIL_USER}>`;

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
        subject: '👋 Bem-vindo à FOMO!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #7c3aed;">Olá, ${userName}!</h2>
            <p>A tua conta de cliente foi criada com sucesso na plataforma <strong>FOMO</strong>.</p>
            <p>Já podes explorar e comprar bilhetes para os melhores eventos.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Equipa FOMO.</p>
          </div>
        `,
      });
      console.log(`Email de boas-vindas enviado para: ${toEmail}`);
    } catch (e) {
      console.error('Erro ao enviar email de boas-vindas:', e);
    }
  }

  async sendOrderConfirmation(toEmail: string, userName: string, orderId: number, total: number, quantity: number, eventName: string, qrCodeBuffers: Buffer[]) {
    try {
      // Criamos dinamicamente as tags <img> para cada QR Code que recebemos
      let qrCodesHtml = '';
      const attachments: any[] = [];
      
      qrCodeBuffers.forEach((buffer, index) => {
        const cidName = `qrcode_ticket_${index}`;
        
        qrCodesHtml += `
          <div style="display: inline-block; text-align: center; margin: 15px; padding: 10px; border: 1px dashed #7c3aed; border-radius: 8px;">
            <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold; color: #7c3aed;">BILHETE ${index + 1}</p>
            <img src="cid:${cidName}" alt="QR Code Bilhete ${index + 1}" style="width: 140px; height: 140px;" />
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
        subject: `🎫 Os teus ${quantity} bilhetes para ${eventName} estão aqui!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff;">
            <h2 style="color: #7c3aed; text-align: center;">Compra Confirmada! 🎉</h2>
            <p>Olá, <strong>${userName}</strong>!</p>
            <p>O teu pagamento para a encomenda <strong>#${orderId}</strong> foi processado. Aqui tens os teus acessos:</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Evento:</strong> ${eventName}</p>
              <p style="margin: 0;"><strong>Total Pago:</strong> ${total}€</p>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <p style="margin-bottom: 15px; color: #4b5563; font-size: 14px;"><strong>Cada bilhete tem o seu código único de entrada:</strong></p>
              ${qrCodesHtml}
            </div>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">Apresenta estes códigos à entrada. Boa diversão!</p>
          </div>
        `,
        attachments: attachments
      });
      console.log(`Email com ${qrCodeBuffers.length} QR Codes enviado para ${toEmail}`);
    } catch (e) {
      console.error('Erro ao enviar email de confirmação com múltiplos QR Codes:', e);
    }
  }

  async sendVendorStatusNotification(toEmail: string, userName: string, businessName: string, status: 'approved' | 'rejected') {
    const isApproved = status === 'approved';
    const subject = isApproved ? '🚀 Perfil de Vendor Aprovado! - FOMO' : '❌ Atualização sobre o teu Perfil de Vendor - FOMO';
    
    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: toEmail,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: ${isApproved ? '#10b981' : '#ef4444'};">Olá, ${userName}!</h2>
            <p>A equipa da FOMO reviu o pedido de registo da tua conta comercial <strong>${businessName}</strong>.</p>
            ${isApproved 
              ? `<p>Temos o prazer de informar que o teu perfil foi <strong>APROVADO</strong>! Já podes aceder ao teu dashboard e começar a criar eventos na nossa plataforma.</p>`
              : `<p>Infelizmente, o teu perfil comercial não cumpre os nossos requisitos atuais e foi <strong>REJEITADO</strong>. Se achas que isto foi um erro, contacta o nosso suporte.</p>`
            }
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Equipa de Administração FOMO.</p>
          </div>
        `,
      });
    } catch (e) { console.error('Erro ao enviar email de status de vendor:', e); }
  }

  async sendEventStatusNotification(toEmail: string, businessName: string, eventName: string, status: 'approved' | 'rejected') {
    const isApproved = status === 'approved';
    const subject = isApproved ? `✅ Evento Aprovado: ${eventName}` : `❌ Evento Recusado: ${eventName}`;
    
    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: toEmail,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: ${isApproved ? '#10b981' : '#ef4444'};">Olá, ${businessName}!</h2>
            <p>O teu evento submetido <strong>"${eventName}"</strong> foi analisado pela nossa equipa de moderação.</p>
            ${isApproved 
              ? `<p>O evento foi <strong>APROVADO</strong> e já se encontra listado publicamente para venda na app da FOMO!</p>`
              : `<p>O teu evento foi <strong>RECUSADO</strong> por não cumprir as diretrizes da plataforma. Verifica os detalhes na tua área de gestão.</p>`
            }
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Moderação de Eventos FOMO.</p>
          </div>
        `,
      });
    } catch (e) { console.error('Erro ao enviar email de status de evento:', e); }
  }

  async sendEditStatusNotification(toEmail: string, businessName: string, eventName: string, status: 'approved' | 'rejected') {
    const isApproved = status === 'approved';
    const subject = isApproved ? `✨ Alterações Aplicadas: ${eventName}` : `❌ Alterações Recusadas: ${eventName}`;
    
    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: toEmail,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: ${isApproved ? '#10b981' : '#ef4444'};">Olá, ${businessName}!</h2>
            <p>O teu pedido de modificação estrutural para o evento <strong>"${eventName}"</strong> foi revisto.</p>
            ${isApproved 
              ? `<p>As alterações de preço, capacidade, descrição ou imagem foram <strong>homologadas e aplicadas</strong> com sucesso.</p>`
              : `<p>O teu pedido de alteração foi <strong>rejeitado</strong> pela administração, mantendo-se a versão anterior do evento ativa na app.</p>`
            }
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Administração FOMO.</p>
          </div>
        `,
      });
    } catch (e) { console.error('Erro ao enviar email de status de edições:', e); }
  }
}