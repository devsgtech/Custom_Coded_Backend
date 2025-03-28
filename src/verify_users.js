const db = require('./config/db');

const verifyUsers = () => {
  const query = 'SELECT admin_id, name, email, created_on, is_deleted FROM tbl_admin_users';
  
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching admin users:', error);
      return;
    }
    console.log('\nAdmin Users in the database:');
    console.log('===========================');
    results.forEach(user => {
      console.log(`ID: ${user.admin_id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Created on: ${user.created_on}`);
      console.log(`Is Deleted: ${user.is_deleted}`);
      console.log('---------------------------');
    });
  });
};

verifyUsers(); 