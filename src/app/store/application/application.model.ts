import { WfmApplication } from '../../service-layer';

// for testing

export const generateApplication = (idOverride?: string): WfmApplication => ({
  id: idOverride || (Math.floor(Math.random() * 100) + 1).toString(),
  baseUrl: 'dsadas',
  name: 'Cargo'
});

export const generateApplicationArray = (count = 10): WfmApplication[] =>
  // Overwrite random id generation to prevent duplicate IDs:
  Array.apply(null, Array(count)).map((value, index) => generateApplication(index + 1));

export const generateApplicationMap = (
  applicationArray: Array<WfmApplication> = generateApplicationArray()
): { ids: Array<string>; entities: any } => ({
  entities: applicationArray.reduce((applicationMap, application) => ({ ...applicationMap, [application.id]: application }), {}),
  ids: applicationArray.map((application) => application.id)
});
