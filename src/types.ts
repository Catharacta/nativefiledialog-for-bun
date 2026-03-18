export interface FileFilter {
  name: string;
  extensions: string[];
}

export interface DialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileFilter[];
}

export interface OpenFileDialogOptions extends DialogOptions {
  allowMultiple?: boolean;
}

export interface SaveFileDialogOptions extends DialogOptions {
  confirmOverwrite?: boolean;
}

export class NativeDialogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NativeDialogError';
  }
}

export class UserCancelledError extends NativeDialogError {
  constructor() {
    super('User cancelled the dialog');
    this.name = 'UserCancelledError';
  }
}

export class PlatformNotSupportedError extends NativeDialogError {
  constructor(platform: string) {
    super(`Platform ${platform} is not supported`);
    this.name = 'PlatformNotSupportedError';
  }
}

export class MissingDependencyError extends NativeDialogError {
  constructor(dependency: string) {
    super(`Missing dependency: ${dependency}`);
    this.name = 'MissingDependencyError';
  }
}
