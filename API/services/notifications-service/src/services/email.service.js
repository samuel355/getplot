const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;
const { database, logger } = require('@getplot/shared');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templateDir = path.join(__dirname, '../../email-templates');
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
   * Render EJS template from file system
   */
  async renderTemplate(templateName, data) {
    try {
      const templatePath = path.join(this.templateDir, 'templates', `${templateName}.ejs`);
      const template = await fs.readFile(templatePath, 'utf8');

      // Add common data to all templates
      const templateData = {
        ...data,
        frontendUrl: process.env.FRONTEND_URL,
        email: data.to,
        currentYear: new Date().getFullYear(),
        appName: 'GetOnePlot',
      };

      return ejs.render(template, templateData);
    } catch (error) {
      throw new Error(`Failed to render template ${templateName}: ${error.message}`);
    }
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
        text: text || this.generateTextVersion(html),
        attachments: attachments.map((att) => ({
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
   * Generate text version from HTML (better than simple strip)
   */
  generateTextVersion(html) {
    // Remove style and script tags
    let text = html.replace(/<style[^>]*>.*?<\/style>/gs, '');
    text = text.replace(/<script[^>]*>.*?<\/script>/gs, '');

    // Replace common HTML elements with text equivalents
    text = text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<h[1-6][^>]*>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
      .replace(/<[^>]*>/g, '')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return text;
  }

  /**
   * Send email with template from file system
   */
  async sendTemplateEmail({ to, template, data, attachments = [] }) {
    try {
      const html = await this.renderTemplate(template, { to, ...data });

      // Extract subject from HTML title or use template name as fallback
      const subjectMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const subject = subjectMatch ? subjectMatch[1] : this.getDefaultSubject(template);

      return await this.sendEmail({
        to,
        subject,
        html,
        attachments,
      });
    } catch (error) {
      logger.error('Template email error:', error);
      throw error;
    }
  }

  /**
   * Get default subject based on template name
   */
  getDefaultSubject(templateName) {
    const subjectMap = {
      welcome: 'Welcome to GetOnePlot - Start Your Real Estate Journey!',
      'reset-password': 'Reset Your GetOnePlot Password',
      'verify-email': 'Verify Your GetOnePlot Email Address',
      'purchase-plot': 'Plot Purchase Confirmation - GetOnePlot',
      'reserve-plot': 'Plot Reservation Confirmation - GetOnePlot',
    };

    return subjectMap[templateName] || 'Notification from GetOnePlot';
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to, username) {
    return await this.sendTemplateEmail({
      to,
      template: 'welcome',
      data: { username },
    });
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(to, username, verificationToken) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    return await this.sendTemplateEmail({
      to,
      template: 'verify-email',
      data: {
        username,
        verificationLink,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to, fullname, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    return await this.sendTemplateEmail({
      to,
      template: 'reset-password',
      data: {
        fullname,
        resetLink,
      },
    });
  }

  /**
   * Send purchase confirmation email
   */
  async sendPurchaseConfirmation(to, username, plotData, transactionId, purchaseDate) {
    return await this.sendTemplateEmail({
      to,
      template: 'purchase-plot',
      data: {
        username,
        plot: plotData,
        transactionId,
        purchaseDate,
      },
    });
  }

  /**
   * Send reservation confirmation email
   */
  async sendReservationConfirmation(to, username, plotData, reservationId, validUntil) {
    return await this.sendTemplateEmail({
      to,
      template: 'reserve-plot',
      data: {
        username,
        plot: plotData,
        reservationId,
        validUntil,
      },
    });
  }

  /**
   * Backward compatibility - template from database (keep if needed)
   */
  async sendDatabaseTemplateEmail({ to, template, data, attachments = [] }) {
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
      logger.error('Database template email error:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails to multiple recipients
   */
  async sendBulkEmail({ recipients, subject, body, template, templateData, attachments = [] }) {
    try {
      // Validate recipients array
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        throw new Error('Recipients array must contain at least one email address');
      }

      // Validate each recipient email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = recipients.filter((email) => !emailRegex.test(email));

      if (invalidEmails.length > 0) {
        throw new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      }

      const results = {
        total: recipients.length,
        successful: 0,
        failed: 0,
        errors: [],
      };

      // Send emails sequentially to avoid overwhelming the SMTP server
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];

        try {
          if (template) {
            // Use template email
            await this.sendTemplateEmail({
              to: recipient,
              template,
              data: { ...templateData, to: recipient },
              attachments,
            });
          } else {
            // Use simple email with body
            await this.sendEmail({
              to: recipient,
              subject,
              html: body,
              attachments,
            });
          }
          results.successful++;

          // Small delay between emails to prevent rate limiting
          if (i < recipients.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            recipient,
            error: error.message,
          });

          logger.error(`Failed to send email to ${recipient}:`, error);

          // Continue with next recipient even if one fails
          continue;
        }
      }

      logger.info('Bulk email sending completed', {
        total: results.total,
        successful: results.successful,
        failed: results.failed,
      });

      return results;
    } catch (error) {
      logger.error('Bulk email sending failed:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails with concurrency control (optional advanced version)
   */
  async sendBulkEmailConcurrent({
    recipients,
    subject,
    body,
    template,
    templateData,
    attachments = [],
    batchSize = 5,
    delayBetweenBatches = 1000,
  }) {
    try {
      // Validate recipients array
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        throw new Error('Recipients array must contain at least one email address');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = recipients.filter((email) => !emailRegex.test(email));

      if (invalidEmails.length > 0) {
        throw new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      }

      const results = {
        total: recipients.length,
        successful: 0,
        failed: 0,
        errors: [],
      };

      // Process in batches to control concurrency
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);

        const batchPromises = batch.map(async (recipient) => {
          try {
            if (template) {
              await this.sendTemplateEmail({
                to: recipient,
                template,
                data: { ...templateData, to: recipient },
                attachments,
              });
            } else {
              await this.sendEmail({
                to: recipient,
                subject,
                html: body,
                attachments,
              });
            }
            results.successful++;
            return { recipient, success: true };
          } catch (error) {
            results.failed++;
            results.errors.push({
              recipient,
              error: error.message,
            });
            logger.error(`Failed to send email to ${recipient}:`, error);
            return { recipient, success: false, error: error.message };
          }
        });

        // Wait for current batch to complete
        await Promise.all(batchPromises);

        // Delay between batches if not the last batch
        if (i + batchSize < recipients.length) {
          await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
        }
      }

      logger.info('Bulk email sending completed', {
        total: results.total,
        successful: results.successful,
        failed: results.failed,
      });

      return results;
    } catch (error) {
      logger.error('Bulk email sending failed:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
