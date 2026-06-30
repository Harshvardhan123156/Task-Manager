import {Resend} from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendWelcomeEmail = (email,name)=>{
    resend.emails.send({
        from:'onboarding@resend.dev',
        to:email,
        subject:'Welcome Onboard!',
        text:`Welcome ${name} on the app. Let us explore the app`
    })
}

export const sendCancelationEmail = (email,name)=>{
    resend.emails.send({
        from:'onboarding@resend.dev',
        to:email,
        subject:'Leaving the app',
        text:`Thanks for exploring our application ${name}. What could've kept you onboard!`
    })
}
