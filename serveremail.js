const http = require('http');
const nodemailer = require('nodemailer');

const server = http.createServer((req, res) => {
    // Configurar cabeçalhos CORS para permitir requisições
    res.setHeader('Access-Control-Allow-Origin', 'https://enviodeemail.onrender.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    
    const auth = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        port: 465,
        auth: {
            user: "tiagoedduarte2007@gmail.com",
            pass: "paaqbrpcbbuzrqkf"
        }
    });

    const reciver = {
        from: "tiagoedduarte2007@gmail.com",
        to: "tiagoedduarte2007@gmail.com",
        subject: "Fatura Disponivel",
        text: "Ola a sua fatura ja está disponivel"
    };

    auth.sendMail(reciver, (error, emailRespose) => {
        if (error) {
            console.error("Erro ao enviar email:", error);
            res.writeHead(500);
            res.end("Erro ao enviar email");
            return;
        }
        console.log("Email enviado com sucesso!");
        res.writeHead(200);
        res.end("Email enviado com sucesso!");
     });

});

    const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 
    
