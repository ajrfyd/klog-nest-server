declare global {
  namespace Express {
    interface Request {
      isVisited: boolean;
    }
  }
}

export {};
