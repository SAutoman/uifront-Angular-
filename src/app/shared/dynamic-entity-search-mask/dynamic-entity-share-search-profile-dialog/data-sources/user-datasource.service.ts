import { Injectable } from '@angular/core';
import { User, UsersService, Paging, DataSourceIMPL, PagedData } from '@wfm/service-layer';

@Injectable({
  providedIn: 'root'
})
export class UserDataSource extends DataSourceIMPL<User> {
  tenant: string;
  isAdmin: boolean;
  userId: string;
  userGroupIds: string[];
  userCompanyId: string;

  constructor(private usersService: UsersService) {
    super();
  }

  /**
   * if non admin, only users from the groups where the requestor is a member will be returned
   * if admin, all users of the tenant will be returned
   */

  async setPageSizeAndIndex(pageIndex: number, pageSize: number): Promise<void> {
    const paging: Paging = {
      skip: pageIndex * pageSize,
      take: pageSize
    };

    let usersPaged;
    if (this.isAdmin) {
      usersPaged = await this.getAllTenantUsers(paging);
    } else {
      usersPaged = await this.getUsersFromSameCompany(paging);
    }

    this.lengthBS.next(usersPaged.total);
    this.itemsBS.next(usersPaged.items);
  }

  async getAllTenantUsers(paging: Paging): Promise<PagedData<User>> {
    return await this.usersService.searchByTenant(this.tenant, paging);
  }

  /**
   * get the users from the same company && tenant
   */
  async getUsersFromSameCompany(paging: Paging): Promise<PagedData<User>> {
    let coworkerUsers = await this.usersService.getUsersOfTenantFromCompany(this.tenant, this.userCompanyId);
    coworkerUsers = coworkerUsers.filter((user) => user.id !== this.userId);
    let paginatedUsers = coworkerUsers.slice(paging.skip, paging.skip + paging.take);
    let finalData: PagedData<User> = {
      items: paginatedUsers,
      total: coworkerUsers.length
    };

    return finalData;
  }
}
