/**
 * global
 */
import { AfterViewInit, Component, ViewChild } from '@angular/core';

/**
 * project
 */
import { ListItemDto, ListsService, Paging, CreateListDto } from '@wfm/service-layer';
import { environment } from '@src/environments/environment.base';

/**
 * local
 */
import { ListDto } from '@wfm/service-layer/models/list.dto';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { Test, TestResult } from '@wfm/tests/models';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { Store } from '@ngrx/store';
import { ApplicationState } from '@wfm/store';

@Component({
  selector: 'lists-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class ListsTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  appId: string = environment.appId;
  title = 'Lists tests';

  constructor(private store: Store<ApplicationState>, private listsService: ListsService) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        function: async () => await this.create(),
        name: 'Create list'
      },
      <Test>{
        function: async () => await this.createWithItems(),
        name: 'Create list with items'
      },
      <Test>{
        function: async () => await this.appendListItem(),
        name: 'Add list item to list'
      },
      <Test>{
        function: () => this.deleteListItem(),
        name: 'Delete list item'
      },
      <Test>{
        function: async () => await this.delete(),
        name: 'Delete list'
      },
      <Test>{
        function: async () => await this.addListItemToListWithParent(),
        name: 'Add list item to list with parent'
      }
      // create('Get options', (x) => this.getOptions(x)),
      // create('Search', (x) => this.search(x)),
      // create('Get with parent data', (x) => this.getWithParentData(x)),
    ]);
  }

  private async getOptions(): Promise<TestResult> {
    let isSuccess = false;

    try {
      // TODO Fix the test
      const result = await this.listsService.getOptions(this.tenant);

      if (result?.length > 0) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get options';
      console.warn('create failed error', { error });
      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async search(): Promise<TestResult> {
    let isSuccess = false;

    try {
      // TODO Fix
      const result = await this.listsService.getLists(this.tenant, <Paging>{ skip: 0, take: 999999 });
      if (result.total > 0) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Search';
      console.warn('create failed error', { error });
      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async create(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const list = <ListDto>{
        inUse: false,
        name: 'newTestname12345',
        tenantPublicId: this.tenant
      };
      const entity = await this.listsService.createList(this.tenant, list);
      if (entity) {
        isSuccess = true;
      }
      await this.listsService.deleteList(this.tenant, entity.id);
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create';
      console.warn('create failed error', { error });
      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async createWithItems(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const list = <CreateListDto>{
        name: 'newListWithItems',
        listItems: [
          {
            listId: '',
            item: 'one',
            parentListItemId: '',
            position: 0
          },
          {
            listId: '',
            item: 'two',
            parentListItemId: '',
            position: 1
          },
          {
            listId: '',
            item: 'three',
            parentListItemId: '',
            position: 2
          }
        ]
      };
      const entity = await this.listsService.createListWithItems(this.tenant, list);
      if (entity) {
        isSuccess = true;
      }
      await this.listsService.deleteList(this.tenant, entity.id);
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create';
      console.warn('create failed error', { error });
      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async getListItemsByListId(): Promise<TestResult> {
    let isSuccess = false;

    try {
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async appendListItem(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const list = <ListDto>{
        inUse: false,
        name: 'hjghghghg',
        tenantPublicId: this.tenant
      };

      const listEntity = await this.listsService.createList(this.tenant, list);

      const listItem = <ListItemDto>{
        position: 0,
        item: 'testItem',
        listId: listEntity.id
      };

      const result = await this.listsService.addListItem(this.tenant, listEntity.id, listItem);

      if (result) {
        isSuccess = true;
      }

      await this.listsService.deleteList(this.tenant, listEntity.id);
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Add list item to list';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async updateListItem(): Promise<TestResult> {
    let isSuccess = false;

    try {
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async deleteListItem(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const list = <ListDto>{
        inUse: false,
        name: 'qwe123',
        tenantPublicId: this.tenant
      };

      const listEntity = await this.listsService.createList(this.tenant, list);

      const listItem = <ListItemDto>{
        position: 0,
        item: 'testItem',
        listId: listEntity.id
      };

      const listItemResult = await this.listsService.addListItem(this.tenant, listEntity.id, listItem);
      await this.listsService.deleteListItem(this.tenant, listEntity.id, listItemResult.id);
      const data = await this.listsService.getListItems(this.tenant, listEntity.id);

      if (!data.items.find((x) => x.id === listItemResult.id)) {
        isSuccess = true;
      }

      await this.listsService.deleteList(this.tenant, listEntity.id);
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Delete list item';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async getWithParentData(): Promise<TestResult> {
    let isSuccess = false;

    try {
      // TODO Fix
      const result = await this.listsService.getLists(this.tenant, <Paging>{ skip: 0, take: 99999 });

      if (result.total > 0) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get with parent data';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async update(): Promise<TestResult> {
    let isSuccess = false;

    try {
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async delete(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const list = <ListDto>{
        inUse: false,
        name: 'poyute',
        tenantPublicId: this.tenant
      };

      const entity = await this.listsService.createList(this.tenant, list);
      await this.listsService.deleteList(this.tenant, entity.id);

      const data = await this.listsService.getLists(this.tenant, <Paging>{ skip: 0, take: 9999 });

      if (!data.items.find((x) => x.id === entity.id)) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Delete list';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async addListItemToListWithParent(): Promise<TestResult> {
    let isSuccess = false;

    let parentList: ListDto;
    let childList: ListDto;

    try {
      // create a parent list
      const parentListDTO = <ListDto>{
        inUse: false,
        name: 'parentList111',
        tenantPublicId: this.tenant
      };

      parentList = await this.listsService.createList(this.tenant, parentListDTO);

      const parentListItem1DTO = <ListItemDto>{
        position: 0,
        item: 'testItem111',
        listId: parentList.id
      };
      const parentListItem2DTO = <ListItemDto>{
        position: 1,
        item: 'testItem222',
        listId: parentList.id
      };
      const parentItems = await Promise.all([
        this.listsService.addListItem(this.tenant, parentList.id, parentListItem1DTO),
        this.listsService.addListItem(this.tenant, parentList.id, parentListItem2DTO)
      ]);

      // create a child list
      const childListDTO = <ListDto>{
        parentListId: parentList.id,
        inUse: false,
        name: 'childList111',
        tenantPublicId: this.tenant
      };

      childList = await this.listsService.createList(this.tenant, childListDTO);

      const childListItem1DTO = <ListItemDto>{
        position: 0,
        item: 'childTestItem111',
        listId: childList.id,
        parentListItemId: parentItems[0].id
      };
      const childListItem2DTO = <ListItemDto>{
        position: 0,
        item: 'childTestItem222',
        listId: childList.id,
        parentListItemId: parentItems[1].id
      };

      const childItems = await Promise.all([
        this.listsService.addListItem(this.tenant, childList.id, childListItem1DTO),
        this.listsService.addListItem(this.tenant, childList.id, childListItem2DTO)
      ]);

      const allOptions = await this.listsService.getOptions(this.tenant);

      const childOptions = allOptions.find((opt) => {
        return opt.key === childList.id;
      });

      const hasParent = childOptions.value.some((opt) => {
        return opt.parentListItemId;
      });

      if (childList?.parentListId === parentList?.id && hasParent) {
        isSuccess = true;
      }
      this.listsService.deleteList(this.tenant, parentList.id);
      this.listsService.deleteList(this.tenant, childList.id);
      // do we need to remove the list items explicitly? Or they are removed recursively at the backend once the list is removed

      // this.listsService.deleteListItem(this.tenant, parentList.id, parentItems[0].id);
      // this.listsService.deleteListItem(this.tenant, parentList.id, parentItems[1].id);
      // this.listsService.deleteListItem(this.tenant, childList.id, childItems[0].id);
      // this.listsService.deleteListItem(this.tenant, childList.id, childItems[1].id);
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Add list item to list with parent';

      console.error('addListItemToListWithParent error', { error });
      parentList ? this.listsService.deleteList(this.tenant, parentList.id) : '';
      childList ? this.listsService.deleteList(this.tenant, childList.id) : '';

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }
}
