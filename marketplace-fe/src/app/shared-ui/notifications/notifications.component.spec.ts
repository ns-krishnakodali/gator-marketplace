import { By } from '@angular/platform-browser'
import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NotificationsComponent } from './notifications.component'
import type { INotification } from './notifications.model'
import { NotificationsService } from './notifications.service'

import { TextComponent } from '../text/text.component'

describe('NotificationsComponent', () => {
  let notificationComponent: NotificationsComponent
  let notificationsService: jasmine.SpyObj<NotificationsService>
  let fixture: ComponentFixture<NotificationsComponent>

  let mockNotifications: INotification[]

  beforeEach(async () => {
    mockNotifications = [
      { id: 1, message: 'Info message', type: 'info' },
      { id: 2, message: 'Warning message', type: 'warning' },
      { id: 3, message: 'Success message', type: 'success' },
      { id: 4, message: 'Error message', type: 'error' },
    ]

    const spy = jasmine.createSpyObj('NotificationsService', [
      'getNotifications',
      'addNotification',
      'removeNotification',
      'clearNotifications',
    ])

    await TestBed.configureTestingModule({
      imports: [NotificationsComponent, TextComponent],
      providers: [{ provide: NotificationsService, useValue: spy }],
    }).compileComponents()

    notificationsService = TestBed.inject(
      NotificationsService
    ) as jasmine.SpyObj<NotificationsService>
    notificationsService.notifications = mockNotifications

    fixture = TestBed.createComponent(NotificationsComponent)
    notificationComponent = fixture.componentInstance
    notificationsService.notifications = mockNotifications
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(notificationComponent).toBeTruthy()
  })

  it('should display all notifications', () => {
    const notificationElements = fixture.debugElement.queryAll(By.css('.notification'))
    expect(notificationElements.length).toBe(mockNotifications.length)
  })

  it('should display the correct message for each notification', () => {
    mockNotifications.forEach((notification: INotification, index: number) => {
      const notificationElement = fixture.debugElement.queryAll(By.css('.notification'))[index]
      const messageElement = notificationElement.query(By.css('app-text#notification-text'))
      expect(messageElement.nativeElement.textContent.trim()).toBe(notification.message)
    })
  })

  it('should apply the correct CSS class based on notification type', () => {
    mockNotifications.forEach((notification, index) => {
      const notificationElement = fixture.debugElement.queryAll(By.css('.notification'))[index]
      expect(notificationElement.nativeElement.classList).toContain(notification.type)
    })
  })

  it('should call removeNotification when close icon is clicked', () => {
    const removeSpy = notificationsService.removeNotification
    const closeIcons = fixture.debugElement.queryAll(By.css('.close-icon'))
    closeIcons[0].triggerEventHandler('click', null)
    expect(removeSpy).toHaveBeenCalledWith(mockNotifications[0].id!)
  })

  it('should call removeNotification when Enter key is pressed on close icon', () => {
    const removeSpy = notificationsService.removeNotification
    const closeIcons = fixture.debugElement.queryAll(By.css('.close-icon'))
    closeIcons[1].triggerEventHandler('keydown.enter', null)
    expect(removeSpy).toHaveBeenCalledWith(mockNotifications[1].id!)
  })

  it('should add a new notification', () => {
    const newNotification: INotification = {
      id: 5,
      message: 'New notification',
      type: 'info',
    }
    notificationsService.addNotification.and.callFake((notification: INotification) => {
      mockNotifications.push(notification)
    })

    notificationComponent.addNotification(newNotification)
    fixture.detectChanges()

    const notificationElements = fixture.debugElement.queryAll(By.css('.notification'))
    expect(notificationElements.length).toBe(mockNotifications.length)
    const addedNotification = notificationElements[notificationElements.length - 1]
    const messageElement = addedNotification.query(By.css('app-text#notification-text'))
    expect(messageElement.nativeElement.textContent.trim()).toBe(newNotification.message)
  })

  it('should remove a notification by id', () => {
    const notificationsLength = mockNotifications.length
    const removeSpy = notificationsService.removeNotification.and.callFake((id: number) => {
      const index = mockNotifications.findIndex((n) => n.id === id)
      if (index !== -1) {
        mockNotifications.splice(index, 1)
      }
    })

    notificationComponent.removeNotification(2)
    fixture.detectChanges()

    expect(removeSpy).toHaveBeenCalledWith(2)
    const notificationElements = fixture.debugElement.queryAll(By.css('.notification'))
    expect(notificationElements.length).toBe(notificationsLength - 1)

    const remainingIds = mockNotifications.map((notification: INotification) => notification.id)
    notificationElements.forEach((element) => {
      const idAttr = element.nativeElement.getAttribute('data-notification-id')
      const id = parseInt(idAttr, 10)
      expect(remainingIds).toContain(id)
    })
  })

  it('should correctly display notifications with special characters', () => {
    const specialNotification: INotification = {
      id: 7,
      message: 'Special characters: <>&"\'`',
      type: 'info',
    }

    notificationsService.addNotification.and.callFake((notification: INotification) => {
      mockNotifications.push(notification)
    })

    notificationComponent.addNotification(specialNotification)
    fixture.detectChanges()

    const notificationElements = fixture.debugElement.queryAll(By.css('.notification'))
    const addedNotification = notificationElements[notificationElements.length - 1]
    const messageElement = addedNotification.query(By.css('app-text#notification-text'))

    expect(messageElement.nativeElement.textContent.trim()).toBe('Special characters: <>&"\'`')
  })

  it('should clear all notifications when clearNotifications is called', () => {
    let notificationElements = fixture.debugElement.queryAll(By.css('.notification'))
    expect(notificationElements.length).toBe(mockNotifications.length)

    notificationsService.clearNotifications.and.callFake(() => {
      notificationsService.notifications = []
    })

    notificationsService.clearNotifications()
    fixture.detectChanges()

    notificationElements = fixture.debugElement.queryAll(By.css('.notification'))
    expect(notificationElements.length).toBe(0)
  })
})
