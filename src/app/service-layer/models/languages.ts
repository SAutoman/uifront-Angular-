export interface LanguageOption {
  key: string;
  title: string;
  flag: string;
}

export const LanguagesList: LanguageOption[] = [
  {
    key: 'en',
    title: 'English',
    flag: 'assets/images/flags/uk.png'
  },
  {
    key: 'de',
    title: 'Deutsch',
    flag: 'assets/images/flags/de.png'
  }
  // {
  //   key: 'fr',
  //   title: 'Français',
  //   flag: 'assets/images/flags/fr.png'
  // },
  // {
  //   key: 'it',
  //   title: 'Italiano',
  //   flag: 'assets/images/flags/it.png'
  // }
];
