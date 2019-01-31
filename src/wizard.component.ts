import { Component, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { WizardStepComponent } from './wizard-step.component';

@Component({
  selector: 'form-wizard',
  template:
  `<div class="card">
  <div class="card-header">
    <ul class="nav nav-justified">
      <li *ngFor="let step of steps" (click)="goToStep(step)" class="nav-item" [ngClass]="{'danger': !step?.isValid && !step.isDisabled ,
      'active': step.isActive, 'enabled': !step.isDisabled, 'disabled': step.isDisabled, 'completed': isCompleted}">
        <a>{{step.title}}</a>
      </li>
    </ul>
  </div>
  <div class="card-block">
    <ng-content></ng-content>
  </div>
  <div class="card-footer" [hidden]="isCompleted">
    <button type="button" class="btn btn-secondary float-left" (click)="previous()" [hidden]="!hasPrevStep || !activeStep.showPrev">Previous</button>
    <button type="button" class="btn btn-secondary float-right" (click)="next()" [disabled]="!activeStep?.isValid" [hidden]="!hasNextStep || !activeStep.showNext">Next</button>
    <button type="button" class="btn btn-secondary float-right" (click)="complete()" [disabled]="!activeStep?.isValid" [hidden]="hasNextStep">Done</button>
  </div>
</div>`
  ,
  styles: [
    '.card { height: 100%; }',
    '.card-header { background-color: #fff; padding: 0; font-size: 1.25rem; }',
    '.card-block { overflow-y: auto; }',
    '.card-footer { background-color: #fff; border-top: 0 none; }',
    '.nav-item { padding: 1rem 0rem; border-bottom: 0.5rem solid #ccc; }',
    '.active { font-weight: bold; color: black; border-bottom-color: #1976D2 !important; }',
    '.enabled { cursor: pointer; border-bottom-color: rgb(88, 162, 234); }',
    '.danger { cursor: pointer; border-bottom-color: rgb(172, 22, 17)!important; }',
    '.disabled { color: #ccc; }',
    '.completed { cursor: default; }'
  ]
})
export class WizardComponent implements AfterContentInit {
  @ContentChildren(WizardStepComponent)
  wizardSteps: QueryList<WizardStepComponent>;

  private _steps: Array<WizardStepComponent> = [];
  private _isCompleted: boolean = false;

  @Output()
  onStepChanged: EventEmitter<WizardStepComponent> = new EventEmitter<WizardStepComponent>();

  constructor() { }

  
  ngAfterContentInit() {
    // here assign the steps in the wizard to local steps
    this.wizardSteps.forEach(step => this._steps.push(step));

    // if the user changes the steps at run time 
    // this.wizardSteps.changes.subscribe((wizardStepsNew) => {
    //   const tempSteps = [];
    //   wizardStepsNew.forEach((newStep: any) => {
    //     tempSteps.push(newStep);
    //   });
    //   this.steps = tempSteps; 
    // });

    // here assign the active step 
    if (this.setActiveByIndex && this.setActiveByIndex > 0) {
      this.steps[this.setActiveByIndex].isActive = true;

      for (let index = 0; index < this.setActiveByIndex; index++) {
        const el = this.steps[index];
        el.isDisabled = false;
      }
    }
    else
      this.steps[0].isActive = true;
  }

  get steps(): Array<StepComponent> {
    return this._steps.filter(step => !step.hidden);
  }
  set steps(stp) {
    this._steps = stp;
  }

  get isCompleted(): boolean {
    return this._isCompleted;
  }

  get activeStep(): StepComponent {
    return this.steps.find(step => step.isActive);
  }

  set activeStep(step: StepComponent) {
    if (step !== this.activeStep && !step.isDisabled) {
      this.activeStep.isActive = false;
      step.isActive = true;
      this.onStepChanged.emit(step);
    }
  }

  public get activeStepIndex(): number {
    return this.steps.indexOf(this.activeStep);
  }

  get hasNextStep(): boolean {
    return this.activeStepIndex < this.steps.length - 1;
  }

  get hasPrevStep(): boolean {
    return this.activeStepIndex > 0;
  }

  public goToStep(step: StepComponent): void {
    if (!this.isCompleted && this.allStepsValid()) {
      this.activeStep = step;
    }
  }

  public next(): void {
    if (this.hasNextStep) {
      let nextStep: StepComponent = this.steps[this.activeStepIndex + 1];
      this.activeStep.onNext.emit();

      nextStep.isDisabled = false;
      this.activeStep = nextStep;
    }
  }

  public previous(): void {
    if (this.hasPrevStep) {
      let prevStep: StepComponent = this.steps[this.activeStepIndex - 1];
      this.activeStep.onPrev.emit();
      prevStep.isDisabled = false;
      this.activeStep = prevStep;
    }
  }

  public complete(): void {
    this.activeStep.onComplete.emit();
    this._isCompleted = true;
  }

  public allStepsValid = (): boolean => this.steps.every(step => step.isValid);

}
