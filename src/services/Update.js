const Accounts = require('../models/Customer')

module.exports = async (_id, obj) => {
    try{
        await Customer.update({ _id }, { $set: obj })

        return true
    } catch (err){
        return false
    }
}
