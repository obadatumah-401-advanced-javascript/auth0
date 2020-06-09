'use strict';

const superagent = require('superagent');
const users = require('./users.js');

/*
  Resources
  https://developer.github.com/apps/building-oauth-apps/
*/

// const tokenServerUrl = process.env.TOKEN_SERVER;
const remoteAPI = 'https://dev-rp3c39cs.eu.auth0.com/userinfo';
const CLIENT_ID = 'EbBNYaenm96LM1bYprxy6q4INKIbvLhh';
const CLIENT_SECRET = 'e8avN3-QhpFdUH9vU71a9dpkob9vEdzio0BGQPxqCby1lxdBc6s8VBv_0_v37cVA';
const API_SERVER = 'http://localhost:3030/auth0';

module.exports = async function authorize(req, res, next) {

  try {
    let code = req.query.code;
    console.log('(1) CODE:', code);

    let remoteToken = await exchangeCodeForToken(code);
    console.log('(2) ACCESS TOKEN:', remoteToken)

    let remoteUser = await getRemoteUserInfo(remoteToken);
    console.log('(3) GITHUB USER', remoteUser)

    let [user, token] = await getUser(remoteUser);
    req.user = user;
    req.token = token;
    console.log('(4) LOCAL USER', user);

    next();
  } catch (e) { next(`ERROR: ${e.message}`) }

}

async function exchangeCodeForToken(code) {
  // console.log(CLIENT_ID);
  // console.log(CLIENT_SECRET);

 

  let tokenResponse = await superagent.post('https://dev-rp3c39cs.eu.auth0.com/oauth/token').send({
    code: code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: 'http://localhost:3030/auth0',
    grant_type: 'authorization_code',
  }).catch(e=>console.log(e.message));

  
  
  console.log(tokenResponse);

  let access_token = tokenResponse.body.access_token;

  return access_token;

}

async function getRemoteUserInfo(token) {
  // console.log(token);
  let userResponse =
    await superagent.get('https://dev-rp3c39cs.eu.auth0.com/userinfo')
      .set('user-agent', 'express-app')
      .set('Authorization', `Bearer ${token}`)
      let user = userResponse.body;
      // console.log('user res',user);

  return user;

}

async function getUser(remoteUser) {
  let userRecord = {
    username: remoteUser.login,
    password: 'oauthpassword'
  }

  let user = await users.save(userRecord);
  let token = users.generateToken(user);

  return [user, token];

}