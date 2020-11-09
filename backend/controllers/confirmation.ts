import Path from 'path'

import { RequestHandler } from 'express'
import ejs from 'ejs'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

import RegConfirmBody from '@/backend/models/RegConfirmBody'
import EmailSendedResponse from '../models/Mailer/EmailSendedResponse'

dotenv.config()

export const confirmRegistration: RequestHandler = async (req, res) => {
  const memberEmail = (req.body as RegConfirmBody).email
  const token = (req.body as RegConfirmBody).token

  const emailTemplate = await ejs.renderFile(
    Path.join(__dirname, '..', '/templates/confirmation.ejs'),
    {
      baseURL: process.env.BASE_URL || 'http://localhost:3000',
      token,
    }
  )

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_EMAIL,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: process.env.GMAIL_ACCESS_TOKEN,
    },
  })

  transporter
    .sendMail({
      from: process.env.MAILGUN_SENDER,
      to: memberEmail,
      subject: 'Konfirmasi Pendaftaran KoLU',
      html: emailTemplate,
    })
    .then(
      (infoSended: EmailSendedResponse) => {
        res.status(200).json({
          message:
            'Silahkan cek emailmu untuk melakukan konfirmasi pendaftaran. Jika tidak ada, mohon cek spam atau hubungi admin',
          moreInfo: infoSended,
        })
      },
      (infoRejected) => {
        // Sepertinya pengiriman email tidak mungkin gagal
        // karena gmail bakal selalu ngirim email walaupun email tujuan salah
        // Jadi kode ini tidak guna
        res.status(400).json({
          message:
            'Tidak dapat mengirim konfirmasi pendaftaran ke email anda! Harap cek kembali kebenaran email anda',
          moreInfo: infoRejected,
        })
      }
    )
    .catch((error) => {
      res.status(500).json({
        message: 'Terjadi kesalahan di sisi server!',
        moreInfo: error,
      })
    })
}