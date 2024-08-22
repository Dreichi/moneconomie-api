const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/test", (req, res) => {
  res.send("Test de la route");
});

app.post("/api/contact", (req, res) => {
  const { email, reportData } = req.body;

  if (!email) {
    return res.status(400).send("Email est requis");
  }

  const {
    pack,
    modules,
    totalCost,
    realEconomy,
    selectedDeposit,
    selectedPaymentPlan,
  } = reportData;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const clientReportContent = `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #FF7F00; text-align: center;">Confirmation de votre demande de contact</h2>
    <p>Merci pour votre intérêt pour nos services. Voici un récapitulatif de votre demande :</p>

    <h3 style="color: #FF7F00;">Détails de votre site internet</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Pack sélectionné :</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${pack}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Modules sélectionnés :</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${modules.join(
          ", "
        )}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Coût total estimé :</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${totalCost} € HT</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Économie réelle avec options :</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${realEconomy} € HT</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Acompte choisi :</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${selectedDeposit}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Paiement échelonné en :</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${selectedPaymentPlan}</td>
      </tr>
    </table>

    <p style="margin-top: 20px;">Nous vous contacterons bientôt pour discuter des prochaines étapes. En attendant, si vous avez des questions, n'hésitez pas à nous contacter.</p>

    <p style="color: #FF7F00;">Cordialement,</p>
    <p>L'équipe d'Optesite</p>

    <div style="text-align: center; margin-top: 40px;">
      <a href="https://optesite.com" style="text-decoration: none; color: #fff; background-color: #FF7F00; padding: 10px 20px; border-radius: 5px;">Visitez notre site</a>
    </div>
  </div>
`;

  const ownerReportContent = `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #FF7F00; text-align: center;">Nouvelle demande de contact</h2>
    <p>Vous avez reçu une nouvelle demande de contact. Voici les détails :</p>

    <h3 style="color: #FF7F00;">Détails du client</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Pack :</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${pack}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Modules :</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${modules.join(
          ", "
        )}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Total estimé :</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${totalCost} € HT</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Économie :</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${realEconomy} € HT</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Acompte :</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${selectedDeposit}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Paiement :</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${selectedPaymentPlan}</td>
      </tr>
    </table>

    <p style="margin-top: 20px;">Contactez le client à l'adresse suivante : <a href="mailto:${email}" style="color: #FF7F00;">${email}</a></p>
  </div>
`;

  const mailOptionsClient = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirmation de demande de contact",
    html: clientReportContent,
  };

  const mailOptionsOwner = {
    from: process.env.EMAIL_USER,
    to: process.env.OWNER_EMAIL,
    subject: "Nouvelle demande de contact avec rapport",
    html: ownerReportContent,
  };

  transporter.sendMail(mailOptionsClient, (error, info) => {
    if (error) {
      return res
        .status(500)
        .send("Erreur lors de l'envoi de l'email au client");
    }

    transporter.sendMail(mailOptionsOwner, (error, info) => {
      if (error) {
        return res
          .status(500)
          .send("Erreur lors de l'envoi de l'email au gérant");
      }

      res.send("Email envoyé avec succès");
    });
  });
});

app.listen(3001, () => {
  console.log("Serveur Express lancé sur le port 3001");
});

module.exports = app;
