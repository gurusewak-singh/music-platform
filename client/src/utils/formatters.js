// client/src/utils/formatters.js
export const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds === Infinity || timeInSeconds === undefined || timeInSeconds === null) {
    return '0:00'; // Or return an empty string or '-' if preferred for undefined duration
  }
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

// You can add other formatting utilities here in the future