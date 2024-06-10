import { Company } from '../../service-layer';

// for testing

export const generateCompany = (idOverride?: string): Company =>
  <any>{
    id: idOverride || (Math.floor(Math.random() * 100) + 1).toString()
  };

export const generateCompanyArray = (count = 10): Company[] =>
  // Overwrite random id generation to prevent duplicate IDs:
  Array.apply(null, Array(count)).map((value, index) => generateCompany(index + 1));

export const generateCompanyMap = (companyArray: Array<Company> = generateCompanyArray()): { ids: Array<string>; entities: any } => ({
  entities: companyArray.reduce((companyMap, company) => ({ ...companyMap, [company.id]: company }), {}),
  ids: companyArray.map((company) => company.id)
});
