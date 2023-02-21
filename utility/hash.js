const bcrypt = require('bcrypt');

class Hash {
  static rounds = 10;

  static async hash(data) {
    return await bcrypt.hash(data, Hash.rounds);
  }

  static async check(newPassword, existingHash) {
    return await bcrypt.compare(newPassword, existingHash);
  }
}

module.exports = Hash;