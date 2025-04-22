import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'

import { of, throwError } from 'rxjs'

import { ListProductService } from './list-product.service'
import type { ProductDetails } from '../models'
import { Categories } from '../../products/models'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import {
  FILL_ALL_FORM_FIELDS,
  INVALID_CATEGORY,
  INVALID_QUANTITY,
  PRODUCT_IMAGES_LIMIT,
  PRODUCT_LISTING_SUCCESSFUL,
} from '../../../utils'

describe('ListProductService', () => {
  let service: ListProductService
  let apiServiceSpy: jasmine.SpyObj<APIService>
  let notificationsSpy: jasmine.SpyObj<NotificationsService>
  let routerSpy: jasmine.SpyObj<Router>

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj('APIService', ['post'])
    notificationsSpy = jasmine.createSpyObj('NotificationsService', ['addNotification'])
    routerSpy = jasmine.createSpyObj('Router', ['navigate'])

    TestBed.configureTestingModule({
      providers: [
        ListProductService,
        { provide: APIService, useValue: apiServiceSpy },
        { provide: NotificationsService, useValue: notificationsSpy },
        { provide: Router, useValue: routerSpy },
      ],
    })
    service = TestBed.inject(ListProductService)
  })

  describe('listProduct validations', () => {
    const baseDetails = {
      name: 'Prod',
      description: 'Desc',
      price: 10,
      category: Object.values(Categories)[0],
      quantity: 1,
    } as ProductDetails

    it('should notify error when fields missing', () => {
      service.listProduct({ ...baseDetails, name: '' }, [])
      expect(notificationsSpy.addNotification).toHaveBeenCalledWith({
        message: FILL_ALL_FORM_FIELDS,
        type: 'error',
      })
      expect(apiServiceSpy.post).not.toHaveBeenCalled()
    })

    it('should notify error for invalid category', () => {
      service.listProduct({ ...baseDetails, category: 'invalid' }, [])
      expect(notificationsSpy.addNotification).toHaveBeenCalledWith({
        message: INVALID_CATEGORY,
        type: 'error',
      })
    })

    it('should notify error for non-positive quantity', () => {
      service.listProduct({ ...baseDetails, quantity: 0 }, [])
      expect(notificationsSpy.addNotification).toHaveBeenCalledWith({
        message: INVALID_QUANTITY,
        type: 'error',
      })
    })
  })

  describe('listProduct API flow', () => {
    const validDetails = {
      name: 'P',
      description: 'D',
      price: 5,
      category: Object.values(Categories)[0],
      quantity: 2,
    } as ProductDetails

    it('should post data and navigate on success', () => {
      apiServiceSpy.post.and.returnValue(of(null))
      service.listProduct(validDetails, [])
      expect(apiServiceSpy.post).toHaveBeenCalled()
      expect(notificationsSpy.addNotification).toHaveBeenCalledWith({
        message: PRODUCT_LISTING_SUCCESSFUL,
        type: 'success',
      })
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/'])
    })

    it('should show error notification on API failure', () => {
      const error = { message: 'failed' }
      apiServiceSpy.post.and.returnValue(throwError(() => error))
      service.listProduct(validDetails, [])
      expect(notificationsSpy.addNotification).toHaveBeenCalledWith({
        message: 'failed',
        type: 'error',
      })
    })
  })

  describe('processImages', () => {
    it('should notify error when exceeding limit', () => {
      const cbPreview = jasmine.createSpy('cbPreview')
      const cbFile = jasmine.createSpy('cbFile')
      service.processImages(
        [new File([], 'img.png', { type: 'image/png' })],
        0,
        0,
        cbPreview,
        cbFile
      )
      expect(notificationsSpy.addNotification).toHaveBeenCalledWith({
        type: 'error',
        message: PRODUCT_IMAGES_LIMIT,
      })
    })

    it('should process valid images and invoke callbacks', () => {
      const file = new File(['data'], 'img.png', { type: 'image/png' })
      const fakeReader: { result: string; onload: (() => void) | null; readAsDataURL: () => void } =
        {
          result: 'dataURL',
          onload: null,
          readAsDataURL() {
            if (this.onload) {
              this.onload()
            }
          },
        }
      spyOn(window, 'FileReader').and.callFake(() => fakeReader as unknown as FileReader)
      const cbPreview = jasmine.createSpy('cbPreview')
      const cbFile = jasmine.createSpy('cbFile')
      service.processImages([file], 5, 0, cbPreview, cbFile)
      expect(cbPreview).toHaveBeenCalledWith('dataURL')
      expect(cbFile).toHaveBeenCalledWith(file)
    })
  })
})
