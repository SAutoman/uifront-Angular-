import { Injectable, Inject } from '@angular/core';
import { HttpClientService } from './application-http-client.service';
import { map } from 'lodash-core';
import { KeyValue } from '@angular/common';

export interface ICountry {
  alpha2Code: string;
  callingCodes: string[];
  isEU: boolean;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private countries: ICountry[];
  constructor(@Inject('HttpClientService') private httpClient: HttpClientService) {}

  public async getCountries(): Promise<ICountry[]> {
    if (!this.countries) {
      this.countries = await this.httpClient.get<ICountry[]>(`Countries/all`);
    }
    return this.countries;
  }

  public async getCountriesAsFieldOptions(): Promise<KeyValue<string, string>[]> {
    const countries = await this.getCountries();
    return map(countries, (country) => ({ key: country.name, value: country.name }));
  }
}
