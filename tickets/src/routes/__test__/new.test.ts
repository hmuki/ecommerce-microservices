import request from 'supertest';
import { app } from '../../app';
import jwt from 'jsonwebtoken';
import { Ticket } from '../../models/ticket';

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

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.statusCode).not.toEqual(404);
})

it('can only be accessed if the user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);
})

it('returns a status other than 401 if the user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookieSession)
        .send({});

    expect(response.statusCode).not.toEqual(401);
})

it('returns an error if an invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookieSession)
        .send({
            title: '',
            price: 10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookieSession)
        .send({
            price: 10
        })
        .expect(400);
})

it('returns an error if an invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookieSession)
        .send({
            title: '',
            price: -10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookieSession)
        .send({
            title: ''
        })
        .expect(400);
})

it('creates a ticket with valid inputs', async () => {
    // add in a check to make sure a ticket was saved
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = 'title'

    await request(app)
    .post('/api/tickets')
    .set('Cookie', cookieSession)
    .send({
        title,
        price: 20
    })
    .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(20);
    expect(tickets[0].title).toEqual(title);
})
