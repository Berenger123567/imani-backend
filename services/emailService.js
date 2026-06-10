import sgMail from '@sendgrid/mail'

const FROM_EMAIL = 'imanignammankou@gmail.com'
const FROM_NAME = 'Imani Travel'

function initSendGrid() {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY is missing')
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function sendNewOrderNotification(order) {
  console.log('Sending new order notification via SendGrid...')

  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not configured, skipping email')
    return
  }

  try {
    const adminUrl = process.env.CLIENT_URL
      ? `${process.env.CLIENT_URL}/admin/orders/${order._id}`
      : `http://localhost:5173/admin/orders/${order._id}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin:0; padding:0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #e84393, #fd79a8); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; font-size: 28px; font-weight: 600; margin-bottom: 8px; }
          .header p { color: rgba(255,255,255,0.9); font-size: 16px; }
          .content { padding: 40px 30px; }
          .badge { display: inline-block; background: #e84393; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; margin-bottom: 20px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 14px; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 15px; font-weight: 600; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .info-item { background: #f8f9fa; padding: 15px; border-radius: 10px; }
          .info-label { font-size: 12px; color: #999; margin-bottom: 5px; }
          .info-value { font-size: 15px; color: #333; font-weight: 500; }
          .activities { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
          .activity-tag { background: #fff0f5; color: #e84393; padding: 6px 12px; border-radius: 15px; font-size: 13px; }
          .message-box { background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #e84393; margin-top: 20px; }
          .cta-section { text-align: center; padding: 30px; background: #f8f9fa; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #e84393, #fd79a8); color: white; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(232, 67, 147, 0.4); transition: transform 0.3s; }
          .cta-button:hover { transform: translateY(-2px); }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 13px; border-top: 1px solid #eee; }
          .footer a { color: #e84393; text-decoration: none; }
          @media (max-width: 600px) {
            .info-grid { grid-template-columns: 1fr; }
            .content { padding: 30px 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nouvelle demande</h1>
            <p>Un voyageur attend sa réponse !</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <span class="badge">NOUVEAU</span>
            </div>
            <div class="section">
              <div class="section-title">Informations client</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Nom</div>
                  <div class="info-value">${escapeHtml(order.name)}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value"><a href="mailto:${order.email}" style="color: #e84393;">${order.email}</a></div>
                </div>
                ${order.phone ? `
                <div class="info-item">
                  <div class="info-label">Téléphone</div>
                  <div class="info-value"><a href="tel:${order.phone}" style="color: #e84393;">${escapeHtml(order.phone)}</a></div>
                </div>
                ` : ''}
              </div>
            </div>
            <div class="section">
              <div class="section-title">Détails du voyage</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Destination</div>
                  <div class="info-value">${escapeHtml(order.destination)}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Budget</div>
                  <div class="info-value">${escapeHtml(order.budget || 'Non spécifié')}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Durée</div>
                  <div class="info-value">${escapeHtml(order.duration || 'Non spécifiée')}</div>
                </div>
                ${order.composition ? `
                <div class="info-item">
                  <div class="info-label">Composition</div>
                  <div class="info-value">${escapeHtml(order.composition)}</div>
                </div>
                ` : ''}
                ${order.climate ? `
                <div class="info-item">
                  <div class="info-label">Climat souhaité</div>
                  <div class="info-value">${escapeHtml(order.climate)}</div>
                </div>
                ` : ''}
                ${order.accommodation ? `
                <div class="info-item">
                  <div class="info-label">Hébergement</div>
                  <div class="info-value">${escapeHtml(order.accommodation)}</div>
                </div>
                ` : ''}
              </div>
            </div>
            ${order.activities && order.activities.length > 0 ? `
            <div class="section">
              <div class="section-title">Activités recherchées</div>
              <div class="activities">
                ${order.activities.map(activity => `<span class="activity-tag">${escapeHtml(activity)}</span>`).join('')}
              </div>
            </div>
            ` : ''}
            ${order.travel_style ? `
            <div class="section">
              <div class="section-title">Style de voyage</div>
              <p style="color: #555; line-height: 1.6;">${escapeHtml(order.travel_style)}</p>
            </div>
            ` : ''}
            ${order.feelings ? `
            <div class="section">
              <div class="section-title">Envies</div>
              <p style="color: #555; line-height: 1.6;">${escapeHtml(order.feelings)}</p>
            </div>
            ` : ''}
            ${order.message ? `
            <div class="message-box">
              <div class="section-title">Message du client</div>
              <p style="color: #555; line-height: 1.6; font-style: italic;">"${escapeHtml(order.message)}"</p>
            </div>
            ` : ''}
            <div class="cta-section">
              <a href="${adminUrl}" class="cta-button">Voir le détail de la commande</a>
              <p style="margin-top: 15px; color: #999; font-size: 13px;">
                Reçu le ${new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div class="footer">
            <p><strong>Imani Travel Planner</strong> - L'apogée du voyage sur mesure</p>
            <p style="margin-top: 5px;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Accéder au site</a> ·
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/orders">Toutes les commandes</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    initSendGrid()

    await sgMail.send({
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `Nouvelle demande de voyage - ${order.name}`,
      html: htmlContent,
    })

    console.log(`Email notification sent for order ${order._id}`)
  } catch (err) {
    console.error('Failed to send email notification:', err.message)
  }
}

export async function sendReplyToClient(order, replyMessage, pdfPath) {
  console.log('Sending reply email via SendGrid...')

  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not configured, skipping email')
    return
  }

  try {
    const apiUrl = process.env.API_URL || 'http://localhost:3001'
    const pdfDownloadUrl = pdfPath ? `${apiUrl}${pdfPath}` : null

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin:0; padding:0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #e84393, #fd79a8); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; font-size: 28px; font-weight: 600; margin-bottom: 8px; }
          .header p { color: rgba(255,255,255,0.9); font-size: 16px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
          .greeting strong { color: #e84393; }
          .message-box { background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #e84393; margin: 20px 0; }
          .message-box p { color: #555; line-height: 1.7; font-style: italic; font-size: 15px; }
          .pdf-section { text-align: center; padding: 25px; background: linear-gradient(135deg, #fff0f5, #fce4ec); border-radius: 12px; margin: 20px 0; }
          .pdf-section a { display: inline-block; background: #e84393; color: white; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 15px rgba(232, 67, 147, 0.3); }
          .pdf-section a:hover { transform: translateY(-2px); }
          .pdf-icon { font-size: 24px; margin-bottom: 10px; display: block; }
          .divider { height: 1px; background: #eee; margin: 25px 0; }
          .recap { background: #f8f9fa; padding: 20px; border-radius: 10px; }
          .recap h3 { font-size: 14px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
          .recap p { color: #555; margin: 5px 0; font-size: 14px; }
          .footer { text-align: center; padding: 25px; color: #999; font-size: 13px; border-top: 1px solid #eee; }
          .footer a { color: #e84393; text-decoration: none; }
          @media (max-width: 600px) {
            .content { padding: 30px 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Votre voyage sur mesure</h1>
            <p>${escapeHtml(order.name)}, nous avons une réponse pour vous !</p>
          </div>
          <div class="content">
            <p class="greeting">Bonjour <strong>${escapeHtml(order.name)}</strong>,</p>
            <p style="color: #555; line-height: 1.6;">
              ${replyMessage ? `Notre équipe Imani Travel vous a répondu :` : `Notre équipe Imani Travel a préparé votre carnet de voyage personnalisé.`}
            </p>
            ${replyMessage ? `
            <div class="message-box">
              <div class="section-title" style="font-size: 12px; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 10px; font-weight: 600;">Message de votre conseiller</div>
              <p>${escapeHtml(replyMessage)}</p>
            </div>
            ` : ''}
            ${pdfDownloadUrl ? `
            <div class="pdf-section">
              <span class="pdf-icon">PDF</span>
              <h3 style="color: #333; margin-bottom: 8px; font-size: 16px;">Votre carnet de voyage</h3>
              <p style="color: #666; margin-bottom: 15px; font-size: 14px;">Téléchargez votre carnet de voyage personnalisé ci-dessous :</p>
              <a href="${pdfDownloadUrl}">Télécharger le PDF</a>
            </div>
            ` : ''}
            <div class="divider"></div>
            <div class="recap">
              <h3>Récapitulatif de votre demande</h3>
              <p><strong>Destination :</strong> ${escapeHtml(order.destination)}</p>
              <p><strong>Budget :</strong> ${escapeHtml(order.budget || 'Non spécifié')}</p>
              <p><strong>Durée :</strong> ${escapeHtml(order.duration || 'Non spécifiée')}</p>
              ${order.date ? `<p><strong>Période :</strong> ${new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
            </div>
            <div style="text-align: center; margin-top: 25px;">
              <p style="color: #999; font-size: 13px;">
                Une question ? Répondez directement à cet email ou contactez-nous sur notre site.
              </p>
            </div>
          </div>
          <div class="footer">
            <p><strong>Imani Travel Planner</strong> - L'apogée du voyage sur mesure</p>
            <p style="margin-top: 5px;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Accéder au site</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    initSendGrid()

    await sgMail.send({
      to: order.email,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `Votre projet de voyage Imani - ${order.name}`,
      html: htmlContent,
    })

    console.log(`Reply email sent to ${order.email} for order ${order._id}`)
  } catch (err) {
    console.error('Failed to send reply email:', err.message)
  }
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
