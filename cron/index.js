
let cron = require('node-cron');
const { fetchAppoinment } = require('./fetch');

exports.notification = ()=>{
      cron.schedule('* * * * *',()=>{
            fetchAppoinment()                  
      })
}