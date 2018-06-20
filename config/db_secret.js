if(process.env.NODE_ENV === 'production'){
    module.exports = require('./db_secret_prod')
}else{
    module.exports = require('./db_secret_dev')
}