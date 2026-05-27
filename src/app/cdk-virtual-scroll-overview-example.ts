import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";

import { SelectItem } from "./virtual-search-select/virtual-search-select.component";

@Component({
  selector: "cdk-virtual-scroll-overview-example",
  styleUrls: ["cdk-virtual-scroll-overview-example.scss"],
  templateUrl: "cdk-virtual-scroll-overview-example.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CdkVirtualScrollOverviewExample {
  toppings = new FormControl(null, Validators.required);
  toppingList: string[] = [
    "Extra cheese",
    "Mushroom",
    "Onion",
    "Pepperoni",
    "Sausage",
    "Tomato",
  ];

  form = this.fb.group({
    teste: [null, [Validators.required]],
  });

  lista: SelectItem[] = Array.from({ length: 100000 }).map((_, i) => ({
    id: i + 1,
    name: `Item #${i + 1}`,
  }));

  constructor(protected fb: FormBuilder) {}

  setarValor(): void {
    this.form.get("teste")?.setValue([1, 2, 3]);
  }
}
