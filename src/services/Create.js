const Accounts = require('../models/Customer')

module.exports = async (Username, Password) => {
    try{
        await Customer.insertMany({
            Username,
            Password
        })

        return true
    } catch (err){
        return false
    }
}
