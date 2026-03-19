const mysql = require('mysql');
const con = mysql.createConnection({
    host: 'ucka.veleri.hr',
    user:'amioc',
    password:'11', 
    database:'amioc'
});

/*con.connect((err)=>{
    if(err){
        console.log("connection not proper");
    }else{
        console.log("connected");
    }
});*/

module.exports = con;