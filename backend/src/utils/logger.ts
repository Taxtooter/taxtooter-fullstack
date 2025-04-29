const log = (level: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    console.log(logMessage);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
};

export const logger = {
    info: (message: string, data?: any) => log("info", message, data),
    error: (message: string, data?: any) => log("error", message, data),
    warn: (message: string, data?: any) => log("warn", message, data),
    debug: (message: string, data?: any) => log("debug", message, data),
};
