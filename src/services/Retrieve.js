const Accounts = require('../models/Customer')

module.exports = async (Username, Password) => {
    try{
        const results = await Customer.find()

        return results
    } catch (err){
        return []
    }
}