import { Tenant } from '../../service-layer';

describe('Tenants Reducer', () => {
  it('should create tenant', () => {
    const tenant = {
      name: 'test',
      appPublicId: 'testid'
    } as Tenant;

    // const action = new CreateTenants({ tenants: tenant });
    // const result = tenantsReducer(initialTenantsState, action);

    // expect(result.tenant).toBe(action.payload.tenants);
  });

  it('should fetch tenants', () => {
    // const paging = <Paging>{ skip: this.state.skip, take: this.state.take };
    // const action = new FetchTenants();
    // const result = tenantsReducer(initialTenantsState, action);
    // expect(result).toBe({
    //   ...initialTenantsState,
    //   loading: true,
    //   error: ''
    // });
  });
});
