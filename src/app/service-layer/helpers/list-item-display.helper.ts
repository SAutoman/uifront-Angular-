import { ListItemDisplayEnum, ListItemDto } from '..';

export function populateListOptionValue(option: ListItemDto, listDisplaySetting?: ListItemDisplayEnum): string {
  let optionValue = option.item;
  if (option.key && (listDisplaySetting || listDisplaySetting === 0)) {
    switch (listDisplaySetting) {
      case ListItemDisplayEnum.KeyValue:
        optionValue = `${option.key} - ${option.item}`;
        break;
      case ListItemDisplayEnum.Value:
        optionValue = `${option.item}`;
        break;
      case ListItemDisplayEnum.Key:
        optionValue = `${option.key}`;
        break;
      default:
        break;
    }
  }
  return optionValue;
}
