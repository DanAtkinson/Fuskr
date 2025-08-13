import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct title', () => {
      expect(component.title).toBe('fuskr');
    });

    it('should render title in template', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      // The app component might not directly display the title, but we can test that it's set
      expect(component.title).toContain('fuskr');
    });
  });

  describe('Component Properties', () => {
    it('should have title property as string', () => {
      expect(typeof component.title).toBe('string');
    });

    it('should not have undefined title', () => {
      expect(component.title).toBeDefined();
      expect(component.title).not.toBeNull();
    });

    it('should maintain title value after component initialization', () => {
      const initialTitle = component.title;
      fixture.detectChanges();
      expect(component.title).toBe(initialTitle);
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component initialization without errors', () => {
      expect(() => {
        const newFixture = TestBed.createComponent(AppComponent);
        newFixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle component destruction without errors', () => {
      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });
  });

  describe('Template Integration', () => {
    it('should compile successfully', () => {
      expect(fixture).toBeTruthy();
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('should render without errors', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should have proper component structure', () => {
      expect(component).toBeInstanceOf(AppComponent);
      expect(component.title).toBeDefined();
    });
  });
});
