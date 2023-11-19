interface SessionError {
  code: number | string;
  text: string;
  type: string;
}

interface UserSessionData {
  _id: number;
  _uuid: string;
  userName: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  sessionID: string;
  image: string;
  connected: boolean;
  createdAt: string;
}



export type { SessionError, UserSessionData }