import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

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
    teste: [null, [Validators.required]],
  });

  lista = Array.from({ length: 100000 }).map((_, i) => {
    return {
      id: i + 1,
      name: `Item #${i + 1}`,
    };
  });

  constructor(protected fb: FormBuilder) {}

  printForm() {
    console.log(this.form);
  }
}
