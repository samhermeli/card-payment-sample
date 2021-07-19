const express = require("express");
const https = require('https');
const app = express();
const mercadopago = require("mercadopago");

//REPLACE WITH YOUR ACCESS TOKEN AVAILABLE IN: https://www.mercadopago.com/developers/panel
mercadopago.configurations.setAccessToken("APP_USR-6255502893512254-070917-4a37a530e7d437b6ce717670b142202c-787997534");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("client/"));

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