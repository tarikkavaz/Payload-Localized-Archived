export const formatDateTime = (timestamp: string, includeTime: boolean = false): string => {
  const date = timestamp ? new Date(timestamp) : new Date();
  
  // Use UTC methods to avoid timezone issues
  const months = date.getUTCMonth();
  const days = date.getUTCDate();
  const year = date.getUTCFullYear();
  
  const MM = (months + 1 < 10) ? `0${months + 1}` : months + 1;
  const DD = days < 10 ? `0${days}` : days;
  const YYYY = year;

  if (!includeTime) {
    return `${MM}/${DD}/${YYYY}`;
  }

  // Add time formatting if needed
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const AMPM = hours < 12 ? 'AM' : 'PM';
  const HH = hours % 12 || 12;
  const MinMin = minutes < 10 ? `0${minutes}` : minutes;

  return `${MM}/${DD}/${YYYY}, ${HH}:${MinMin} ${AMPM}`;
}