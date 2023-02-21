const MongoClient = require('mongodb').MongoClient,
      crypto = new (require('../utility/crypt.js')),
      {hash} = require('../utility/hash.js');

const uri = `mongodb://${process.env.DBHOST}:${process.env.DBPORT}/${process.env.DBNAME}`;

let client = new MongoClient(
  uri,
  { useNewUrlParser: true }
  ), db = null;

const init = async () => {
  try {
    await client.connect();
    db = client.db(process.env.DBNAME);
    if(process.env.TRUNCATE==='true'){
      await truncate();
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyCredentials = async ({email, password}) => {
  let returnValue = false;
  try {
    const users = db.collection('users');
    const user = await users.findOne({ $or: [ {
      email: crypto.encrypt(email),
      password: hash(password)
    } ] });
    if (user) {
      returnValue = true;
    }
  } catch (error) {
    console.log(error);
  }
  return returnValue;
};

const userExists = async ({email, password}) => {
  let returnValue={};
  try {
    const users = db.collection('users');
    const user = await users.findOne( {
      email: crypto.encrypt(email),
      password: hash(password)
    } );
    if (user) {
      delete user._id, delete user.password;
      returnValue = { user };
    } else {
      returnValue = { error: 'user could not be found' };
    }
  } catch (error) {
    returnValue = { error };
  }
  return returnValue;
};

const createUser = async ({userId, firstName, lastName, email, password, age, phoneNumber}) => {
  let returnValue = {};
  try {
    const users = db.collection('users');
    await users.insertOne({
      userId, firstName: crypto.encrypt(firstNname),
      lastName: crypto.encrypt(lastName),
      email: crypto.encrypt(email), password: hash(password),
      age, phoneNumber: crypto.encrypt(phoneNumber)
    });
    returnValue.user = { age, phoneNumber, firstName, lastName, email, userId };
  } catch (error) {
    returnValue = { error };
  }
  return returnValue;
};

const updateUser = async ({userId, firstName, lastName, age}) => {
  let returnValue = null;
  try {
    const users = db.collection('users');
    const result = await users.updateOne({userId}, { $set: {
      firstName: crypto.encrypt(firstName),
      lastName: crypto.encrypt(lastName), age
    } });
    if (result.matchedCount === 1) {
      returnValue.user = { age, firstName, lastName, userId };
    } else {
      returnValue = { error: 'user could not be found' };
    }
  } catch (error) {
    returnValue = { error };
  }
  return returnValue;
};


const truncate = async () => {
  try{
    await db.collection('users').drop();
  }
  catch(error){
    console.log(error);
  }
}

module.exports={ init, verifyCredentials, userExists, createUser };