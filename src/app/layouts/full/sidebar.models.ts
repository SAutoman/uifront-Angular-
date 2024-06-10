import { Settings, TenantProfile } from '@wfm/service-layer';
import { Menu } from '@wfm/shared/menu-items/menu-items';
import { MenuType } from '@wfm/store';

export interface UserProfileSidebarView {
  name: string;
  lastName: string;
  rolesPerTenant: TenantProfile[];
  tenant: TenantProfile;
  menuType: MenuType;
  menu: Menu[];
  adminMenu: Menu[];
}
