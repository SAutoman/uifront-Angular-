import { ProcessStepPath, PropertyPath, PropertyPathTypeEnum } from './expressionModel';

export function internalPath(path: string[]) {
  return <PropertyPath>{
    path,
    pathType: PropertyPathTypeEnum.Internal
  };
}

export function rawDataPath(path: string[]) {
  return <PropertyPath>{
    path,
    pathType: PropertyPathTypeEnum.RawDataPath
  };
}

export function processStepPath(processStepRefName: string, path: string[]) {
  return <ProcessStepPath>{
    path,
    processStepRefName,
    pathType: PropertyPathTypeEnum.ProcessStepPath
  };
}
