const MongoClient = require('mongodb').MongoClient,
      crypto = new (require('../utility/crypt.js')),
      Hash = require('../utility/hash.js');

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

const verifyCredentials = async ({email}) => {
  let returnValue = false;
  try{
    const users = db.collection('users');
    const user = await users.findOne({ email: crypto.encrypt(email) });
    if (user) {
      returnValue = true;
    }
  }
  catch(error){
    returnValue = true;
    console.log(error);
  }
  return returnValue;
};

const userExists = async (email, password) => {
  let returnValue={error: 'user could not be found'};
  try {
    const users = db.collection('users');
    const user = await users.findOne( { email: crypto.encrypt(email) } );
    if (user && Hash.check(password, user.salt, user.password)){
        delete user._id, delete user.password, delete user.salt;
        returnValue = { user };
    }
  }
  catch (error) {
    returnValue = { error };
  }
  return returnValue;
};

const createUser = async user => {
  let returnValue = null;
  try {
    const users = db.collection('users');
    const hps = await Hash.hash(user.password);
    await users.insertOne({
      userId: user.userId, firstName: crypto.encrypt(user.firstName),
      lastName: crypto.encrypt(user.lastName), salt: hps.salt,
      email: crypto.encrypt(user.email), password: hps.password,
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

const updatePassword = async (userId, password) => {
  let returnValue = 'user not found';
  try{
    const users = db.collection('users');
    const salt = await db.findOne({userId}, {projection: { salt: 1 }});
    if(salt){
      const hps = await Hash.hash(password, salt);
      const result = await users.updateOne({ userId }, { $set: { password: hps.password } });
      if (result.matchedCount === 1){
        returnValue = null;
      }
    }
  }
  catch(error){
    returnValue = {error};
  }
  return returnValue;
}

const truncate = async () => {
  try{
    await db.collection('users').drop();
  }
  catch(error){
    console.log(error);
  }
}

module.exports={ init, verifyCredentials, userExists, createUser };