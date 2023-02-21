class User{
	constructor(id, fName, lName, Age, Email, phonenum, Password){
		this.userId = id;
		this.firstName = fName;
		this.lastName = lName;
		this.age = Age;
		this.email = Email;
		this.phoneNumber = phonenum;
		this.password = Password
	}
}

module.exports = User;