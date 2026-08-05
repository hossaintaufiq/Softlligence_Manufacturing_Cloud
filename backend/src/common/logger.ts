type LogFields = Record<string, unknown>;

export const logger = {
  info(message: string, fields?: LogFields) {
    console.log(JSON.stringify({ level: 'info', message, ...fields, ts: new Date().toISOString() }));
  },
  warn(message: string, fields?: LogFields) {
    console.warn(JSON.stringify({ level: 'warn', message, ...fields, ts: new Date().toISOString() }));
  },
  error(message: string, fields?: LogFields) {
    console.error(JSON.stringify({ level: 'error', message, ...fields, ts: new Date().toISOString() }));
  },
};
