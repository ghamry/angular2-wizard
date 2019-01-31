import { Component, OnInit, AfterContentInit, ContentChildren, QueryList, Output, EventEmitter, Input } from '@angular/core';
import { StepComponent } from './step.component';

@Component({
  selector: 'wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})
export class WizardComponent implements AfterContentInit {
  @ContentChildren(StepComponent)
  wizardSteps: QueryList<StepComponent>;

  private _steps: Array<StepComponent> = [];
  private _isCompleted: boolean = false;

  @Output() onStepChanged: EventEmitter<StepComponent> = new EventEmitter<StepComponent>();
  @Input() setActiveByIndex: number;

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
