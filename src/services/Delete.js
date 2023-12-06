const Accounts = require('../models/Customer')

module.exports = async (_id) => {
    try{
        await Customer.deleteOne({ _id })

        return true
    } catch (err){
        return false
    }
}