import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
    statusCode = 500;
    reason = 'Error connecting to the database';

    constructor() {
        super("Could not connect to db");

        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }
    
    serializeErrors() {
        return [{ message: this.reason }];
    }
}