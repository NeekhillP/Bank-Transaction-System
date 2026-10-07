import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import accountRoutes from '../src/routes/account.routes.js';
import accountModel from '../src/models/account.model.js';
import userModel from '../src/models/user.model.js';

const ownerId = '507f1f77bcf86cd799439011';
const systemId = '507f1f77bcf86cd799439012';
const account = { _id: '507f1f77bcf86cd799439013', user: ownerId, status: 'ACTIVE', currency: 'NPR' };
const secret = 'account-route-regression-test-secret';
const ownerToken = jwt.sign({ userId: ownerId }, secret);
const systemToken = jwt.sign({ userId: systemId }, secret);
const previousSecret = process.env.JWT_SECRET;
const previousFindById = userModel.findById;
const previousFind = accountModel.find;
let server;
let url;

before(async () => {
    process.env.JWT_SECRET = secret;
    userModel.findById = async (id) => [ownerId, systemId].includes(id) ? { _id: id } : null;
    accountModel.find = async (filter) => {
        assert.deepEqual(Object.keys(filter), ['user']);
        return filter.user === ownerId ? [account] : [];
    };
    const app = express();
    app.use(cookieParser());
    app.use('/api/account', accountRoutes);
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
    });
    url = `http://127.0.0.1:${server.address().port}/api/account`;
});

after(async () => {
    userModel.findById = previousFindById;
    accountModel.find = previousFind;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
    if (server) await new Promise((resolve) => server.close(resolve));
});

test('GET returns the account belonging to the Bearer token user', async () => {
    const response = await fetch(url, { headers: { authorization: `Bearer ${ownerToken}` } });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).accounts, [account]);
});

test('an explicit Bearer token takes precedence over another user login cookie', async () => {
    const response = await fetch(url, { headers: {
        authorization: `Bearer ${ownerToken}`, cookie: `jwt_token=${systemToken}`,
    } });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).accounts, [account]);
});

test('GET still supports the login cookie without a Bearer token', async () => {
    const response = await fetch(url, { headers: { cookie: `jwt_token=${ownerToken}` } });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).accounts, [account]);
});

test('GET does not expose another user account', async () => {
    const response = await fetch(url, { headers: { authorization: `Bearer ${systemToken}` } });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).accounts, []);
});

test('GET requires authentication', async () => {
    const response = await fetch(url);
    assert.equal(response.status, 401);
});

test('an invalid explicit token is rejected even when the cookie is valid', async () => {
    const response = await fetch(url, { headers: {
        authorization: 'Bearer invalid', cookie: `jwt_token=${ownerToken}`,
    } });
    assert.equal(response.status, 401);
});
