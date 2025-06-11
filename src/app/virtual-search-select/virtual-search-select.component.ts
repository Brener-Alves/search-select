import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";

@Component({
  selector: "virtual-search-select",
  styleUrls: ["virtual-search-select.component.scss"],
  templateUrl: "virtual-search-select.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VirtualSearchSelectComponent
  implements OnInit, ControlValueAccessor
{
  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;

  items = Array.from({ length: 100000 })
    .map((_, i) => {
      return {
        id: i + 1,
        name: `Item #${i + 1}`,
      };
    })
    .sort((a, b) => Intl.Collator().compare(a.name, b.name));

  filteredList = this.items.slice();
  filterValue = "";
  selected = new Set<number>();
  completed = false;
  indeterminated = false;
  exibirOverlayOpcoes = false;

  constructor(@Optional() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.applyFilter();
  }

  applyFilter() {
    this.filteredList = this.items.filter((item) =>
      item.name.includes(this.filterValue)
    );
    this.updateStatusCheckAll();
  }

  clearFilter() {
    this.filterValue = "";
    this.applyFilter();
  }

  changeSelected(id: number) {
    this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id);
    this.updateStatusCheckAll();
    this.onChange && this.onChange(Array.from(this.selected));
  }

  changeAll() {
    this.filteredList.forEach((item) => {
      this.completed
        ? this.selected.delete(item.id)
        : this.selected.add(item.id);
    });
    this.updateStatusCheckAll();
    this.onChange && this.onChange(Array.from(this.selected));
  }

  updateStatusCheckAll() {
    this.completed =
      this.filteredList.length > 0 &&
      this.filteredList.every((item) => this.selected.has(item.id));

    this.indeterminated =
      !this.completed &&
      this.filteredList.length > 0 &&
      this.filteredList.some((item) => this.selected.has(item.id));
  }

  alterarExibicaoOpcoes(): void {
    this.exibirOverlayOpcoes = !this.exibirOverlayOpcoes;

    if (this.exibirOverlayOpcoes) {
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      });
    }
  }

  fecharOverlay(): void {
    this.exibirOverlayOpcoes = false;
    this.filterValue = "";
    this.applyFilter();
  }

  onOverlayKeydown(event: KeyboardEvent) {
    if (["Escape"].includes(event.key)) this.fecharOverlay();
  }

  onSelectKeydown(event: KeyboardEvent): void {
    if (!["Tab"].includes(event.key)) {
      event.preventDefault();
    }

    if (["Enter", " "].includes(event.key)) {
      this.alterarExibicaoOpcoes();
    }
  }

  //FORMS
  onTouched?: () => {};
  onChange?: (value: number[]) => {};
  isDisabled = false;

  writeValue(obj: number[]): void {
    this.selected = new Set(obj);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
