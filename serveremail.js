const http = require('http');
const nodemailer = require('nodemailer');

const server = http.createServer((req, res) => {
    // Configurar cabeçalhos CORS para permitir requisições
    res.setHeader('Access-Control-Allow-Origin', '*');
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
    
