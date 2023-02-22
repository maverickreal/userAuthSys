class User{
	constructor({userId, firstName, lastName, age, email, phoneNumber, password}){
		this.userId = userId;
		this.firstName = firstName;
		this.lastName = lastName;
		this.age = age;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.password = password
	}
	getObj(){
		return {
			userId: this.userId, firstName: this.firstName, lastName: this.lastName,
			age: this.age, email: this.email, phoneNumber: this.phoneNumber,
			password:this.password
		}
	}
}

module.exports = User;