declare module 'blessed' {
  namespace blessed {
    interface ElementStyle {
      fg?: string | number;
      bg?: string | number;
      border?: BorderStyle;
      scrollbar?: ScrollbarStyle;
      focus?: ElementStyle;
      hover?: ElementStyle;
      [key: string]: unknown;
    }

    interface BorderStyle {
      fg?: string | number;
      bg?: string | number;
      [key: string]: unknown;
    }

    interface ScrollbarStyle {
      fg?: string | number;
      bg?: string | number;
      [key: string]: unknown;
    }

    interface BoxOptions {
      style?: ElementStyle;
      border?: BorderOptions | boolean;
      [key: string]: unknown;
    }

    interface BorderOptions {
      type?: string;
      fg?: string | number;
      bg?: string | number;
      [key: string]: unknown;
    }
  }
}

export {};
