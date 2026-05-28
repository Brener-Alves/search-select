import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ViewChild,
} from "@angular/core";
import { ControlValueAccessor, FormControl, NgControl } from "@angular/forms";
import { Subscription } from "rxjs";

export type SelectItem = Record<string, any>;

@Component({
  selector: "virtual-search-select",
  styleUrls: ["virtual-search-select.component.scss"],
  templateUrl: "virtual-search-select.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualSearchSelectComponent
  implements OnInit, AfterViewInit, DoCheck, OnDestroy, ControlValueAccessor
{
  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;

  @Input() titulo: string = "Selecione";
  @Input() valueKey: string = "chave";
  @Input() labelKey: string = "valor";
  @Input() lista: SelectItem[] = [];

  @Input() iniciarTodosMarcados: boolean = true;
  @Input() ordenar: boolean = true;
  @Input() multiple: boolean = false;

  filteredList: SelectItem[] = [];
  filterValue = "";

  selected = new Set<any>();
  completed = false;
  indeterminated = false;
  exibirOverlayOpcoes = false;
  isFocused = false;

  readonly displayControl = new FormControl("");

  private _wasExternalTouched = false;
  private _statusSub = Subscription.EMPTY;

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private changeDetector: ChangeDetectorRef,
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (this.ordenar) {
      this.lista = [...this.lista].sort((a, b) =>
        Intl.Collator("pt-BR", { sensitivity: "base" }).compare(
          String(a[this.labelKey] ?? ""),
          String(b[this.labelKey] ?? ""),
        ),
      );
    }

    this.applyFilter();

    if (this.multiple && this.iniciarTodosMarcados) {
      this._selectAll();
    }
  }

  ngAfterViewInit(): void {
    if (this.ngControl?.control) {
      this._syncDisplayControl();

      this._statusSub = this.ngControl.control.statusChanges.subscribe(() => {
        this._syncDisplayControl();
      });
    }

    this.changeDetector.detectChanges();
  }

  ngDoCheck(): void {
    const externalTouched = !!this.ngControl?.control?.touched;
    if (externalTouched !== this._wasExternalTouched) {
      this._wasExternalTouched = externalTouched;
      this._syncDisplayControl();
      this.changeDetector.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this._statusSub.unsubscribe();
  }

  // ─── Sincronização do displayControl ────────────────────────────────────────

  private _syncDisplayControl(): void {
    if (!this.ngControl?.control) return;

    const external = this.ngControl.control;

    this.displayControl.setValue(this.selectedLabel, { emitEvent: false });
    this.displayControl.setErrors(external.errors);

    external.touched
      ? this.displayControl.markAsTouched()
      : this.displayControl.markAsUntouched();

    external.dirty
      ? this.displayControl.markAsDirty()
      : this.displayControl.markAsPristine();
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  get viewportHeight(): number {
    return Math.min(Math.max(this.filteredList.length * 50, 50), 250);
  }

  get selectedLabel(): string {
    if (this.selected.size === 0) return "";

    if (!this.multiple) {
      const item = this.lista.find(
        (i) => i[this.valueKey] === Array.from(this.selected)[0],
      );
      return item ? String(item[this.labelKey] ?? "") : "";
    }

    if (this.selected.size === this.lista.length) return "Todos";

    const MAX_DISPLAY = 3;
    const names = this.lista
      .filter((item) => this.selected.has(item[this.valueKey]))
      .slice(0, MAX_DISPLAY)
      .map((item) => String(item[this.labelKey] ?? ""));

    return this.selected.size > MAX_DISPLAY
      ? `${names.join(", ")} +${this.selected.size - MAX_DISPLAY}`
      : names.join(", ");
  }

  get errorMessage(): string {
    const errors = this.ngControl?.control?.errors;
    if (!errors) return "";
    if (errors["required"]) return "Campo obrigatório";
    return "Campo inválido";
  }

  // ─── TrackBy ────────────────────────────────────────────────────────────────

  trackByValue = (_index: number, item?: SelectItem): any =>
    item?.[this.valueKey];
  // ─── Filtro ─────────────────────────────────────────────────────────────────

  applyFilter(): void {
    const term = this.filterValue.trim().toLowerCase();
    this.filteredList = term
      ? this.lista.filter((item) =>
          String(item[this.labelKey] ?? "")
            .toLowerCase()
            .includes(term),
        )
      : this.lista.slice();

    this.updateStatusCheckAll();
    this.changeDetector.markForCheck();
  }

  clearFilter(): void {
    this.filterValue = "";
    this.applyFilter();
  }

  // ─── Seleção ────────────────────────────────────────────────────────────────

  changeSelected(value: any): void {
    if (!this.multiple) {
      // Seleção única: toggle — se já está marcado, desmarca; senão seleciona
      if (this.selected.has(value)) {
        this.selected.clear();
      } else {
        this.selected.clear();
        this.selected.add(value);
      }
      this._emitChange();
      this.updateStatusCheckAll();
      // Fecha o overlay após selecionar na seleção única
      this.fecharOverlay();
      return;
    }

    this.selected.has(value)
      ? this.selected.delete(value)
      : this.selected.add(value);
    this._emitChange();
    this.updateStatusCheckAll();
  }

  changeAll(): void {
    if (!this.multiple) return; // "selecionar todos" não se aplica à seleção única

    const allCurrentlySelected = this.filteredList.every((item) =>
      this.selected.has(item[this.valueKey]),
    );

    this.filteredList.forEach((item) =>
      allCurrentlySelected
        ? this.selected.delete(item[this.valueKey])
        : this.selected.add(item[this.valueKey]),
    );

    this._emitChange();
    this.updateStatusCheckAll();
  }

  updateStatusCheckAll(): void {
    const count = this.filteredList.length;
    const selectedCount = this.filteredList.filter((item) =>
      this.selected.has(item[this.valueKey]),
    ).length;

    this.completed = count > 0 && selectedCount === count;
    this.indeterminated = selectedCount > 0 && selectedCount < count;
    this.changeDetector.markForCheck();
  }

  // ─── Overlay ────────────────────────────────────────────────────────────────

  alterarExibicaoOpcoes(): void {
    this.exibirOverlayOpcoes = !this.exibirOverlayOpcoes;
    if (this.exibirOverlayOpcoes) {
      setTimeout(() => this.searchInput?.nativeElement.focus());
    }
  }

  fecharOverlay(): void {
    this.exibirOverlayOpcoes = false;
    this.clearFilter();
    this.onTouched?.();
    this._syncDisplayControl();
    this.changeDetector.markForCheck();
  }

  onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") this.fecharOverlay();
  }

  onSelectKeydown(event: KeyboardEvent): void {
    if (event.key !== "Tab") event.preventDefault();
    if (event.key === "Enter" || event.key === " ")
      this.alterarExibicaoOpcoes();
  }

  // ─── Helpers privados ───────────────────────────────────────────────────────

  private _selectAll(): void {
    this.lista.forEach((item) => this.selected.add(item[this.valueKey]));
    this._emitChange();
    this.updateStatusCheckAll();
  }

  private _emitChange(): void {
    if (this.multiple) {
      // Múltipla: emite array com todos os valores selecionados
      this.onChange?.(Array.from(this.selected));
    } else {
      // Única: emite o valor diretamente (não array), ou null se vazio
      const values = Array.from(this.selected);
      this.onChange?.(values.length > 0 ? values[0] : null);
    }
    this._syncDisplayControl();
    this.changeDetector.markForCheck();
  }

  // ─── ControlValueAccessor ───────────────────────────────────────────────────

  onTouched?: () => void;
  onChange?: (value: any) => void;
  isDisabled = false;

  writeValue(obj: any): void {
    if (this.multiple) {
      // Múltipla: espera array
      this.selected = new Set(
        Array.isArray(obj) ? obj : obj != null ? [obj] : [],
      );
    } else {
      // Única: espera valor escalar (ou array — pega o primeiro)
      if (obj == null) {
        this.selected = new Set();
      } else if (Array.isArray(obj)) {
        this.selected = obj.length > 0 ? new Set([obj[0]]) : new Set();
      } else {
        this.selected = new Set([obj]);
      }
    }

    this.updateStatusCheckAll();
    this._syncDisplayControl();
    this.changeDetector.markForCheck();
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    isDisabled ? this.displayControl.disable() : this.displayControl.enable();
    this._syncDisplayControl();
    this.changeDetector.markForCheck();
  }
}
