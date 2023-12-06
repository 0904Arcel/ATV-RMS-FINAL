const MongoClient = require('mongodb').MongoClient;

const uri = 'mongodb+srv://atvrms:atvrms@atvrms.nwojtse.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectAndQuery() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const database = client.db('ATVRMS');
        const collection = database.collection('Customer');

        // Example query to find a document with a specific username
        const query = { Username: 'example_username' };
        const user = await collection.findOne(query);

        if (user) {
            console.log('Found user:', user);
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    } finally {
        await client.close();
    }
}

connectAndQuery();
