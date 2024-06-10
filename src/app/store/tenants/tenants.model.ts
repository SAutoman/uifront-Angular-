import { Tenant } from '../../service-layer';

// for testing

export const generateTenants = (idOverride?: string): Tenant =>
  <any>{
    id: idOverride || (Math.floor(Math.random() * 100) + 1).toString(),
    name: 'Test name',
    description: 'Test description'
  };

export const generateTenantsArray = (count = 10): Tenant[] =>
  // Overwrite random id generation to prevent duplicate IDs:
  Array.apply(null, Array(count)).map((value, index) => generateTenants(index + 1));

export const generateTenantsMap = (tenantsArray: Array<Tenant> = generateTenantsArray()): { ids: Array<string>; entities: any } => ({
  entities: tenantsArray.reduce((tenantsMap, tenants) => ({ ...tenantsMap, [tenants.id]: tenants }), {}),
  ids: tenantsArray.map((tenants) => tenants.id)
});
