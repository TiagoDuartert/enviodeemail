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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Responder a requisições OPTIONS (pre-flight)
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Rota de health check para Render (aceita GET)
    if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
        return;
    }

    // Endpoint de verificação do transporter (útil para debug de autenticação SMTP)
    if (req.method === 'GET' && req.url === '/test-verify') {
        if (!EMAIL_USER || !EMAIL_PASS) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'EMAIL_USER ou EMAIL_PASS não definidos' }));
            return;
        }

        const verifyTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 20000
        });

        verifyTransporter.verify((err, success) => {
            if (err) {
                console.error('test-verify: erro ao verificar transporter:', err && (err.stack || err));
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, message: 'Falha na verificação SMTP', error: err && (err.message || err) }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, message: 'Transporte SMTP verificado' }));
        });
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

    // Criar o transporter com timeouts para evitar bloqueios longos
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        port: 465,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        },
        // timeouts (ms)
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000
    });

    const message = {
        from: EMAIL_USER,
        to: EMAIL_RECIPIENT,
        subject: 'Fatura Disponível',
        text: 'Olá, a sua fatura já está disponível'
    };

    // Safety timeout: se sendMail demorar demais, responde ao cliente e tenta cancelar
    let finished = false;
    const safetyTimer = setTimeout(() => {
        if (finished) return;
        finished = true;
        console.error('Timeout: envio de email excedeu o tempo limite');
        try { res.writeHead(504); res.end('Gateway Timeout: envio de email demorou demais'); } catch (e) { /* ignore */ }
    }, 20000); // 20s

    transporter.sendMail(message, (error, info) => {
        if (finished) {
            // já respondemos por timeout
            console.warn('Resposta já enviada por timeout — ignorando callback de sendMail');
            return;
        }
        finished = true;
        clearTimeout(safetyTimer);

        if (error) {
            console.error('Erro ao enviar email:', error && (error.stack || error));
            // retornar detalhes mínimos ao cliente (não expor segredos)
            res.writeHead(500);
            res.end('Erro ao enviar email: ' + (error && error.message ? error.message : 'unknown'));
            return;
        }

        console.log('Email enviado com sucesso!', info && info.messageId);
        res.writeHead(200);
        res.end('Email enviado com sucesso!');
    });

});

    const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 
    
