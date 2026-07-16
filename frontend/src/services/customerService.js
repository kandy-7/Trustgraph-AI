export const getCustomerProfile = async () => {
  return {
    name: 'John Doe',
    id: 'USR-38362',
    accountSince: '2021-04-12',
    tier: 'Platinum',
    
    // Risks
    overallRisk: 96,
    identityRisk: 92,
    behaviourRisk: 84,
    deviceTrust: 21,
    
    // Identity
    knownDevices: ['iPhone 14 Pro (iOS 17)', 'MacBook Pro (macOS 14)'],
    trustedLocations: ['Mumbai, IN', 'Pune, IN'],
    trustedMerchants: ['Amazon India', 'Swiggy', 'Uber'],
    
    // Behaviour
    avgAmount: 1450.50,
    maxAmount: 25000.00,
    usualLoginHour: '09:00 - 11:00',
    
    recentTransactions: [
      { id: 'TXN-1', type: 'TRANSFER', amount: 490000, date: 'Today 08:45', status: 'BLOCKED' },
      { id: 'TXN-2', type: 'POS', amount: 1250, date: 'Yesterday 14:20', status: 'SUCCESS' },
      { id: 'TXN-3', type: 'UPI', amount: 450, date: 'Yesterday 09:15', status: 'SUCCESS' },
    ]
  };
};
