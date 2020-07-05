import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GriffCardComponent } from './card.component';

describe('CardComponent', () => {
    let component: GriffCardComponent;
    let fixture: ComponentFixture<GriffCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GriffCardComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GriffCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
