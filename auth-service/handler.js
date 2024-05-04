const jwt = require('jsonwebtoken');

exports.handler = async (event, context, callback) => {

  try {
    // Assuming the JWT is included in the request header
    if (!event.headers['authorization']) {
      return callback(null, generateDeny('user', event.methodArn));
    }

    const token = event.headers['authorization'];
    // const bearerToken = authHeader.split(' ');
    // const token = bearerToken[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Continue processing the request or return an Allow policy
    return callback(null, generateAllow(decoded.userId, event.methodArn));
  } catch (error) {
    // Handle token verification failure and return a Deny policy
    return callback(null, generateDeny('user', event.methodArn));
  }
};

// Help function to generate an IAM policy
const generatePolicy = (principalId, effect, resource) => {
  // Required output:
  const authResponse = {
    "isAuthorized": effect,
  };
  // Optional output with custom properties of the String, Number, or Boolean type.
  authResponse.context = {
    'stringKey': 'stringval',
    'numberKey': 123,
    'booleanKey': true,
  };

  return authResponse;

};

const generateAllow = (principalId, resource) => {
  return generatePolicy(principalId, true, resource);
};

const generateDeny = (principalId, resource) => {
  return generatePolicy(principalId, false, resource);
};
