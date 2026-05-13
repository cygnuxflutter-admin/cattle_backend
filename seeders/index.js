/**
 * seeder.js
 * @description :: functions that seeds mock data to run the application
 */

const bcrypt = require('bcryptjs');
const User = require('../model/user');
const authConstant = require('../constants/authConstant');
const Role = require('../model/role');
const ProjectRoute = require('../model/projectRoute');
const RouteRole = require('../model/routeRole');
const UserRole = require('../model/userRole');
const { replaceAll } = require('../utils/common');
const dbService = require('../utils/dbService');

/* seeds default users */
async function seedUser() {
  try {
    let userToBeInserted = {};
    userToBeInserted = {
      'password': 'fUVd5ssayqxFWhA',
      'isDeleted': false,
      'user_id': 'r4h6uy0llk',
      'userType': authConstant.USER_TYPES.User
    };
    userToBeInserted.password = await bcrypt.hash(userToBeInserted.password, 8);
    let user = await dbService.updateOne(User, { 'user_id': 'r4h6uy0llk' }, userToBeInserted, { upsert: true });
    userToBeInserted = {
      'password': '65o7EPEltTkqUjR',
      'isDeleted': false,
      'user_id': 'v3ddkj8etx',
      'userType': authConstant.USER_TYPES.Admin
    };
    userToBeInserted.password = await bcrypt.hash(userToBeInserted.password, 8);
    let admin = await dbService.updateOne(User, { 'user_id': 'v3ddkj8etx' }, userToBeInserted, { upsert: true });
    console.info('Users seeded 🍺');
  } catch (error) {
    console.log('User seeder failed due to ', error.message);
  }
}
/* seeds roles */
async function seedRole() {
  try {
    const roles = ['User', 'Admin', 'System_User'];
    const insertedRoles = await dbService.findMany(Role, { code: { '$in': roles.map(role => role.toUpperCase()) } });
    const rolesToInsert = [];
    roles.forEach(role => {
      if (!insertedRoles.find(insertedRole => insertedRole.code === role.toUpperCase())) {
        rolesToInsert.push({
          name: role,
          code: role.toUpperCase(),
          weight: 1
        });
      }
    });
    if (rolesToInsert.length) {
      const result = await dbService.create(Role, rolesToInsert);
      if (result) console.log('Role seeded 🍺');
      else console.log('Role seeder failed!');
    } else {
      console.log('Role is upto date 🍺');
    }
  } catch (error) {
    console.log('Role seeder failed due to ', error.message);
  }
}

/* seeds routes of project */
async function seedProjectRoutes(routes) {
  try {
    if (routes && routes.length) {
      let routeName = '';
      const dbRoutes = await dbService.findMany(ProjectRoute, {});
      let routeArr = [];
      let routeObj = {};
      routes.forEach(route => {
        routeName = `${replaceAll((route.path).toLowerCase(), '/', '_')}`;
        route.methods.forEach(method => {
          routeObj = dbRoutes.find(dbRoute => dbRoute.route_name === routeName && dbRoute.method === method);
          if (!routeObj) {
            routeArr.push({
              'uri': route.path.toLowerCase(),
              'method': method,
              'route_name': routeName,
            });
          }
        });
      });
      if (routeArr.length) {
        const result = await dbService.create(ProjectRoute, routeArr);
        if (result) console.info('ProjectRoute model seeded 🍺');
        else console.info('ProjectRoute seeder failed.');
      } else {
        console.info('ProjectRoute is upto date 🍺');
      }
    }
  } catch (error) {
    console.log('ProjectRoute seeder failed due to ', error.message);
  }
}

/* seeds role for routes */
async function seedRouteRole() {
  try {
    const routeRoles = [
      {
        route: '/admin/medicine/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/medicine/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/medicine/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/medicine/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/medicine/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/medicine/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/medicine/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/medicine/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/medicine/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/medicine/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/medicine/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/medicine/deletemany',
        role: 'System_User',
        method: 'POST'
      }, {
        route: '/device/api/v1/medicine/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/medicine/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/medicine/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/medicine/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/medicine/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/medicine/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/medicine/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/medicine/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/medicine/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/medicine/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/medicine/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/medicine/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/cow/create',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/cow/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/cow/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/cow/addbulk',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/cow/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/cow/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/cow/list',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/cow/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/cow/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/cow/:id',
        role: 'User',
        method: 'GET'
      },
      {
        route: '/admin/cow/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/admin/cow/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/cow/count',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/cow/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/cow/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/cow/update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/cow/update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/cow/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/cow/partial-update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/cow/partial-update/:id',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/cow/partial-update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/cow/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/cow/updatebulk',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/cow/updatebulk',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/cow/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/cow/softdelete/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/cow/softdelete/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/cow/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/cow/softdeletemany',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/cow/softdeletemany',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/cow/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/cow/delete/:id',
        role: 'User',
        method: 'DELETE'
      },
      {
        route: '/admin/cow/delete/:id',
        role: 'Admin',
        method: 'DELETE'
      },
      {
        route: '/admin/cow/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/cow/deletemany',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/cow/deletemany',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/cow/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk/create',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/milk/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/milk/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk/addbulk',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/milk/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/milk/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk/list',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/milk/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/milk/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk/:id',
        role: 'User',
        method: 'GET'
      },
      {
        route: '/admin/milk/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/admin/milk/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/milk/count',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/milk/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/milk/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk/update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/milk/update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/milk/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk/partial-update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/milk/partial-update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/milk/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk/updatebulk',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/milk/updatebulk',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/milk/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk/softdelete/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/milk/softdelete/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/milk/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk/softdeletemany',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/milk/softdeletemany',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/milk/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk/delete/:id',
        role: 'User',
        method: 'DELETE'
      },
      {
        route: '/admin/milk/delete/:id',
        role: 'Admin',
        method: 'DELETE'
      },
      {
        route: '/admin/milk/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/milk/deletemany',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/milk/deletemany',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/milk/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/shedtransferhistory/create',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/shedtransferhistory/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/shedtransferhistory/addbulk',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/shedtransferhistory/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/shedtransferhistory/list',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/shedtransferhistory/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/shedtransferhistory/:id',
        role: 'User',
        method: 'GET'
      },
      {
        route: '/admin/shedtransferhistory/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/shedtransferhistory/count',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/shedtransferhistory/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/shedtransferhistory/update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/shedtransferhistory/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/shedtransferhistory/partial-update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/shedtransferhistory/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/shedtransferhistory/updatebulk',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/shedtransferhistory/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/shedtransferhistory/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/shedtransferhistory/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/shedtransferhistory/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/shedtransferhistory/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/user/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/user/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/user/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/user/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/user/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/user/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/user/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/admin/user/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/user/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/user/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/user/update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/user/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/user/partial-update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/user/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/user/updatebulk',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/user/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/user/softdelete/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/user/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/user/softdeletemany',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/user/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/user/delete/:id',
        role: 'Admin',
        method: 'DELETE'
      },
      {
        route: '/admin/user/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/user/deletemany',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/user/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/shed/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/shed/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/shed/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/shed/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/shed/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/shed/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/shed/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/shed/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/shed/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/shed/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/shed/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/shed/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/usertokens/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/usertokens/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/usertokens/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/usertokens/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/usertokens/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/usertokens/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/usertokens/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/usertokens/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/usertokens/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/usertokens/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/usertokens/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/usertokens/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/role/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/role/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/role/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/role/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/role/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/role/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/role/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/role/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/role/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/role/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/role/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/role/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/projectroute/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/projectroute/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/projectroute/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/projectroute/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/projectroute/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/projectroute/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/projectroute/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/projectroute/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/projectroute/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/projectroute/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/projectroute/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/projectroute/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/routerole/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/routerole/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/routerole/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/routerole/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/routerole/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/routerole/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/routerole/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/routerole/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/routerole/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/routerole/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/routerole/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/routerole/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/userrole/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/userrole/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/userrole/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/userrole/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/userrole/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/userrole/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/userrole/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/userrole/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/userrole/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/userrole/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/userrole/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/userrole/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/partial-update/:id',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/create',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/addbulk',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/list',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/:id',
        role: 'User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/cow/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/device/api/v1/cow/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/cow/count',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/partial-update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/partial-update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/updatebulk',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/updatebulk',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/softdelete/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/softdelete/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/softdeletemany',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/softdeletemany',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cow/delete/:id',
        role: 'User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/cow/delete/:id',
        role: 'Admin',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/cow/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/cow/deletemany',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/deletemany',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cow/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/create',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/addbulk',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/list',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/:id',
        role: 'User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/milk/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/device/api/v1/milk/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/milk/count',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/partial-update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/partial-update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/updatebulk',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/updatebulk',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/softdelete/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/softdelete/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/softdeletemany',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/softdeletemany',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk/delete/:id',
        role: 'User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/milk/delete/:id',
        role: 'Admin',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/milk/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/milk/deletemany',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/deletemany',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shedtransferhistory/create',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shedtransferhistory/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shedtransferhistory/addbulk',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shedtransferhistory/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shedtransferhistory/list',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shedtransferhistory/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shedtransferhistory/:id',
        role: 'User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/shedtransferhistory/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/shedtransferhistory/count',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shedtransferhistory/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shedtransferhistory/update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/shedtransferhistory/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/shedtransferhistory/partial-update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/shedtransferhistory/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/shedtransferhistory/updatebulk',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/shedtransferhistory/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/shedtransferhistory/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/shedtransferhistory/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/shedtransferhistory/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/shedtransferhistory/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/user/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/user/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/user/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/user/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/user/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/user/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/user/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/device/api/v1/user/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/user/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/user/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/user/update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/user/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/user/partial-update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/user/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/user/updatebulk',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/user/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/user/softdelete/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/user/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/user/softdeletemany',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/user/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/user/delete/:id',
        role: 'Admin',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/user/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/user/deletemany',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/user/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shed/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shed/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shed/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shed/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/shed/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/shed/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/shed/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/shed/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/shed/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/shed/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/shed/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/shed/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/usertokens/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/usertokens/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/usertokens/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/usertokens/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/usertokens/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/usertokens/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/usertokens/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/usertokens/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/usertokens/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/usertokens/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/usertokens/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/usertokens/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/role/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/role/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/role/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/role/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/role/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/role/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/role/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/role/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/role/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/role/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/role/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/role/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/projectroute/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/projectroute/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/projectroute/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/projectroute/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/projectroute/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/projectroute/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/projectroute/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/projectroute/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/projectroute/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/projectroute/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/projectroute/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/projectroute/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/routerole/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/routerole/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/routerole/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/routerole/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/routerole/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/routerole/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/routerole/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/routerole/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/routerole/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/routerole/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/routerole/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/routerole/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/userrole/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/userrole/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/userrole/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/userrole/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/userrole/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/userrole/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/userrole/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/userrole/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/userrole/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/userrole/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/userrole/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/userrole/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk_usage/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk_usage/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk_usage/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk_usage/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/milk_usage/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk_usage/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk_usage/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk_usage/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk_usage/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk_usage/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk_usage/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/milk_usage/deletemany',
        role: 'System_User',
        method: 'POST'
      }, {
        route: '/device/api/v1/milk_usage/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk_usage/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk_usage/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk_usage/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/milk_usage/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk_usage/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk_usage/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk_usage/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk_usage/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk_usage/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk_usage/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/milk_usage/deletemany',
        role: 'System_User',
        method: 'POST'
      }, {
        route: '/device/api/v1/dairy_product/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/dairy_product/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/dairy_product/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/dairy_product/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/dairy_product/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/dairy_product/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/dairy_product/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/dairy_product/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/dairy_product/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/dairy_product/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/dairy_product/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/dairy_product/deletemany',
        role: 'System_User',
        method: 'POST'
      }, {
        route: '/admin/dairy_product/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/dairy_product/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/dairy_product/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/dairy_product/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/dairy_product/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/dairy_product/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/dairy_product/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/dairy_product/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/dairy_product/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/dairy_product/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/dairy_product/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/dairy_product/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/stock/create',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/stock/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/stock/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/stock/addbulk',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/stock/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/stock/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/stock/list',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/stock/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/stock/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/stock/:id',
        role: 'User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/stock/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/device/api/v1/stock/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/stock/count',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/stock/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/stock/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/stock/update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/stock/update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/stock/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/stock/partial-update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/stock/partial-update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/stock/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/stock/updatebulk',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/stock/updatebulk',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/stock/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/stock/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/stock/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/stock/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/stock/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/api_logs/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/api_logs/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/api_logs/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/api_logs/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/api_logs/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/api_logs/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/api_logs/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/admin/api_logs/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/api_logs/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/api_logs/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/api_logs/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/api_logs/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/api_logs/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/api_logs/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/api_logs/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/api_logs/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/api_logs/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/api_logs/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/api_logs/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/api_logs/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/api_logs/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/api_logs/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/api_logs/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/api_logs/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/device/api/v1/api_logs/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/api_logs/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/api_logs/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/api_logs/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/api_logs/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/api_logs/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/api_logs/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/api_logs/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/api_logs/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/api_logs/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/dairymetrics/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/dairymetrics/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/dairymetrics/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/dairymetrics/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/dairymetrics/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/dairymetrics/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/dairymetrics/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/dairymetrics/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/dairymetrics/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/dairymetrics/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/dairymetrics/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/dairymetrics/deletemany',
        role: 'System_User',
        method: 'POST'
      }, {
        route: '/device/api/v1/dairymetrics/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/dairymetrics/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/dairymetrics/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/dairymetrics/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/dairymetrics/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/dairymetrics/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/dairymetrics/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/dairymetrics/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/dairymetrics/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/dairymetrics/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/dairymetrics/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/dairymetrics/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_transaction/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/sales_transaction/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_transaction/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/sales_transaction/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_transaction/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/sales_transaction/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_transaction/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/admin/sales_transaction/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/sales_transaction/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/sales_transaction/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_transaction/update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/sales_transaction/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_transaction/partial-update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/sales_transaction/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_transaction/updatebulk',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/sales_transaction/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_transaction/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_transaction/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_transaction/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/sales_transaction/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_transaction/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_transaction/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_transaction/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_transaction/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_transaction/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_transaction/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_transaction/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/device/api/v1/sales_transaction/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/sales_transaction/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_transaction/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_transaction/update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_transaction/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_transaction/partial-update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_transaction/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_transaction/updatebulk',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_transaction/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_transaction/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_transaction/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_transaction/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/sales_transaction/deletemany',
        role: 'System_User',
        method: 'POST'
      }, {
        route: '/admin/vendor/create',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/vendor/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/vendor/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/vendor/addbulk',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/vendor/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/vendor/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/vendor/list',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/vendor/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/vendor/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/vendor/:id',
        role: 'User',
        method: 'GET'
      },
      {
        route: '/admin/vendor/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/admin/vendor/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/vendor/count',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/vendor/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/vendor/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/vendor/update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/vendor/update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/vendor/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/vendor/partial-update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/vendor/partial-update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/vendor/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/vendor/updatebulk',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/vendor/updatebulk',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/vendor/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/vendor/softdelete/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/vendor/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/vendor/softdeletemany',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/vendor/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/vendor/delete/:id',
        role: 'User',
        method: 'DELETE'
      },
      {
        route: '/admin/vendor/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/vendor/deletemany',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/vendor/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      ,
      {
        route: '/device/api/v1/vendor/create',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/vendor/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/vendor/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/vendor/addbulk',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/vendor/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/vendor/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/vendor/list',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/vendor/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/vendor/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/vendor/:id',
        role: 'User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/vendor/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/device/api/v1/vendor/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/vendor/count',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/vendor/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/vendor/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/vendor/update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/vendor/update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/vendor/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/vendor/partial-update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/vendor/partial-update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/vendor/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/vendor/updatebulk',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/vendor/updatebulk',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/vendor/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/vendor/softdelete/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/vendor/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/vendor/softdeletemany',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/vendor/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/vendor/delete/:id',
        role: 'User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/vendor/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/vendor/deletemany',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/vendor/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk_history/create',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/milk_history/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk_history/addbulk',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/milk_history/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk_history/list',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/milk_history/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk_history/:id',
        role: 'Admin',
        method: 'GET'
      },
      {
        route: '/admin/milk_history/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/milk_history/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/admin/milk_history/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/milk_history/update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/milk_history/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk_history/partial-update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/milk_history/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk_history/updatebulk',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/admin/milk_history/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk_history/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk_history/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/milk_history/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/milk_history/deletemany',
        role: 'System_User',
        method: 'POST'
      }, ,
      {
        route: '/device/api/v1/milk_history/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/milk_history/count',
        role: 'Admin',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk_history/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/milk_history/update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk_history/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk_history/partial-update/:id',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk_history/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk_history/updatebulk',
        role: 'Admin',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk_history/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk_history/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk_history/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/milk_history/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/milk_history/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/emp_joining/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/emp_joining/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/emp_joining/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/emp_joining/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/emp_joining/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/emp_joining/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/emp_joining/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/emp_joining/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/emp_joining/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/emp_joining/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/emp_joining/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/emp_joining/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/emp_joining/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/emp_joining/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/emp_joining/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/emp_joining/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/emp_joining/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/emp_joining/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/emp_joining/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/emp_joining/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/emp_joining/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/emp_joining/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/emp_joining/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/emp_joining/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/employee/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/employee/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/employee/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/employee/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/employee/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/employee/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/employee/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/employee/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/employee/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/employee/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/employee/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/employee/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/employee/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/employee/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/employee/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/employee/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/employee/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/employee/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/employee/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/employee/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/employee/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/employee/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/employee/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/employee/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/default_variable/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/default_variable/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/default_variable/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/default_variable/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/default_variable/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/default_variable/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/default_variable/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/default_variable/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/default_variable/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/default_variable/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/default_variable/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/default_variable/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/default_variable/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/default_variable/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/default_variable/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/default_variable/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/default_variable/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/default_variable/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/default_variable/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/default_variable/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/default_variable/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/default_variable/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/default_variable/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/default_variable/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/department/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/department/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/department/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/department/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/department/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/department/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/department/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/department/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/department/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/department/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/department/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/department/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/department/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/department/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/department/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/department/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/department/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/department/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/department/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/department/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/department/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/department/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/department/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/department/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_items/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_items/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_items/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_items/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/sales_items/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_items/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_items/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_items/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_items/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_items/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_items/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/sales_items/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_items/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_items/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_items/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_items/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/sales_items/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_items/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_items/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_items/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_items/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_items/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_items/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/sales_items/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/report/create',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/report/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/report/addbulk',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/report/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/report/list',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/report/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/report/:id',
        role: 'User',
        method: 'GET'
      },
      {
        route: '/admin/report/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/report/count',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/report/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/report/update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/report/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/report/partial-update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/report/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/report/updatebulk',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/report/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/report/softdelete/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/report/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/report/softdeletemany',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/report/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/report/delete/:id',
        role: 'User',
        method: 'DELETE'
      },
      {
        route: '/admin/report/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/report/deletemany',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/report/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/report/create',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/report/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/report/addbulk',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/report/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/report/list',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/report/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/report/:id',
        role: 'User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/report/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/report/count',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/report/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/report/update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/report/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/report/partial-update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/report/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/report/updatebulk',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/report/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/report/softdelete/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/report/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/report/softdeletemany',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/report/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/report/delete/:id',
        role: 'User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/report/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/report/deletemany',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/report/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/cms_bill/create',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/cms_bill/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/cms_bill/addbulk',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/cms_bill/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/cms_bill/list',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/cms_bill/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/cms_bill/:id',
        role: 'User',
        method: 'GET'
      },
      {
        route: '/admin/cms_bill/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/cms_bill/count',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/cms_bill/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/cms_bill/update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/cms_bill/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/cms_bill/partial-update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/cms_bill/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/cms_bill/updatebulk',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/cms_bill/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/cms_bill/softdelete/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/cms_bill/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/cms_bill/softdeletemany',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/admin/cms_bill/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/cms_bill/delete/:id',
        role: 'User',
        method: 'DELETE'
      },
      {
        route: '/admin/cms_bill/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/cms_bill/deletemany',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/admin/cms_bill/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cms_bill/create',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cms_bill/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cms_bill/addbulk',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cms_bill/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cms_bill/list',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cms_bill/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cms_bill/:id',
        role: 'User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/cms_bill/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/cms_bill/count',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cms_bill/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cms_bill/update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cms_bill/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cms_bill/partial-update/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cms_bill/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cms_bill/updatebulk',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cms_bill/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cms_bill/softdelete/:id',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cms_bill/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cms_bill/softdeletemany',
        role: 'User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cms_bill/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/cms_bill/delete/:id',
        role: 'User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/cms_bill/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/cms_bill/deletemany',
        role: 'User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/cms_bill/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_report/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_report/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_report/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_report/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/sales_report/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/sales_report/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_report/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_report/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_report/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_report/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/sales_report/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/sales_report/deletemany',
        role: 'System_User',
        method: 'POST'
      }, {
        route: '/device/api/v1/sales_report/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_report/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_report/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_report/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/sales_report/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/sales_report/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_report/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_report/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_report/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_report/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/sales_report/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/sales_report/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/medical_log/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/medical_log/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/medical_log/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/medical_log/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/medical_log/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/medical_log/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/medical_log/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/medical_log/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/medical_log/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/medical_log/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/medical_log/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/medical_log/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/medical_log/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/medical_log/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/medical_log/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/medical_log/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/medical_log/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/medical_log/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/medical_log/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/medical_log/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/medical_log/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/medical_log/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/medical_log/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/medical_log/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/salary_transaction/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/salary_transaction/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/salary_transaction/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/salary_transaction/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/admin/salary_transaction/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/admin/salary_transaction/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/salary_transaction/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/salary_transaction/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/salary_transaction/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/salary_transaction/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/admin/salary_transaction/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/admin/salary_transaction/deletemany',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/salary_transaction/create',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/salary_transaction/addbulk',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/salary_transaction/list',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/salary_transaction/:id',
        role: 'System_User',
        method: 'GET'
      },
      {
        route: '/device/api/v1/salary_transaction/count',
        role: 'System_User',
        method: 'POST'
      },
      {
        route: '/device/api/v1/salary_transaction/update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/salary_transaction/partial-update/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/salary_transaction/updatebulk',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/salary_transaction/softdelete/:id',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/salary_transaction/softdeletemany',
        role: 'System_User',
        method: 'PUT'
      },
      {
        route: '/device/api/v1/salary_transaction/delete/:id',
        role: 'System_User',
        method: 'DELETE'
      },
      {
        route: '/device/api/v1/salary_transaction/deletemany',
        role: 'System_User',
        method: 'POST'
      },
    ];
    if (routeRoles && routeRoles.length) {
      const routes = [...new Set(routeRoles.map(routeRole => routeRole.route.toLowerCase()))];
      const routeMethods = [...new Set(routeRoles.map(routeRole => routeRole.method))];
      const roles = ['User', 'Admin', 'System_User'];
      const insertedProjectRoute = await dbService.findMany(ProjectRoute, {
        uri: { '$in': routes },
        method: { '$in': routeMethods },
        'isActive': true,
        'isDeleted': false
      });
      const insertedRoles = await dbService.findMany(Role, {
        code: { '$in': roles.map(role => role.toUpperCase()) },
        'isActive': true,
        'isDeleted': false
      });
      let projectRouteId = '';
      let roleId = '';
      let createRouteRoles = routeRoles.map(routeRole => {
        projectRouteId = insertedProjectRoute.find(pr => pr.uri === routeRole.route.toLowerCase() && pr.method === routeRole.method);
        roleId = insertedRoles.find(r => r.code === routeRole.role.toUpperCase());
        if (projectRouteId && roleId) {
          return {
            roleId: roleId.id,
            routeId: projectRouteId.id
          };
        }
      });
      createRouteRoles = createRouteRoles.filter(Boolean);
      const routeRolesToBeInserted = [];
      let routeRoleObj = {};

      await Promise.all(
        createRouteRoles.map(async routeRole => {
          routeRoleObj = await dbService.findOne(RouteRole, {
            routeId: routeRole.routeId,
            roleId: routeRole.roleId,
          });
          if (!routeRoleObj) {
            routeRolesToBeInserted.push({
              routeId: routeRole.routeId,
              roleId: routeRole.roleId,
            });
          }
        })
      );
      if (routeRolesToBeInserted.length) {
        const result = await dbService.create(RouteRole, routeRolesToBeInserted);
        if (result) console.log('RouteRole seeded 🍺');
        else console.log('RouteRole seeder failed!');
      } else {
        console.log('RouteRole is upto date 🍺');
      }
    }
  } catch (error) {
    console.log('RouteRole seeder failed due to ', error.message);
  }
}

/* seeds roles for users */
async function seedUserRole() {
  try {
    const userRoles = [{
      'user_id': 'r4h6uy0llk',
      'password': 'fUVd5ssayqxFWhA'
    }, {
      'user_id': 'v3ddkj8etx',
      'password': '65o7EPEltTkqUjR'
    }];
    const defaultRoles = await dbService.findMany(Role);
    const insertedUsers = await dbService.findMany(User, { username: { '$in': userRoles.map(userRole => userRole.username) } });
    let user = {};
    const userRolesArr = [];
    userRoles.map(userRole => {
      user = insertedUsers.find(user => user.username === userRole.username && user.isPasswordMatch(userRole.password) && !user.isDeleted);
      if (user) {
        if (user.userType === authConstant.USER_TYPES.Admin) {
          userRolesArr.push({
            userId: user.id,
            roleId: defaultRoles.find((d) => d.code === 'ADMIN')._id
          });
        } else if (user.userType === authConstant.USER_TYPES.User) {
          userRolesArr.push({
            userId: user.id,
            roleId: defaultRoles.find((d) => d.code === 'USER')._id
          });
        } else {
          userRolesArr.push({
            userId: user.id,
            roleId: defaultRoles.find((d) => d.code === 'SYSTEM_USER')._id
          });
        }
      }
    });
    let userRoleObj = {};
    const userRolesToBeInserted = [];
    if (userRolesArr.length) {
      await Promise.all(
        userRolesArr.map(async userRole => {
          userRoleObj = await dbService.findOne(UserRole, {
            userId: userRole.userId,
            roleId: userRole.roleId
          });
          if (!userRoleObj) {
            userRolesToBeInserted.push({
              userId: userRole.userId,
              roleId: userRole.roleId
            });
          }
        })
      );
      if (userRolesToBeInserted.length) {
        const result = await dbService.create(UserRole, userRolesToBeInserted);
        if (result) console.log('UserRole seeded 🍺');
        else console.log('UserRole seeder failed');
      } else {
        console.log('UserRole is upto date 🍺');
      }
    }
  } catch (error) {
    console.log('UserRole seeder failed due to ', error.message);
  }
}

/* seeds series data*/
async function seedSequence() {
  try {
    let allSequenceData = [

      {
        attribute: 'sleep_number',
        prefix: 'G01',
        startingPoint: '1000',
        modelName: 'sales_transaction'
      }
    ];
    let dbSequences = await dbService.findMany(Sequence, {});

    const newSequences = [];
    let idsToBeRemoved = [];
    let existInAllSequenceData = {};
    let existSeq = {};

    dbSequences.forEach(function (dbSeqData) {
      existInAllSequenceData = allSequenceData.find(sequence => sequence.modelName === dbSeqData.modelName && sequence.attribute === dbSeqData.attribute);

      if (!existInAllSequenceData) {
        idsToBeRemoved.push(dbSeqData.id);
      }
    });

    if (idsToBeRemoved && idsToBeRemoved.length > 0) {
      await dbService.deleteMany(Sequence, { '_id': { '$in': idsToBeRemoved } });
    }

    dbSequences = await dbService.findMany(Sequence, {});

    allSequenceData.forEach(function (seqData) {
      existSeq = dbSequences.find(dbSequence => dbSequence.modelName === seqData.modelName && dbSequence.attribute === seqData.attribute);

      if (!existSeq) {
        newSequences.push(seqData);
      } else {
        dbService.updateOne(Sequence, { _id: existSeq.id }, {
          prefix: seqData.prefix,
          suffix: seqData.suffix,
          startingPoint: seqData.startingPoint
        }, { new: true });
      }
    });

    if (newSequences && newSequences.length > 0) {
      await dbService.create(Sequence, newSequences);
    }
    console.log('series seeded successfully');
  } catch (error) {
    console.log('series seeder failed due to ', error.message);
  }
}

async function seedData(allRegisterRoutes) {
  await seedUser();
  await seedRole();
  await seedProjectRoutes(allRegisterRoutes);
  await seedRouteRole();
  await seedUserRole();
  await seedSequence();
};
module.exports = seedData;