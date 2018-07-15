function notify(type, ...items) {
  // console.log('process.env.NODE_ENV', process.env.NODE_ENV);
  switch (process.env.NODE_ENV) {
    case 'development':
    case 'test':
      return console[type](...items);
  }
}
export function log(...items) {
  return notify('log', ...items);
}
export function warn(...items) {
  return notify('warn', ...items);
}
export function error(...items) {
  return notify('error', ...items);
}
