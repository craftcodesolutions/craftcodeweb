export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: Record<string, unknown>;
  onClick?: () => void;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private defaultIcon = '/icons/logo.png';

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported in this browser');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      console.log(`Notification permission updated: ${permission}`);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  hasPermission(): boolean {
    return this.permission === 'granted';
  }

  async requestPermissionWithInteraction(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await this.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  async show(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return null;
    }

    this.permission = Notification.permission;

    if (this.permission === 'denied' || this.permission === 'default') {
      console.log('Permission not granted—skipping notification');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || this.defaultIcon,
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        data: options.data,
      });

      if (options.onClick) {
        notification.onclick = (event) => {
          event.preventDefault();
          options.onClick!();
          notification.close();
          if (window.focus) {
            window.focus();
          }
        };
      }

      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      console.log('✅ Notification shown:', options.title);
      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  async showMessageNotification(
    senderName: string,
    messageText: string,
    onClick?: () => void
  ): Promise<Notification | null> {
    return this.show({
      title: `New message from ${senderName}`,
      body: messageText,
      icon: '/icons/message.svg',
      tag: `message-${senderName}-${Date.now()}`, // Unique tag with timestamp
      requireInteraction: false,
      onClick: onClick,
      data: { type: 'message', sender: senderName },
    });
  }

  async showSentMessageNotification(
    receiverName: string,
    messageText: string,
    onClick?: () => void
  ): Promise<Notification | null> {
    return this.show({
      title: `Message sent to ${receiverName}`,
      body: messageText,
      icon: '/icons/message-sent.svg',
      tag: `sent-message-${receiverName}-${Date.now()}`, // Unique tag with timestamp
      requireInteraction: false,
      onClick: onClick,
      data: { type: 'sent-message', receiver: receiverName },
    });
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Browser notifications not supported');
      return false;
    }

    this.permission = Notification.permission;

    if (this.permission === 'granted') {
      console.log('✅ Notification permissions already granted');
      return true;
    } else if (this.permission === 'default') {
      console.log('📋 Notification permissions not requested yet');
      return true;
    } else {
      console.warn('❌ Notification permissions denied by user');
      return false;
    }
  }
}

export const notificationService = new NotificationService();
export const showMessageNotification = (
  senderName: string,
  messageText: string,
  onClick?: () => void
) => {
  return notificationService.showMessageNotification(senderName, messageText, onClick);
};
export const showSentMessageNotification = (
  receiverName: string,
  messageText: string,
  onClick?: () => void
) => {
  return notificationService.showSentMessageNotification(receiverName, messageText, onClick);
};
export const initializeNotifications = () => {
  return notificationService.initialize();
};
export { NotificationService };