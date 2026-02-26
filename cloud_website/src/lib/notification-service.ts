/**
 * Notification service for sending emails and alerts
 */

import { prisma } from '@/lib/db';

export interface TranscodeFailureNotification {
  mediaId: string;
  fileName: string;
  errorMessage: string;
  errorDetails?: any;
  timestamp: Date;
}

export class NotificationService {
  /**
   * Send transcode failure notification to instructor
   */
  async sendTranscodeFailureNotification(
    notification: TranscodeFailureNotification
  ): Promise<void> {
    const { mediaId, fileName, errorMessage, errorDetails, timestamp } = notification;

    try {
      // Get media and instructor information
      const media = await prisma.media.findUnique({
        where: { id: mediaId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!media || !media.user) {
        console.error('Cannot send notification: Media or user not found');
        return;
      }

      const instructor = media.user;

      // Prepare email content
      const subject = `Video Transcoding Failed: ${fileName}`;
      const htmlBody = this.generateTranscodeFailureEmail({
        instructorName: instructor.name || 'Instructor',
        fileName,
        errorMessage,
        errorDetails,
        timestamp,
        mediaId,
      });

      // Send email (implementation depends on email service)
      await this.sendEmail({
        to: instructor.email,
        subject,
        html: htmlBody,
      });

      console.log(`Transcode failure notification sent to ${instructor.email}`);
    } catch (error) {
      console.error('Failed to send transcode failure notification:', error);
      // Don't throw - notification failure shouldn't break the workflow
    }
  }

  /**
   * Generate HTML email for transcode failure
   */
  private generateTranscodeFailureEmail(params: {
    instructorName: string;
    fileName: string;
    errorMessage: string;
    errorDetails?: any;
    timestamp: Date;
    mediaId: string;
  }): string {
    const { instructorName, fileName, errorMessage, errorDetails, timestamp, mediaId } = params;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .footer { background-color: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
    .error-box { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
    .details { background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .label { font-weight: bold; color: #374151; }
    .value { color: #6b7280; }
    .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Video Transcoding Failed</h1>
    </div>
    
    <div class="content">
      <p>Hello ${instructorName},</p>
      
      <p>We encountered an error while processing your video upload. The transcoding process failed and your video is not yet available for playback.</p>
      
      <div class="details">
        <p><span class="label">File Name:</span> <span class="value">${fileName}</span></p>
        <p><span class="label">Media ID:</span> <span class="value">${mediaId}</span></p>
        <p><span class="label">Time:</span> <span class="value">${timestamp.toLocaleString()}</span></p>
      </div>
      
      <div class="error-box">
        <p><strong>Error Message:</strong></p>
        <p>${errorMessage}</p>
        ${errorDetails ? `<p style="margin-top: 10px;"><strong>Technical Details:</strong></p><pre style="font-size: 11px; overflow-x: auto;">${JSON.stringify(errorDetails, null, 2)}</pre>` : ''}
      </div>
      
      <p><strong>What to do next:</strong></p>
      <ul>
        <li>Check that your video file is in a supported format (MP4, MOV, AVI)</li>
        <li>Ensure the video is not corrupted</li>
        <li>Try uploading the video again</li>
        <li>If the problem persists, contact support with the Media ID above</li>
      </ul>
      
      <a href="${process.env.NEXTAUTH_URL || 'https://anywheredoor.com'}/admin/media" class="button">
        Go to Media Library
      </a>
    </div>
    
    <div class="footer">
      <p>This is an automated notification from AnyWhereDoor. Please do not reply to this email.</p>
      <p>If you need assistance, please contact support at support@anywheredoor.com</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send email (placeholder - integrate with actual email service)
   */
  private async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const { to, subject, html } = params;

    // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
    // For now, just log the email
    console.log('=== EMAIL NOTIFICATION ===');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('HTML Body:', html.substring(0, 200) + '...');
    console.log('========================');

    // Example integration with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    await sgMail.send({
      to,
      from: 'noreply@anywheredoor.com',
      subject,
      html,
    });
    */

    // Example integration with AWS SES:
    /*
    const AWS = require('aws-sdk');
    const ses = new AWS.SES({ region: 'us-east-1' });
    
    await ses.sendEmail({
      Source: 'noreply@anywheredoor.com',
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } },
      },
    }).promise();
    */
  }
}

// Singleton instance
let notificationServiceInstance: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
}
