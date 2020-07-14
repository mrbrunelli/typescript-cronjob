import * as dotenv from 'dotenv'
import * as nodemailer from 'nodemailer'

dotenv.config()

const user = process.env.GAZIN_EMAIL
const pass = process.env.GAZIN_SENHA

const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    auth: {
        user,
        pass
    }
})

export default transporter
