const express = require("express");
const exphbs = require("express-handlebars");
const session = require('express-session')
const mercadopago = require("mercadopago");

//Este dato pre-configurado sirve para poder realizar un pago de prueba. 
//Cuando quieras realizar un pago real en producción, deberás reemplazarlo por el Access Token de tu cuenta disponible en https://www.mercadopago.cl/developers/panel
mercadopago.configurations.setAccessToken("APP_USR-7196632628144272-060913-746bdbb20b7c5665b99fac119662f174-772856875");

const app = express();

app.engine('handlebars', exphbs());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

app.use(express.urlencoded({ extended: true }));
app.use(session({ 
  secret: 'payment-session',
  resave: true,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  //Se configuran valores fijos para el email y monto del pago sólo para facilitar la resolución de este ejemplo.
  req.session.payerEmail = 'test_user_75971242@testuser.com';
  req.session.amount = 100;

  res.render('checkout', { 
    amount: req.session.amount,
    payerEmail: req.session.payerEmail,
  });
});

app.post("/process-payment", (req, res) => {
  const payment_data = {
    transaction_amount: req.session.amount,
    token: req.body.token,
    installments: Number(req.body.installments),
    payment_method_id: req.body.payment_method_id,
    issuer_id: req.body.issuer_id,
    payer: {
      email: req.session.payerEmail
    }
  };

  console.log(`Requesting payment creation with data: ${JSON.stringify(payment_data)}`);

  mercadopago.payment.save(payment_data)
  .then(result => {
    return res.render('response', { 
      title: 'Success', 
      response: JSON.stringify(result.body, null, 4) 
    });
  }).catch(err => {
    console.log(err);
    return res.render('response', { 
      title: 'Error', 
      response: err 
    });
  }).finally(() => {
    req.session.destroy();
  });
});

app.listen(8080, () => {
  console.log("The server is now running on Port 8080");
});
