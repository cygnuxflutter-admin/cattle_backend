/**
 * authConstant.js
 * @description :: constants used in authentication
 */

const JWT = {
  DEVICE_SECRET: 'myjwtdevicesecret',
  ADMIN_SECRET: 'myjwtadminsecret',
  EXPIRES_IN: 10000
};

const MEDICAL_STATUS = {
  Running: "RUNNING",
  Completed: "COMPLETED",
  Stop: "STOP"
}

const MEDICAL_TYPES = {
  VACCINE: "VACCINE",
  HEAT: "HEAT",
  MEDICALCHECKUP: "MEDICALCHECKUP"
}

const PAYMENT_TYPE = {
  BANK_TRANSFER: 'Bank Transfer',
  CASH: 'Cash',
  CHEQUE: 'Cheque'
};

const EMPLOYEMENT_TYPE = {
  MILKING: 'Milking',
  CLEANING: 'Cleaning',
  FEEDING: 'Feeding',
  FARMING: 'Farming',
  DRIVER: 'Driver',
  FOOD_PARCEL: 'Food Parcel',
  MILKING_DELIVERY: 'Milking Delivery',
  DAIRY: 'Dairy',
  COOK: 'Cook',
  DEVELOPMENT: 'Development',
  SUPERVISOR: 'Supervisor',
  OTHER: 'Other'
}

const USER_TYPES = {
  User: 1,
  Admin: 2,
  guruji: 3,
  medical: 4,
  office: 5,
  dairy: 6,
  ground: 7
};

const RFO_TYPE = {
  EXPANSE: 1,
  PURCHASE: 2
}

const RFO_PAYMENT_TYPE = {
  ONLINE: 1,
  CARD_PAY: 2,
  CHEQUE: 3
}

/**
=>  guruji_user :	user1 =	guruji All access - Only read only  - only change gaushala nd dashboard	dashboard nd change gaushala
=>  secretary :	user2 =	guruji All access - Only read only - only change gaushala nd dashboard	dashboard nd change gaushala
=>  trusties : user3 = guruji All access - Only read only - only change gaushala nd dashboard	dashboard nd change gaushala
    	
=>  admin :	user2 =	Full Access - Read Write Delete	all screens web

=>  dairy :	user1 =	dairy and sales entry only, milk

=>  office : user2 = Open All screens - Read Write Delete
=>  office : user2 : Open All screens - Read Write Delete

=>  ground : user3 = Cow , Milk , shed count

=>  medicals : user4 = COW, add vac., shed count

----- add user names start from first letter of gaushala -----
 */

const GAUSHALA_EMP_CODE = {
  '01': 'SSG',
  '02': 'VSSG',
  '03': 'PSSG',
  '04': 'OSSG',
}

const PLATFORM = {
  DEVICE: 1,
  ADMIN: 2,
};

let LOGIN_ACCESS = {
  [USER_TYPES.User]: [PLATFORM.DEVICE],
  [USER_TYPES.Admin]: [PLATFORM.DEVICE],
  [USER_TYPES.guruji]: [PLATFORM.DEVICE],
  [USER_TYPES.medical]: [PLATFORM.DEVICE],
  [USER_TYPES.office]: [PLATFORM.DEVICE],
  [USER_TYPES.dairy]: [PLATFORM.DEVICE],
  [USER_TYPES.ground]: [PLATFORM.DEVICE],
};

const MAX_LOGIN_RETRY_LIMIT = 3;
const LOGIN_REACTIVE_TIME = 20;

const FORGOT_PASSWORD_WITH = {
  LINK: {
    email: true,
    sms: false
  },
  EXPIRE_TIME: 20
};

const REMINDER_ACTIONS = {
  MILK: 1,
  COW: 2,
  VACCINE: 3,
  STOCK: 4
}

module.exports = {
  REMINDER_ACTIONS,
  EMPLOYEMENT_TYPE,
  PAYMENT_TYPE,
  MEDICAL_TYPES,
  MEDICAL_STATUS,
  JWT,
  USER_TYPES,
  PLATFORM,
  MAX_LOGIN_RETRY_LIMIT,
  LOGIN_REACTIVE_TIME,
  FORGOT_PASSWORD_WITH,
  LOGIN_ACCESS,
  RFO_TYPE,
  RFO_PAYMENT_TYPE,
  GAUSHALA_EMP_CODE
};