import { isDev } from '../config';

export enum LogCategory {
  AUTH = 'AUTHENTICATION',
  STORAGE = 'STORAGE_UPLOAD_DELETE',
  AI = 'AI_GENERATION',
  PAYMENT = 'PAYMENTS_BILLING',
  SERVER = 'SERVER_ERROR_EXCEPTION',
  SECURITY = 'SECURITY_RATE_LIMIT'
}

export interface LogPayload {
  category: LogCategory;
  event: string;
  userId?: string;
  ip?: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
  statusCode?: number;
}

class ProductionLogger {
  private formatLog(payload: LogPayload): string {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      ...payload
    };
    
    if (isDev) {
      // Human-readable polished terminal output for development
      const colorMap: Record<LogCategory, string> = {
        [LogCategory.AUTH]: '\x1b[36m', // Cyan
        [LogCategory.STORAGE]: '\x1b[35m', // Magenta
        [LogCategory.AI]: '\x1b[33m', // Yellow
        [LogCategory.PAYMENT]: '\x1b[32m', // Green
        [LogCategory.SERVER]: '\x1b[31m', // Red
        [LogCategory.SECURITY]: '\x1b[31;1m' // Bright Red
      };
      
      const reset = '\x1b[0m';
      const color = colorMap[payload.category] || '';
      const userPart = payload.userId ? ` [User: ${payload.userId}]` : '';
      const metaPart = payload.metadata ? ` | Meta: ${JSON.stringify(payload.metadata)}` : '';
      const errorPart = payload.errorMessage ? ` | ERROR: ${payload.errorMessage}` : '';
      const statusPart = payload.statusCode ? ` [Status: ${payload.statusCode}]` : '';
      
      return `[${timestamp}] ${color}${payload.category}${reset} | ${payload.event}${userPart}${statusPart}${metaPart}${errorPart}`;
    }
    
    // Structured JSON for production logging dashboards (Google Cloud Logging / ELK)
    return JSON.stringify(logData);
  }

  public info(payload: LogPayload) {
    console.log(this.formatLog(payload));
  }

  public warn(payload: LogPayload) {
    if (isDev) {
      console.warn(`\x1b[33m[WARN]\x1b[0m ` + this.formatLog(payload));
    } else {
      console.warn(this.formatLog(payload));
    }
  }

  public error(payload: LogPayload & { exception?: Error }) {
    const errorPayload = { ...payload };
    if (payload.exception) {
      errorPayload.errorMessage = payload.exception.message;
      errorPayload.metadata = {
        ...payload.metadata,
        stack: payload.exception.stack
      };
    }
    
    if (isDev) {
      console.error(`\x1b[31m[CRITICAL_ERROR]\x1b[0m ` + this.formatLog(errorPayload));
    } else {
      console.error(this.formatLog(errorPayload));
    }
  }
}

export const logger = new ProductionLogger();
