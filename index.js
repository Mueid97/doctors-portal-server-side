const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
 const { MongoClient, ServerApiVersion } = require('mongodb');

//middle ware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.9zcwa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{

        await client.connect();
        const servicesCollection = client.db('doctors_portal_new').collection('services');
        const bookingCollection = client.db('doctors_portal_new').collection('bookings');


            app.get('/service', async(req,res)=>{
                const query ={};
                const cursor = servicesCollection.find(query);
                const services = await cursor.toArray();
                res.send(services)
            });
            // booking items form client
            app.post('/booking', async(req,res)=>{
                const booking = req.body;
                const query = {treatment: booking.treatment, date: booking.date, patiant: booking.patiant}
                const exist = await bookingCollection.findOne(query);
                if(exist){
                   return res.send({success: false, booking:exist})
                }
                const result = await bookingCollection.insertOne(booking);
                res.send({success:true, result});
            });

             
    }
    finally{

    }

}
run().catch(console.dir);

app.get('/',(req, res)=>{
    res.send('Hello server');
});

app.listen(port,(req,res)=>{
    console.log('port is listening', port)
});