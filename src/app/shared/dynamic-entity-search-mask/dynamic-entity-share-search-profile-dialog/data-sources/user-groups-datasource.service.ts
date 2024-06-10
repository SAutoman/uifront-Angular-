import { Injectable } from '@angular/core';

import { Paging, DataSourceIMPL } from '@wfm/service-layer';
import { UserGroupsService } from '@wfm/service-layer/services/user-groups.service';
import { UserGroupsDto } from '@wfm/service-layer/models/UserGroups';

@Injectable({
  providedIn: 'root'
})
export class UserGroupsDataSource extends DataSourceIMPL<UserGroupsDto> {
  tenant: string;
  isAdmin: boolean;
  userId: string;
  userGroupIds: string[];

  constructor(private userGroupsService: UserGroupsService) {
    super();
  }

  async setPageSizeAndIndex(pageIndex: number, pageSize: number) {
    const paging: Paging = {
      skip: pageIndex * pageSize,
      take: pageSize
    };
    /**
     * if is tenantAdmin, show all the groups
     * if not, show the groups where he is the owner
     */

    const temp = this.isAdmin
      ? await this.userGroupsService.getUserGroups(this.tenant, paging)
      : await this.userGroupsService.getUserGroupsByOwner(this.tenant, this.userId, paging);

    /**
     * for non admin users if there are groups where the user is a member but not owner,
     * add them to the list of groups to show (where is an owner or where is a member)
     */

    if (!this.isAdmin && this.userGroupIds?.length) {
      let userGroups = [];
      for (const groupId of this.userGroupIds) {
        if (
          !temp.items.find((group: UserGroupsDto) => {
            return groupId === group.id;
          })
        ) {
          const group = await this.userGroupsService.getUserGroupById(this.tenant, groupId);
          userGroups.push(group);
        }
      }
      temp.items.push(...userGroups);
      temp.total += userGroups.length;
    }

    this.lengthBS.next(temp.total);
    this.itemsBS.next(temp.items);
  }
}
