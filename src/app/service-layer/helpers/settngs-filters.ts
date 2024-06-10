import { Settings, UserSettingsDto } from '..';

/**
 * return only searchProfiles that have schemaId and are not duplicated (WFM-2125)
 */
export function cleanupSearchProfiles(searchProfilesSettings: Settings[]): Settings[] {
  const filteredProfiles = [];

  if (searchProfilesSettings) {
    let profileIds = [];
    let profilesWithSchemas = [];
    searchProfilesSettings.forEach((profileSetting) => {
      if (profileSetting.value.schemaId) {
        profilesWithSchemas.push(profileSetting);
        // first select all the searchProfiles that are not shared with groups
        if (!profileSetting.fromGroup) {
          profileIds.push(profileSetting.id);
          filteredProfiles.push(profileSetting);
        }
      }
    });
    // now check all the profiles shared with groups and if there are any duplications in already selected profiles, skip
    profilesWithSchemas.forEach((profileSetting) => {
      if (profileSetting.fromGroup && profileIds.indexOf(profileSetting.id) < 0) {
        profileIds.push(profileSetting.id);
        filteredProfiles.push(profileSetting);
      }
    });
  }
  return filteredProfiles;
}

/**
 * return only layouts that are not duplicated (WFM-2125)
 */
export function cleanupLayouts(layoutSetting: UserSettingsDto): Settings[] {
  const filteredLayouts = [];

  if (layoutSetting?.settings) {
    let layoutIds = [];
    layoutSetting.settings.forEach((layout) => {
      if (!layout.fromGroup) {
        layoutIds.push(layout.id);
        filteredLayouts.push(layout);
      }
    });
    layoutSetting.settings.forEach((layout) => {
      if (layout.fromGroup && layoutIds.indexOf(layout.id) < 0) {
        layoutIds.push(layout.id);
        filteredLayouts.push(layout);
      }
    });
  }
  return filteredLayouts;
}
