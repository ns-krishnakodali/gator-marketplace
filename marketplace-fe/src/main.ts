import { provideHttpClient, withFetch } from '@angular/common/http'
import { bootstrapApplication } from '@angular/platform-browser'
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'

import { AppComponent } from './app/app.component'
import { loadGoogleMaps } from './app/core'
import { routes } from './app/app.routes'

import { environment } from './environments/environment'

const initBootstrap = (): void => {
  bootstrapApplication(AppComponent, {
    providers: [provideAnimations(), provideHttpClient(withFetch()), provideRouter(routes)],
  }).catch((error) => console.error('Error bootstrapping the application:', error))
}

loadGoogleMaps(environment.googleMapsApiKey)
  .catch((error) => {
    console.error('Error loading Google Maps:', error)
  })
  .finally(() => {
    initBootstrap()
  })
