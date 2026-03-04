import Mailgen from "mailgen";
import mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail=async(options)=>{
    const mailGenerator=new Mailgen({
        theme:"default",
        product:{
            name:"Task Manager",
            link:"https://taskmanagelink.com"
        }
    })



    const emailTextual=mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHTML=mailGenerator.generate(options.mailgenContent)
    

    const transporter=nodemailer.createTransport({
        host:process.env.MAILTRAP_SMTP_HOST,
        port:process.env.MAIL_TRAP_SMTP_PORT,
        auth:{

            user:process.env.MAILTRAP_SMTP_USER,
            pass:process.env.MAILTRAP_SMTP_PASS
        }
        
    })
    const mail={
        from:"mail.taskmanager@example.com",
        to:options.email,
        subject:options.subject,
        text:emailTextual,
        html:emailHTML,
    }
    try {
        await transporter.sendMail(mail)
        
    } catch (error) {
        
        console.error("email service failed");
        console.error("Error",error);
    }
}







const emailVerificationMailgenContent=(username,verificationUrl)=>{
    return{
        body:{
            name:username,
            intro:"welcoem on our app",
            action:{
                instructions:"to verify your email please click on button",
                button:{
                    color:"#207244",
                    text:"verify your email",
                    link:verificationURL,
                },

            },
            outro:"need help"
            
        },
    };
};

const forgotPasswordMailgenContent=(username,verificationUrl)=>{
    return{
        body:{
            name:username,
            intro:"we got a req to update your password",
            action:{
                instructions:"to reset your password please click on button",
                button:{
                    color:"#22bc66",
                    text:"reset",
                    link:passwordReseturl,
                },

            },
            outro:"need help"
            
        },
    };
};

export{
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,sendEmail
};