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


async function run() {
    try {

        await client.connect();
        const servicesCollection = client.db('doctors_portal_new').collection('services');
        const bookingCollection = client.db('doctors_portal_new').collection('bookings');


        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)
        });
        // booking items form client
        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const query = { treatment: booking.treatment, date: booking.date, patiant: booking.patiant }
            const exist = await bookingCollection.findOne(query);
            if (exist) {
                return res.send({ success: false, booking: exist })
            }
            const result = await bookingCollection.insertOne(booking);
            res.send({ success: true, result });
        });
        
        //not proper way
        app.get('/avaiable', async (req, res) => {
            const date = req.query.date;

            const services = await servicesCollection.find().toArray();
            const query = { date: date };
            const bookings = await bookingCollection.find(query).toArray();

            services.forEach(service => {
                const serviceBookings = bookings.filter(book => book.treatment === service.name);
                const bookedSlots = serviceBookings.map(book => book.slot);
                const avaiable = service.slots.filter(slot => !bookedSlots.includes(slot));
                service.slots = avaiable;
            });


            res.send(services);
        });


    }
    finally {

    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello server');
});

app.listen(port, (req, res) => {
    console.log('port is listening', port)
});