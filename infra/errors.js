export class InternalServerError extends Error {
  constructor({ cause, status_code }) {
    super("Um erro interno não esperado aconteceu.", { cause });
    this.name = "InternalServerError";
    this.action = "entre em contato com suport.";
    this.status_code = status_code || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.status_code,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("Metodo não permitido para este endpoint.");
    this.name = "MethodNotAllowedError";
    this.action = "Verifique se o método HTTP enviado é valido para este endpont.";
    this.status_code = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.status_code,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Serviço indiponível no momento.", { cause });
    this.name = "ServiceError";
    this.action = "Verifique se o serviço está funcionando corretamente.";
    this.status_code = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.status_code,
    };
  }
}