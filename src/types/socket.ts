export interface UserStatusChangeData {
    status: boolean;
    timestamp: string;
    reason: string;
    forcedDisconnect?: boolean; // Optional, used for forced disconnections
  }