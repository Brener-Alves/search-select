import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

/** @title Basic virtual scroll */
@Component({
  selector: "cdk-virtual-scroll-overview-example",
  styleUrls: ["cdk-virtual-scroll-overview-example.scss"],
  templateUrl: "cdk-virtual-scroll-overview-example.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CdkVirtualScrollOverviewExample {
  form = this.fb.group({
    teste: [[], [Validators.required]],
    teste2: [[10, 20], [Validators.required]],
  });

  testeModel = [1, 7, 990];

  constructor(protected fb: FormBuilder) {}

  setarValorNoForm() {
    this.form.get("teste")?.setValue([1, 2, 3]);
  }

  setarValorNoModel() {
    this.testeModel = [88, 5];
  }

  printForm() {
    console.log(this.form);
  }
}
