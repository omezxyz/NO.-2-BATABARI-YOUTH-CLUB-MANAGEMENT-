// import { MonthYear } from '@/types';

// // Generate months from January 2023 to current date
// export const generateMonthsFromStart = (): MonthYear[] => {
//   const months: MonthYear[] = [];
//   const startDate = new Date(2023, 0, 1); // January 2023
//   const currentDate = new Date();
  
//   const monthNames = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];
  
//   let date = new Date(startDate);
//   while (date <= currentDate) {
//     months.push({
//       month: date.getMonth() + 1,
//       year: date.getFullYear(),
//       label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
//     });
//     date.setMonth(date.getMonth() + 1);
//   }
  
//   return months;
// };

// // Calculate interest: rate% per ₹1000 per month
// // e.g., 3% rate on ₹1000 = ₹30 per month
// export const calculateInterest = (
//   principal: number,
//   rate: number,
//   startDate: string,
//   endDate: string = new Date().toISOString().split('T')[0]
// ): number => {
//   const start = new Date(startDate);
//   const end = new Date(endDate);
//   const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  
//   // Interest = (Principal × Rate × Months) / 100
//   // For ₹1000 at 3% for 1 month = (1000 × 3 × 1) / 100 = ₹30
//   const totalInterest = (principal * rate * months) / 100;
  
//   return Math.round(totalInterest);
// };

// // Format currency
// export const formatCurrency = (amount: number): string => {
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     maximumFractionDigits: 0
//   }).format(amount);
// };

// // Format date
// export const formatDate = (dateString: string): string => {
//   if (!dateString) return '-';
//   return new Date(dateString).toLocaleDateString('en-IN', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric'
//   });
// };
import { MonthYear } from '@/types';

// Generate months from January 2023 to current date
export const generateMonthsFromStart = (): MonthYear[] => {
  const months: MonthYear[] = [];
  const startDate = new Date(2023, 0, 1); // January 2023
  const currentDate = new Date();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  let date = new Date(startDate);
  while (date <= currentDate) {
    months.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
    });
    date.setMonth(date.getMonth() + 1);
  }
  
  return months;
};

// Calculate interest: rate% per ₹1000 per month (day-wise calculation)
// e.g., 3% rate on ₹1000 = ₹30 per month = ₹1 per day
export const calculateInterest = (
  principal: number,
  rate: number,
  startDate: string,
  endDate: string = new Date().toISOString().split('T')[0]
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate days elapsed
  const timeDiff = end.getTime() - start.getTime();
  const daysElapsed = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
  
  // Daily interest: (Principal × Rate × Days) / (100 × 30)
  // Rate is per month, so divide by 30 to get daily rate
  const totalInterest = (principal * rate * daysElapsed) / (100 * 30);
  
  return Math.round(totalInterest);
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};
