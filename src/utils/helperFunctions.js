export const convertNumber = (number) => {
  const units = ["", "K", "M", "B", "T"];
  const unitIndex = Math.floor(Math.log10(Math.abs(number)) / 3);
  const convertedNumber = (number / Math.pow(1000, unitIndex)).toFixed(
    units[unitIndex] === "K" ? 1 : 2
  );
  const unit = units[unitIndex];

  return convertedNumber + unit;
};

export const trimText = (text, characterLimit) => {
  text = text.trim();

  if (text.length > characterLimit)
    return text.slice(0, characterLimit) + "...";
  else return text;
};

export const convertEpochToDateString = (epochSeconds) => {
  const date = new Date(epochSeconds * 1000); // Convert seconds to milliseconds

  // Get month name
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];

  // Get day with appropriate suffix (e.g., 1st, 2nd, 3rd, etc.)
  const day = date.getDate();
  const daySuffix = getDaySuffix(day);
  const dayString = day + daySuffix;

  // Get year
  const year = date.getFullYear();

  return `${month} ${dayString}, ${year}`;
};

export const getDaySuffix = (day) => {
  if (day >= 11 && day <= 13) {
    return "th";
  }

  const lastDigit = day % 10;

  switch (lastDigit) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export function convertToUSD(price, sourceCurrency) {
  const conversionRates = {
    USD: 1,
    EUR: 1.12,
    GBP: 1.31,
    AUD: 0.69,
    CAD: 0.76,
    JPY: 0.0072,
    CHF: 1.16,
    CNY: 0.14,
    INR: 0.012,
    BRL: 0.21,
    MXN: 0.059,
    ZAR: 0.055,
    SEK: 0.097,
    NZD: 0.64,
    RUB: 0.011,
    HKD: 0.13,
    SGD: 0.75,
    TRY: 0.038,
    ILS: 0.28,
    // Add more conversion rates here for additional currency codes
  };

  // Check if conversion rate is available for the given source currency
  if (!conversionRates.hasOwnProperty(sourceCurrency)) {
    console.log("Conversion rate not available for the given currency.");
    return 0;
  }

  // Perform the conversion
  const conversionRate = conversionRates[sourceCurrency];
  const convertedPrice = price * conversionRate;
  return convertedPrice;
}

export const getDaysSinceEpoch = (epochSeconds) => {
  const milliseconds = epochSeconds * 1000; // Convert seconds to milliseconds
  const epochDate = new Date(milliseconds); // Create a Date object from epoch milliseconds
  const currentDate = new Date(); // Get the current date

  // Calculate the difference in days
  const timeDifference = currentDate.getTime() - epochDate.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

  return daysDifference;
};
