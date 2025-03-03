import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'

import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { DEFAULT_ERROR_MESSAGE, getAuthToken } from '../../utils'
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class APIService {
  private readonly BASE_URL = environment.apiBaseURL

  constructor(private httpClient: HttpClient) {}

  get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | readonly (string | number | boolean)[]>,
    addAuthHeader = true,
    headers?: Record<string, string>
  ): Observable<T> {
    return this.httpClient
      .get<T>(`${this.BASE_URL}/${endpoint}`, {
        headers: this.getHeaders(headers, addAuthHeader),
        params: new HttpParams({ fromObject: params || {} }),
      })
      .pipe(
        map((response) => response),
        catchError(this.handleError)
      )
  }

  post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Observable<T> {
    return this.httpClient
      .post<T>(`${this.BASE_URL}/${endpoint}`, body, { headers: this.getHeaders(headers) })
      .pipe(
        map((response) => response),
        catchError(this.handleError)
      )
  }

  put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Observable<T> {
    return this.httpClient
      .put<T>(`${this.BASE_URL}/${endpoint}`, body, { headers: this.getHeaders(headers) })
      .pipe(
        map((response) => response),
        catchError(this.handleError)
      )
  }

  delete<T>(endpoint: string, headers?: Record<string, string>): Observable<T> {
    return this.httpClient
      .delete<T>(`${this.BASE_URL}/${endpoint}`, { headers: this.getHeaders(headers) })
      .pipe(
        map((response) => response),
        catchError(this.handleError)
      )
  }

  private getHeaders = (
    customHeaders?: Record<string, string>,
    addAuthHeader?: boolean
  ): HttpHeaders => {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    if (addAuthHeader) {
      const token: string = getAuthToken() || ''
      headers = headers.set('Authorization', `${token}`)
    }
    if (customHeaders) {
      Object.entries(customHeaders).forEach(([key, value]: [string, string]) => {
        headers = headers.set(key, value)
      })
    }
    return headers
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage: string = DEFAULT_ERROR_MESSAGE
    if (error.error instanceof ErrorEvent) {
      console.error('Client Error: ', error)
      errorMessage = error?.error.message
    } else if (error instanceof HttpErrorResponse) {
      console.error('Server Error: ', error)
      errorMessage = error?.error?.message
    }
    return throwError(() => new Error(errorMessage))
  }
}
