import moment from 'moment';

export function breaklines(text) {
  return text.replace(/(\r\n|\n|\r)/gm, '<br>');
}

export function formatDate(dateString) {
  return moment(dateString).format('MMMM YYYY');
}

export function toLowerCase(str) {
  return str.toLowerCase();
}

export function joinArray(arr, separator) {
  return arr.join(separator);
}