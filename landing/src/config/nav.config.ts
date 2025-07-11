// src/data/nav.config.ts

export interface NavItem {
  label: string;
  href: string; // store only `#home`, not `/#home`
  icon: string;
  type: "internal" | "section";
}

export const navItems: NavItem[] = [
  {
    label: "Home",
    href: "#home",
    type: "section",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.48907C3 9.18048 3.14247 8.88917 3.38606 8.69972L11.3861 2.47749C11.7472 2.19663 12.2528 2.19663 12.6139 2.47749L20.6139 8.69972C20.8575 8.88917 21 9.18048 21 9.48907V20ZM19 19V9.97815L12 4.53371L5 9.97815V19H19Z"></path></svg>`,
  },
  {
    label: "What is Yore?",
    href: "#what-is-yore",
    type: "section",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M4 5V19H20V7H11.5858L9.58579 5H4ZM12.4142 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5Z"></path></svg>`,
  },
  {
    label: "Features",
    href: "#features",
    type: "section",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m6 18l-3.15 3.15q-.25.25-.55.125T2 20.8V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18zm6-5.525l1.9 1.15q.275.175.55-.012t.2-.513l-.5-2.175l1.7-1.475q.25-.225.15-.537t-.45-.338L13.325 8.4l-.875-2.05q-.125-.3-.45-.3t-.45.3l-.875 2.05l-2.225.175Q8.1 8.6 8 8.913t.15.537l1.7 1.475l-.5 2.175q-.075.325.2.513t.55.012z"/></svg>`,
  },
  {
    label: "Sign up",
    href: "#signup",
    type: "section",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21.7267 2.95694L16.2734 22.0432C16.1225 22.5716 15.7979 22.5956 15.5563 22.1126L11 13L1.9229 9.36919C1.41322 9.16532 1.41953 8.86022 1.95695 8.68108L21.0432 2.31901C21.5716 2.14285 21.8747 2.43866 21.7267 2.95694ZM19.0353 5.09647L6.81221 9.17085L12.4488 11.4255L15.4895 17.5068L19.0353 5.09647Z"></path></svg>`,
  },
  {
    label: "Funding",
    href: "#funding",
    type: "section",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 20.4142C12.8281 20.4142 13.6569 20.1738 20.8027 20.4142 20.4142C20.8027 20.1738 21.64142 19.8281 21.4142 19.4142C21.4142 18.5858 20.5858 17.8281 19.4142 17.8281C18.2426 17.8281 17.4142 18.5858 17.4142 19.4142C17.4142 20.2426 18.2426 21 19.4142 21C20.5858 21 21.4142 20.2426 21.4142 19C14.2684 18.5858 13.4409 18.2426 12 18C10.5591 18.2426 9.73163 18.5858 2.58579 19C2.58579 20.2426 3.41421 21 4.58579 21C5.75736 21 6.58579 20.2426 6.58579 19C6.58579 18.5858 5.75736 17.8281 4.58579 17.8281C3.41421 17.8281 2.58579 18.5858 2.58579 19C2.58579 19.8281 -0 -0 -0 -0H24V-0H12V20H12V20H12Z"></path></svg>`,
  },
  // {
  //   label: "Blog",
  //   href: "/blog",
  //   type: "internal",
  //   icon: `<svg>...</svg>`,
  // },
];
export const navConfig = {
  items: navItems,
  logo: {
    src: "/assets/images/logo.svg",
    alt: "Yore Logo",
  },
  socialLinks: [
    {
      href: "https://twitter.com/yore",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.68a4.28 4.28 0 001.88-2.36c-.83.49-1.75.84-2.73 1.03a4.26 4.26 0 00-7.27 3.88A12.09 12.09 0 013 5c-.8 1.37-.4 3.15 1 4a4.25 4.25 0 01-1.93-.53v.05a4.26 4.26 0 003.42 4.17c-.72.2-1.48.23-2 .08a4.26 4.26 0 003.98 2A8.57 8.57 0 012 19a11.95 11.95 0 006.29-1C14 .5 18 .5 22 .5c-.5-.5-1-.5-1-.5z"></path></svg>`,
    },
  ],
  links: [
    {
      label: "Privacy Policy",
      href: "/privacy",
      type: "internal",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="  currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6h2V7zm0 8h-2v2h2v-2z"></path></svg>`,
    },
    {
      label: "Terms of Service",
      href: "/terms",
      type: "internal",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6h2V7zm0 8h-2v2h2v-2z"></path></svg>`,
    },
  ],
};
