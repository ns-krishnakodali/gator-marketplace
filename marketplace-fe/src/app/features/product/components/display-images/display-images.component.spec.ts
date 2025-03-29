import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisplayImagesComponent } from './display-images.component';
import { ProductImage } from '../../models';

describe('DisplayImagesComponent', () => {
  let component: DisplayImagesComponent;
  let fixture: ComponentFixture<DisplayImagesComponent>;
  
  const mockImages: ProductImage[] = [
    { src: 'image1.jpg', isMain: false, mimeType: 'image/jpeg' },
    { src: 'image2.jpg', isMain: true, mimeType: 'image/jpeg' },
    { src: 'image3.jpg', isMain: false, mimeType: 'image/jpeg' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayImagesComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(DisplayImagesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should set displayImageSrc to main image on init if available', () => {
      component.images = mockImages;
      component.ngOnInit();
      expect(component.displayImageSrc).toBe('image2.jpg');
    });

    it('should set displayImageSrc to first image if no main image is available', () => {
      const imagesWithoutMain: ProductImage[] = [
        { src: 'image1.jpg', isMain: false, mimeType: 'image/jpeg' },
        { src: 'image3.jpg', isMain: false, mimeType: 'image/jpeg' }
      ];
      component.images = imagesWithoutMain;
      component.ngOnInit();
      expect(component.displayImageSrc).toBe('image1.jpg');
    });

    it('should handle empty images array', () => {
      component.images = [];
      component.ngOnInit();
      expect(component.displayImageSrc).toBeUndefined();
    });
  });

  describe('interaction', () => {
    beforeEach(() => {
      component.images = mockImages;
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should update displayImageSrc when onDisplayImageClick is called', () => {
      component.onDisplayImageClick('image3.jpg');
      expect(component.displayImageSrc).toBe('image3.jpg');
    });

    it('should render all thumbnail images', () => {
      const imgElements = fixture.nativeElement.querySelectorAll('.image-thumbnails img');
      expect(imgElements.length).toBe(3);
    });

    it('should render the display image with the correct src', () => {
      const displayImage = fixture.nativeElement.querySelector('.display-image');
      expect(displayImage.src).toContain('image2.jpg');
    });

    it('should update display image when a thumbnail is clicked', () => {
      const thumbnails = fixture.nativeElement.querySelectorAll('.image-thumbnails img');
      thumbnails[0].click();
      fixture.detectChanges();
      
      const displayImage = fixture.nativeElement.querySelector('.display-image');
      expect(displayImage.src).toContain('image1.jpg');
    });

    it('should handle keyboard navigation with Enter key', () => {
      const thumbnails = fixture.nativeElement.querySelectorAll('.image-thumbnails img');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      
      // Simulate Enter key on first thumbnail
      thumbnails[0].dispatchEvent(event);
      fixture.detectChanges();
      
      const displayImage = fixture.nativeElement.querySelector('.display-image');
      expect(displayImage.src).toContain('image1.jpg');
    });
  });
});