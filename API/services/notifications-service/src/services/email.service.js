const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const { database, logger } = require('@getplot/shared');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    if (!config.email.user || !config.email.password) {
      logger.warn('Email configuration missing. Email sending disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });

    logger.info('Email transporter initialized');
  }

  /**
   * Send email
   */
  async sendEmail({ to, subject, html, text, attachments = [] }) {
    try {
      if (!this.transporter) {
        logger.warn('Email not sent - transporter not configured');
        return { success: false, message: 'Email service not configured' };
      }

      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        attachments: attachments.map(att => ({
          filename: att.filename,
          content: Buffer.from(att.content, 'base64'),
        })),
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Log to database
      await database.query(
        `INSERT INTO notifications.email_logs (to_email, subject, status, provider, sent_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [to, subject, 'sent', 'smtp']
      );

      logger.info('Email sent successfully', { to, subject, messageId: result.messageId });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error('Email sending failed:', error);

      // Log error to database
      await database.query(
        `INSERT INTO notifications.email_logs (to_email, subject, status, error_message)
         VALUES ($1, $2, $3, $4)`,
        [to, subject, 'failed', error.message]
      );

      throw error;
    }
  }

  /**
   * Send email with template
   */
  async sendTemplateEmail({ to, template, data, attachments = [] }) {
    try {
      // Get template from database
      const result = await database.query(
        'SELECT subject, content FROM notifications.templates WHERE name = $1 AND is_active = true',
        [template]
      );

      if (result.rows.length === 0) {
        throw new Error(`Template '${template}' not found`);
      }

      const { subject, content } = result.rows[0];

      // Render template
      const html = ejs.render(content, data);
      const renderedSubject = ejs.render(subject, data);

      return await this.sendEmail({
        to,
        subject: renderedSubject,
        html,
        attachments,
      });
    } catch (error) {
      logger.error('Template email error:', error);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to, firstName) {
    return await this.sendTemplateEmail({
      to,
      template: 'welcome',
      data: { firstName },
    });
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(to, verificationToken) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    return await this.sendTemplateEmail({
      to,
      template: 'email_verification',
      data: { verificationLink },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    return await this.sendTemplateEmail({
      to,
      template: 'password_reset',
      data: { resetLink },
    });
  }
}

module.exports = new EmailService();

