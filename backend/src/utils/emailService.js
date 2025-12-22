// src/utils/emailService.js
const db = require("../../db");
const logger = require("./logger");

/**
 * Send new book notification email to all active subscribers
 * In production, integrate with email service (nodemailer, SendGrid, etc.)
 */
async function sendNewBookNotification(book) {
  try {
    // Get all active subscribers
    const [subscribers] = await db.query(
      `SELECT s.email, s.name, u.name as userName, u.username
       FROM subscriptions s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.is_active = 1`
    );

    if (subscribers.length === 0) {
      logger.info("No active subscribers to notify");
      return { sent: 0, total: 0 };
    }

    logger.info(`Sending new book notification to ${subscribers.length} subscribers`);

    // In development, just log the emails
    // In production, send actual emails using nodemailer, SendGrid, etc.
    const emailPromises = subscribers.map(async (subscriber) => {
      const userName = subscriber.userName || subscriber.name || subscriber.username || "Valued Customer";
      
      const emailContent = generateNewBookEmail(userName, book);

      // TODO: Replace with actual email sending service
      // For now, just log it
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Email to: ${subscriber.email}`, {
          subject: emailContent.subject
        });
      }

      // In production, use:
      // await sendEmail(subscriber.email, emailContent.subject, emailContent.html);
    });

    await Promise.all(emailPromises);

    return { sent: subscribers.length, total: subscribers.length };
  } catch (err) {
    logger.error("Error sending new book notifications:", err);
    return { sent: 0, total: 0, error: err.message };
  }
}

/**
 * Generate email content for new book notification
 */
function generateNewBookEmail(userName, book) {
  const subject = `📚 New Book Release: ${book.title}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .book-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .book-image { width: 100%; max-width: 200px; border-radius: 8px; margin: 0 auto 20px; display: block; }
    .book-title { font-size: 24px; font-weight: bold; color: #333; margin: 10px 0; }
    .book-author { font-size: 18px; color: #666; margin-bottom: 15px; }
    .book-description { color: #555; margin: 15px 0; line-height: 1.8; }
    .price { font-size: 28px; font-weight: bold; color: #667eea; margin: 20px 0; }
    .old-price { text-decoration: line-through; color: #999; font-size: 20px; margin-right: 10px; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 Book Store</h1>
      <p>Your Favorite Online Bookstore</p>
    </div>
    <div class="content">
      <h2>Dear ${userName},</h2>
      
      <p>We are thrilled to announce that our bookstore has just released an exciting new book that we believe you'll love!</p>
      
      <p>As one of our valued subscribers, we wanted to make sure you're among the first to know about this latest addition to our collection.</p>
      
      <div class="book-card">
        ${book.coverImage ? `<img src="${book.coverImage}" alt="${book.title}" class="book-image" />` : ''}
        <div class="book-title">${book.title}</div>
        ${book.author ? `<div class="book-author">by ${book.author}</div>` : ''}
        ${book.description ? `<div class="book-description">${book.description.substring(0, 200)}${book.description.length > 200 ? '...' : ''}</div>` : ''}
        <div class="price">
          ${book.oldPrice ? `<span class="old-price">$${parseFloat(book.oldPrice).toFixed(2)}</span>` : ''}
          <span>$${parseFloat(book.newPrice || book.price || 0).toFixed(2)}</span>
        </div>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/books/${book._id || book.id}" class="cta-button">
          View Book Details
        </a>
      </div>
      
      <p>Don't miss out on this amazing read! Visit our website to explore more details, read reviews, and add it to your cart.</p>
      
      <p>Happy reading!<br>
      <strong>The Book Store Team</strong></p>
    </div>
    
    <div class="footer">
      <p>You received this email because you subscribed to our newsletter.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe?email=${encodeURIComponent('{{EMAIL}}')}" style="color: #667eea;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

module.exports = {
  sendNewBookNotification,
  generateNewBookEmail,
};

