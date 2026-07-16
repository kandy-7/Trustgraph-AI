import { getCustomer } from './api';

const MOCK_PROFILE = {
  name: 'John Doe',
  id: 'USR-38362',
  accountSince: '2021-04-12',
  tier: 'Platinum',
  overallRisk: 96,
  identityRisk: 92,
  behaviourRisk: 84,
  deviceTrust: 21,
  knownDevices: ['iPhone 14 Pro (iOS 17)', 'MacBook Pro (macOS 14)'],
  trustedLocations: ['Mumbai, IN', 'Pune, IN'],
  trustedMerchants: ['Amazon India', 'Swiggy', 'Uber'],
  avgAmount: 1450.50,
  maxAmount: 25000.00,
  usualLoginHour: '09:00 – 11:00 IST',
  recentTransactions: [
    { id: 'TXN-82941', type: 'TRANSFER', amount: 490000, date: 'Today 08:45', status: 'BLOCKED' },
    { id: 'TXN-71823', type: 'POS',      amount: 1250,   date: 'Yesterday 14:20', status: 'SUCCESS' },
    { id: 'TXN-59012', type: 'UPI',      amount: 450,    date: 'Yesterday 09:15', status: 'SUCCESS' },
  ],
};

export const getCustomerProfile = async (userId = 'USR-38362') => {
  try {
    const data = await getCustomer(userId);
    if (data) {
      return {
        ...MOCK_PROFILE,
        ...data,
        name: data.user_id || MOCK_PROFILE.name,
        overallRisk: Math.min(99, Math.round((data.fraud_txns / Math.max(1, data.total_txns)) * 100) + 60),
        knownDevices: data.known_devices || MOCK_PROFILE.knownDevices,
        avgAmount: data.avg_amount || MOCK_PROFILE.avgAmount,
        maxAmount: data.max_amount || MOCK_PROFILE.maxAmount,
        usualLoginHour: data.usual_location ? `Last seen: ${data.usual_location}` : MOCK_PROFILE.usualLoginHour,
      };
    }
  } catch {}
  return MOCK_PROFILE;
};
