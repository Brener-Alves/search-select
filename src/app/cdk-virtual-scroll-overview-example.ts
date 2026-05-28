import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

import { SelectItem } from "./virtual-search-select/virtual-search-select.component";

@Component({
  selector: "cdk-virtual-scroll-overview-example",
  styleUrls: ["cdk-virtual-scroll-overview-example.scss"],
  templateUrl: "cdk-virtual-scroll-overview-example.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CdkVirtualScrollOverviewExample {
  toppingList: string[] = [
    "Extra cheese",
    "Mushroom",
    "Onion",
    "Pepperoni",
    "Sausage",
    "Tomato",
  ];

  form = this.fb.group({
    testeMultiplo: [null, [Validators.required]],
    testeUnico: [null, [Validators.required]],
    toppings: [null, [Validators.required]],
  });

  lista: SelectItem[] = Array.from({ length: 100000 }).map((_, i) => ({
    id: i + 1,
    nome: `Item ${i + 1}`,
  }));

  constructor(protected fb: FormBuilder) {
    this.form.markAllAsTouched();
  }

  setarValor(): void {
    this.form.get("testeMultiplo")?.setValue([1, 2, 3]);
    this.form.get("testeUnico")?.setValue(5);
  }

  reset(): void {
    this.form.reset();
  }

  printForm(): void {
    console.log(this.form);
  }

  disable(): void {
    this.form.disable();
  }

  enable(): void {
    this.form.enable();
  }
}
