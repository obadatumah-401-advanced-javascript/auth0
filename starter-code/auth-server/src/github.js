'use strict';

const superagent = require('superagent');
const users = require('./users.js');

var jwt = require('express-jwt');
var jwks = require('jwks-rsa');
/*
  Resources
  https://developer.github.com/apps/building-oauth-apps/
*/

// const tokenServerUrl = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjhiQVdZWHhtaVRLbmJyNnZYS3dsRiJ9.eyJpc3MiOiJodHRwczovL2hldGxlci5ldS5hdXRoMC5jb20vIiwic3ViIjoiNEhRNlAwSk5IQXZnVzFFOE8zWWVYbkFEUFNMNkl4TnRAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vaGV0bGVyLmV1LmF1dGgwLmNvbS9hcGkvdjIvIiwiaWF0IjoxNTkxNjQzNDM5LCJleHAiOjE1OTE3Mjk4MzksImF6cCI6IjRIUTZQMEpOSEF2Z1cxRThPM1llWG5BRFBTTDZJeE50Iiwic2NvcGUiOiJyZWFkOmNsaWVudF9ncmFudHMgY3JlYXRlOmNsaWVudF9ncmFudHMgZGVsZXRlOmNsaWVudF9ncmFudHMgdXBkYXRlOmNsaWVudF9ncmFudHMgcmVhZDp1c2VycyB1cGRhdGU6dXNlcnMgZGVsZXRlOnVzZXJzIGNyZWF0ZTp1c2VycyByZWFkOnVzZXJzX2FwcF9tZXRhZGF0YSB1cGRhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGRlbGV0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgY3JlYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSByZWFkOnVzZXJfY3VzdG9tX2Jsb2NrcyBjcmVhdGU6dXNlcl9jdXN0b21fYmxvY2tzIGRlbGV0ZTp1c2VyX2N1c3RvbV9ibG9ja3MgY3JlYXRlOnVzZXJfdGlja2V0cyByZWFkOmNsaWVudHMgdXBkYXRlOmNsaWVudHMgZGVsZXRlOmNsaWVudHMgY3JlYXRlOmNsaWVudHMgcmVhZDpjbGllbnRfa2V5cyB1cGRhdGU6Y2xpZW50X2tleXMgZGVsZXRlOmNsaWVudF9rZXlzIGNyZWF0ZTpjbGllbnRfa2V5cyByZWFkOmNvbm5lY3Rpb25zIHVwZGF0ZTpjb25uZWN0aW9ucyBkZWxldGU6Y29ubmVjdGlvbnMgY3JlYXRlOmNvbm5lY3Rpb25zIHJlYWQ6cmVzb3VyY2Vfc2VydmVycyB1cGRhdGU6cmVzb3VyY2Vfc2VydmVycyBkZWxldGU6cmVzb3VyY2Vfc2VydmVycyBjcmVhdGU6cmVzb3VyY2Vfc2VydmVycyByZWFkOmRldmljZV9jcmVkZW50aWFscyB1cGRhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGRlbGV0ZTpkZXZpY2VfY3JlZGVudGlhbHMgY3JlYXRlOmRldmljZV9jcmVkZW50aWFscyByZWFkOnJ1bGVzIHVwZGF0ZTpydWxlcyBkZWxldGU6cnVsZXMgY3JlYXRlOnJ1bGVzIHJlYWQ6cnVsZXNfY29uZmlncyB1cGRhdGU6cnVsZXNfY29uZmlncyBkZWxldGU6cnVsZXNfY29uZmlncyByZWFkOmhvb2tzIHVwZGF0ZTpob29rcyBkZWxldGU6aG9va3MgY3JlYXRlOmhvb2tzIHJlYWQ6YWN0aW9ucyB1cGRhdGU6YWN0aW9ucyBkZWxldGU6YWN0aW9ucyBjcmVhdGU6YWN0aW9ucyByZWFkOmVtYWlsX3Byb3ZpZGVyIHVwZGF0ZTplbWFpbF9wcm92aWRlciBkZWxldGU6ZW1haWxfcHJvdmlkZXIgY3JlYXRlOmVtYWlsX3Byb3ZpZGVyIGJsYWNrbGlzdDp0b2tlbnMgcmVhZDpzdGF0cyByZWFkOnRlbmFudF9zZXR0aW5ncyB1cGRhdGU6dGVuYW50X3NldHRpbmdzIHJlYWQ6bG9ncyByZWFkOnNoaWVsZHMgY3JlYXRlOnNoaWVsZHMgdXBkYXRlOnNoaWVsZHMgZGVsZXRlOnNoaWVsZHMgcmVhZDphbm9tYWx5X2Jsb2NrcyBkZWxldGU6YW5vbWFseV9ibG9ja3MgdXBkYXRlOnRyaWdnZXJzIHJlYWQ6dHJpZ2dlcnMgcmVhZDpncmFudHMgZGVsZXRlOmdyYW50cyByZWFkOmd1YXJkaWFuX2ZhY3RvcnMgdXBkYXRlOmd1YXJkaWFuX2ZhY3RvcnMgcmVhZDpndWFyZGlhbl9lbnJvbGxtZW50cyBkZWxldGU6Z3VhcmRpYW5fZW5yb2xsbWVudHMgY3JlYXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRfdGlja2V0cyByZWFkOnVzZXJfaWRwX3Rva2VucyBjcmVhdGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiBkZWxldGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiByZWFkOmN1c3RvbV9kb21haW5zIGRlbGV0ZTpjdXN0b21fZG9tYWlucyBjcmVhdGU6Y3VzdG9tX2RvbWFpbnMgdXBkYXRlOmN1c3RvbV9kb21haW5zIHJlYWQ6ZW1haWxfdGVtcGxhdGVzIGNyZWF0ZTplbWFpbF90ZW1wbGF0ZXMgdXBkYXRlOmVtYWlsX3RlbXBsYXRlcyByZWFkOm1mYV9wb2xpY2llcyB1cGRhdGU6bWZhX3BvbGljaWVzIHJlYWQ6cm9sZXMgY3JlYXRlOnJvbGVzIGRlbGV0ZTpyb2xlcyB1cGRhdGU6cm9sZXMgcmVhZDpwcm9tcHRzIHVwZGF0ZTpwcm9tcHRzIHJlYWQ6YnJhbmRpbmcgdXBkYXRlOmJyYW5kaW5nIGRlbGV0ZTpicmFuZGluZyByZWFkOmxvZ19zdHJlYW1zIGNyZWF0ZTpsb2dfc3RyZWFtcyBkZWxldGU6bG9nX3N0cmVhbXMgdXBkYXRlOmxvZ19zdHJlYW1zIGNyZWF0ZTpzaWduaW5nX2tleXMgcmVhZDpzaWduaW5nX2tleXMgdXBkYXRlOnNpZ25pbmdfa2V5cyByZWFkOmxpbWl0cyB1cGRhdGU6bGltaXRzIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.JX5aOXFpfGnWafLePX82cCa-6s4fzTGCO-z2RrbLxLs4yR7oCXp1VtIbFQKss3jxaphL3V17fKG4nk6GtdAQ72YQnCJ49vA0LhvY4AN7mP7MMfrphizDfF5TIpszJJr5arJRXq583l1is1Fdn-q3p_Kl7JlX3Pf2o8qzrRxRQwFpPPSlPOqg5B90De_R2XRjBxhCM0KG1YHPXw1_GquUTvdRW51EUGPrB6zXE4OXMRCxl9ZPnp23DgH88fps_QdY7nyWuUN-FGraKpn4zzZurmJpDy1R-U7-2oIfsz3exzIog1vpsDl333DZrxX2wbGH9OhAhYuwqRWDOqX4etkxdw";
// // const remoteAPI = process.env.REMOTE_API;
// const CLIENT_ID = "EbBNYaenm96LM1bYprxy6q4INKIbvLhh";
// const CLIENT_SECRET = "e8avN3-QhpFdUH9vU71a9dpkob9vEdzio0BGQPxqCby1lxdBc6s8VBv_0_v37cVA";
// const API_SERVER = "https://hetler.eu.auth0.com/oauth/token";

// module.exports = async function authorize(req, res, next) {

//   try {
//     let code = req.query.code;
//     console.log('(1) CODE:', code);

//     let remoteToken = await exchangeCodeForToken(code);
//     console.log('(2) ACCESS TOKEN:', remoteToken)

//     let remoteUser = await getRemoteUserInfo(remoteToken);
//     console.log('(3) GITHUB USER', remoteUser)

//     let [user, token] = await getUser(remoteUser);
//     req.user = user;
//     req.token = token;
//     console.log('(4) LOCAL USER', user);

//     next();
//   } catch (e) { next(`ERROR: ${e.message}`) }

// }

// async function exchangeCodeForToken(code) {

//   let tokenResponse = await superagent.post(tokenServerUrl).send({
//     code: code,
//     client_id: CLIENT_ID,
//     client_secret: CLIENT_SECRET,
//     redirect_uri: API_SERVER,
//     grant_type: 'authorization_code',
//   })

//   let access_token = tokenResponse.body.access_token;

//   return access_token;

// }

// async function getRemoteUserInfo(token) {

//   let userResponse =
//     await superagent.get(remoteAPI)
//       .set('user-agent', 'express-app')
//       .set('Authorization', `token ${token}`)

//   let user = userResponse.body;

//   return user;

// }

// async function getUser(remoteUser) {
//   let userRecord = {
//     username: remoteUser.login,
//     password: 'oauthpassword'
//   }

//   let user = await users.save(userRecord);
//   let token = users.generateToken(user);

//   return [user, token];

// }
var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://hetler.eu.auth0.com/.well-known/jwks.json'
}),
audience: 'http://localhost:3030/auth0',
issuer: 'https://hetler.eu.auth0.com/',
algorithms: ['RS256']
});

module.exports = jwtCheck;