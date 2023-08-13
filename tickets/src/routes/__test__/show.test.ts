import request from "supertest"
import { app } from "../../app";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

let cookieSession: any;

beforeEach(async () => {
    process.env.JWT_KEY = "xyz";

    // Build a JWT payload: { id, email }
    const payload = {
        id: 'microservices',
        email: 'test@test.com'
    }
    // Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build the session object: {jwt, MY_JWT}
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return cookie;
    cookieSession = [`session=${base64}`];
});

it('returns a 404 if a ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .get(`/api/tickets/somefaketicketid/${id}`)
        .send()
        .expect(404);
});

it('returns the ticket if the ticket is found', async () => {

    const title = 'concert';
    const price = 20;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookieSession)
        .send({
            title, price
        })
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
}); 