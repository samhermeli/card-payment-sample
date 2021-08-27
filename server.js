const express = require("express");
const https = require('https');
const fs = require('fs');
const app = express();
const mercadopago = require("mercadopago");

//REPLACE WITH YOUR ACCESS TOKEN AVAILABLE IN: https://www.mercadopago.com/developers/panel
mercadopago.configurations.setAccessToken("APP_USR-7196632628144272-060913-746bdbb20b7c5665b99fac119662f174-772856875");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("client/"));

payment_methods = mercadopago.get("/v1/payment_methods").then(response => console.log("Hola"))

var payment_data_2 = {
  transaction_amount: 100,
  description: 'Título del producto',
  payer: {
  email: 'test_user_75971242@testuser.com',
  entity_type: "individual"
  },
  transaction_details: {
  financial_institution: "1234"
  },
  additional_info: {
  ip_address: "127.0.0.1"
  },
  callback_url: "http://www.tu-sitio.com",
  payment_method_id: "redcompra"
  }

mercadopago.payment.create(payment_data_2).then(function (data) {
console.log(data);
}).catch(function (error) {
  console.log(error);
});


const options = {
	key: fs.readFileSync('localhost.key', 'utf8'),
   cert: fs.readFileSync('localhost.crt', 'utf8')
 };

app.get("/", function (req, res) {
  res.status(200).sendFile("/client/index.html");
}); 

app.post("/process_payment", (req, res) => {

  var payment_data = {
    transaction_amount: Number(req.body.transactionAmount),
    token: req.body.token,
    description: req.body.description,
    installments: Number(req.body.installments),
    payment_method_id: req.body.paymentMethodId,
    issuer_id: req.body.issuerId,
    payer: {
      email: req.body.payer.email,
      identification: {
        type: req.body.payer.identification.docType,
        number: req.body.payer.identification.docNumber
      }
    }
  };

  mercadopago.payment.save(payment_data)
    .then(function(response) {
      res.status(response.status).json({
        status: response.body.status,
        message: response.body.status_detail,
        id: response.body.id
      });
    })
    .catch(function(error) {
      res.status(error.status).send(error);
    });
});

/*app.listen(8080, () => {
  console.log("The server is now running on Port 8080");
});*/
https.createServer(options, app).listen(8080, () => {
	console.log("The server is now running on Port 8080");
})