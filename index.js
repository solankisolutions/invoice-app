const express = require('express');
const { Client } = require('pg');
const { PDFDocument } = require('pdf-lib');
const XLSX = require('xlsx');
const app = express();

// PostgreSQL connection setup
const db = new Client({
   user: 'postgres',
   host: 'localhost',
   database: 'invoice_db',
   password: 'Adhiv@2017', // Add your PostgreSQL password here
   port: 5432,
});

db.connect();

app.use(express.json());

// Create invoice endpoint
app.post('/invoice', async (req, res) => {
   const { client_id, items } = req.body;
   const invoiceDate = new Date();
   let totalAmount = 0;
   items.forEach(item => totalAmount += item.price * item.quantity);

   const result = await db.query(
      'INSERT INTO Invoices (client_id, invoice_date, total_amount, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [client_id, invoiceDate, totalAmount, 'unpaid']
   );
   const invoiceId = result.rows[0].id;

   for (const item of items) {
      await db.query(
         'INSERT INTO Invoice_Items (invoice_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
         [invoiceId, item.product_id, item.quantity, item.price]
      );
   }
   res.json({ invoiceId });
});

// Run the server
app.listen(3000, () => {
   console.log('Server running on port 3000');
});
