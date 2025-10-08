/**
 * Configuração de logging estruturado para Node.js.
 *
 * Inspirado no setup Python com structlog.
 */

const fs = require('fs');
const path = require('path');
const pino = require('pino');

function setupStructuredLogger({
  logLevel = 'info',
  logFormat = 'json',
  logFile = null,
  serviceName = 'chat-service'
} = {}) {
  const transport =
    logFormat === 'pretty'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined;

  const logger = pino(
    {
      level: logLevel,
      base: {
        service: serviceName,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    transport ? pino.transport(transport) : logFile ? pino.destination(logFile) : process.stdout
  );

  return logger;
}

// Instância global
const globalLogger = setupStructuredLogger({
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'json',
  logFile: path.join(__dirname, '../../logs/app.log'),
  serviceName: 'connect-gamers',
});

// 🔹 Funções utilitárias inspiradas no Python
const logFunctionCall = (funcName, args = {}) => {
  globalLogger.info({ event: 'function_call', function: funcName, args });
};

const logPerformance = (operation, duration, context = {}) => {
  globalLogger.info({
    event: 'performance',
    operation,
    duration_seconds: duration.toFixed(3),
    ...context,
  });
};

const logErrorWithContext = (error, operation, context = {}) => {
  globalLogger.error({
    event: 'error',
    operation,
    error_type: error.name,
    error_message: error.message,
    stack: error.stack,
    ...context,
  });
};

const logSecurityEvent = (eventType, details = {}) => {
  globalLogger.info({
    event: 'security',
    event_type: eventType,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

const logBusinessMetric = (metricName, value, unit = null, dimensions = {}) => {
  globalLogger.info({
    event: 'business_metric',
    metric_name: metricName,
    value,
    unit,
    timestamp: new Date().toISOString(),
    ...dimensions,
  });
};

module.exports = {
  logger: globalLogger,
  logFunctionCall,
  logPerformance,
  logErrorWithContext,
  logSecurityEvent,
  logBusinessMetric,
};
