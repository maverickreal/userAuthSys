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
      console.log('Flushing data!');
      await truncate();
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyCredentials = async ({email, password}) => {
  let returnValue = false;
  try{
    const hp = await hash(password);
    const users = db.collection('users');
    const user = await users.findOne({ $or: [ {
      email: crypto.encrypt(email),
      password: hp
      } ] });
    if (user) {
      returnValue = true;
    }
  }
  catch(error){
    console.log(error);
  }
  return returnValue;
};

const userExists = async ({email, password}) => {
  let returnValue={};
  try {
    const users = db.collection('users');
    const hp = await hash(password);
    const user = await users.findOne( {
      email: crypto.encrypt(email),
      password: hp
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

const createUser = async user => {
  let returnValue = null;
  try {
    const users = db.collection('users');
    const hp = await hash(user.password);
    await users.insertOne({
      userId: user.userId, firstName: crypto.encrypt(user.firstName),
      lastName: crypto.encrypt(user.lastName),
      email: crypto.encrypt(user.email), password: hp,
      age: user.age, phoneNumber: crypto.encrypt(user.phoneNumber)
    });
  } catch (error) {
    console.log(error);
    returnValue = error;
  }
  return returnValue;
};

const updateUser = async user => {
  let returnValue = false;
  try {
    const setObj = {};
    for(const key of user){
      if(user[key]){
        setObj[key] = user[key];
      }
    }
    console.log(setObj);
    const users = db.collection('users');
    const result = await users.updateOne({userId: user.userId}, { $set: setObj });
    if (result.matchedCount !== 1){
      returnValue = true;
    }
  } catch (error) {
    returnValue = true;
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