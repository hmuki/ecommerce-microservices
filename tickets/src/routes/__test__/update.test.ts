import request from "supertest";
import { app } from "../../app";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

let cookieSession: any;

const getId = () => {
    return new mongoose.Types.ObjectId().toHexString();
}

beforeEach(async () => {
    process.env.JWT_KEY = "xyz";

    // Build a JWT payload: { id, email }
    const payload = {
        id: getId(),
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

it('returns a 404 if the provided id does not exist', async () => {
    const id = getId();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookieSession)
        .send({
            title: 'def',
            price: 20
        })
        .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    const id = getId();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'ghi',
            price: 20
        })
        .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookieSession)
        .send({
            title: 'jkl',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookieSession) // use a different cookie instead
        .send({
            title: 'mno',
            price: 100
        })
        .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookieSession)
        .send({
            title: 'jkl',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookieSession)
        .send({
            title: '',
            price: 100
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookieSession)
        .send({
            title: 'pqrs',
            price: -100
        })
        .expect(400);
});

it('updates the ticket provided if the user provides valid inputs', async () => {

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookieSession)
        .send({
            title: 'old title',
            price: 25
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookieSession)
        .send({
            title: 'new title',
            price: 50
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.tile).toEqual('new title');
    expect(ticketResponse.body.price).toEqual(50);
});

