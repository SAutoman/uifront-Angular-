// import { CacheService } from '../../service-layer/services/cache.service';

// function dummyValue(): Promise<string> {
//   return Promise.resolve('working');
// }

// describe('cache should work', async () => {
//   const service = new CacheService();
//   await service.get('1', 1, () => dummyValue());

//   it('should contain the element', async () => {
//     const result = await service.get('1', 1, () => dummyValue());
//     expect(service.listMap.size).toEqual(1);
//     expect(result).toEqual('working');
//   });

//   it('should not add the element', () => {
//     service.get('1', 1, () => dummyValue());
//     expect(service.listMap.size).toEqual(1);
//   });

//   it('should remove element and get it again after expire time', () => {
//     const oneMinute = 61000;
//     setTimeout(() => {
//       expect(service.listMap.size).toEqual(0);
//       service.get('1', 1, () => dummyValue());
//       expect(service.listMap.size).toEqual(1);
//     }, oneMinute);
//   });
// });
