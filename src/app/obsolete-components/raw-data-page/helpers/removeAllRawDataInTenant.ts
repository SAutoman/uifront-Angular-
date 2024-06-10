// import { RawDataEntityService } from '@wfm/service-layer';

// /**
//  * @description  helper for clean all raw data
//  * @param tenantId  default is test tenantId 11E9D08FB460EF3EA2F602004C4F4F50
//  */
// async function removeAllRawDataInTenant(
//   rawDataEntityService: RawDataEntityService,
//   tenantId = '11E9D08FB460EF3EA2F602004C4F4F50'
// ): Promise<void> {
//   const cases = await rawDataEntityService.search(tenantId);
//   const ids = cases.items.map((x) => x.id);
//   try {
//     rawDataEntityService.deleteItems(tenantId, ids);
//   } catch (error) {}
// }
