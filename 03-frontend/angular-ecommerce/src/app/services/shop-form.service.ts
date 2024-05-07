import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Country } from '../common/country';
import { Region } from '../common/region';

@Injectable({
  providedIn: 'root',
})
export class ShopFormService {
  private countryUrl = `http://localhost:8080/api/countries`;
  private regionUrl = `http://localhost:8080/api/regions`;

  constructor(private httpClient: HttpClient) {}

  getCountries(): Observable<Country[]> {
    return this.httpClient
      .get<GetResponseCountries>(this.countryUrl)
      .pipe(map((response) => response._embedded.countries));
  }

  getRegions(theCountryCode: string): Observable<Region[]> {
    const searchRegion = `${this.regionUrl}/search/findByCountryCode?code=${theCountryCode}`;

    return this.httpClient
      .get<GetResponseRegions>(searchRegion)
      .pipe(map((response) => response._embedded.regions));
  }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];

    //build an array for "Month" dropdown list
    // -start at current month and loop until

    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }

    return of(data);
  }

  getCreditCardYears(): Observable<number[]> {
    let data: number[] = [];

    //build an array for "Year" downlist list
    // -start at current year and loop for next 10 years

    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    for (let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }

    return of(data);
  }
}
interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  };
}

interface GetResponseRegions {
  _embedded: {
    regions: Region[];
  };
}
