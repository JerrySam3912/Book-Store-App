// VNPay utility functions
const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');

/**
 * Sort object by key (for VNPay checksum)
 */
function sortObject(obj) {
  const sorted = {};
  const str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

/**
 * Create VNPay payment URL
 * @param {Object} params - Payment parameters
 * @param {string} params.orderId - Order ID (vnp_TxnRef)
 * @param {number} params.amount - Amount in VND (will be multiplied by 100)
 * @param {string} params.orderInfo - Order description
 * @param {string} params.ipAddr - Client IP address
 * @param {string} params.returnUrl - Return URL after payment
 * @param {string} [params.bankCode] - Bank code (optional)
 * @param {string} [params.locale] - Language (vn/en, default: vn)
 * @returns {string} VNPay payment URL
 */
function createPaymentUrl(params) {
  const {
    orderId,
    amount,
    orderInfo,
    ipAddr,
    returnUrl,
    bankCode = null,
    locale = 'vn'
  } = params;

  // Get VNPay config from constants
  const { VNPAY } = require('./constants');
  const vnp_TmnCode = VNPAY.TMN_CODE;
  const vnp_HashSecret = VNPAY.HASH_SECRET;
  const vnp_Url = VNPAY.URL;

  process.env.TZ = 'Asia/Ho_Chi_Minh';
  const createDate = moment().format('YYYYMMDDHHmmss');
  const date = new Date();

  const vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = Math.round(amount * 100); // Convert to cents (VNPay requires amount in smallest currency unit)
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;

  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  // Sort params and create checksum
  const sortedParams = sortObject(vnp_Params);
  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  sortedParams['vnp_SecureHash'] = signed;

  // Create final URL
  const vnpUrl = vnp_Url + '?' + querystring.stringify(sortedParams, { encode: false });
  return vnpUrl;
}

/**
 * Verify VNPay return/callback checksum
 * @param {Object} vnp_Params - VNPay response parameters
 * @param {string} secureHash - vnp_SecureHash from VNPay
 * @returns {boolean} True if checksum is valid
 */
function verifyReturnUrl(vnp_Params, secureHash) {
  const { VNPAY } = require('./constants');
  const vnp_HashSecret = VNPAY.HASH_SECRET;

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const sortedParams = sortObject(vnp_Params);
  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return secureHash === signed;
}

module.exports = {
  createPaymentUrl,
  verifyReturnUrl,
  sortObject
};
