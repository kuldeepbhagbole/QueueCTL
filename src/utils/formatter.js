import { formatDistanceToNow } from 'date-fns';

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return dateString;
  }
};

export const truncate = (str, length = 20) => {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};