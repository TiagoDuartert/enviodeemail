const http = require('http');
const nodemailer = require('nodemailer');

// Ler variáveis de ambiente
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_RECIPIENT = process.env.EMAIL_RECIPIENT || EMAIL_USER;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const server = http.createServer((req, res) => {
    // Configurar cabeçalhos CORS
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Responder a requisições OPTIONS (pre-flight)
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Ignora requisições de favicon
    if (req.url === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Verifica se é uma requisição POST
    if (req.method !== 'POST') {
        res.writeHead(405);
        res.end('Método não permitido. Use POST para enviar emails.');
        return;
    }

    // Verifica se as variáveis de ambiente estão configuradas
    if (!EMAIL_USER || !EMAIL_PASS) {
        console.error('Erro: EMAIL_USER e EMAIL_PASS são obrigatórios');
        res.writeHead(500);
        res.end('Erro de configuração do servidor');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        port: 465,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });

    const message = {
        from: EMAIL_USER,
        to: EMAIL_RECIPIENT,
        subject: "Fatura Disponível",
        text: "Olá, a sua fatura já está disponível"
    };

    transporter.sendMail(message, (error, info) => {
        if (error) {
            console.error("Erro ao enviar email:", error);
            res.writeHead(500);
            res.end("Erro ao enviar email");
            return;
        }
        console.log("Email enviado com sucesso!", info.messageId);
        res.writeHead(200);
        res.end("Email enviado com sucesso!");
    });

});

    const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 
    
