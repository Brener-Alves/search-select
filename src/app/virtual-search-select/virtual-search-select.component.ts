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
  ViewEncapsulation,
} from "@angular/core";
import { ControlValueAccessor, FormControl, NgControl } from "@angular/forms";
import { Subscription } from "rxjs";

export interface SelectItem {
  id: number | string;
  name: string;
}

@Component({
  selector: "virtual-search-select",
  styleUrls: ["virtual-search-select.component.scss"],
  templateUrl: "virtual-search-select.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VirtualSearchSelectComponent
  implements OnInit, AfterViewInit, DoCheck, OnDestroy, ControlValueAccessor
{
  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;

  @Input() lista: SelectItem[] = [];
  @Input() titulo: string = "Selecione";
  @Input() iniciarTodosMarcados: boolean = true;
  @Input() exibirQuantidade: boolean = true;
  @Input() ordenar: boolean = true;

  filteredList: SelectItem[] = [];
  filterValue = "";
  selected = new Set<number | string>();
  completed = false;
  indeterminated = false;
  exibirOverlayOpcoes = false;

  /**
   * FormControl interno vinculado ao matInput.
   *
   * Responsabilidades:
   *  1. Carregar o texto de exibição (selectedLabel) como valor,
   *     para que o mat-form-field flutue o label corretamente.
   *  2. Espelhar erros e touched/dirty do NgControl externo,
   *     para que mat-form-field pinte a borda vermelha e exiba mat-error
   *     sem nenhum CSS forçado.
   */
  readonly displayControl = new FormControl("");

  // Rastreia o último touched visto do control externo para detectar
  // mudanças causadas por markAllAsTouched() — que não dispara statusChanges.
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
      this.lista.sort((a, b) =>
        Intl.Collator("pt-BR", { sensitivity: "base" }).compare(a.name, b.name),
      );
    }

    this.applyFilter();

    if (this.iniciarTodosMarcados) {
      this._selectAll();
    }
  }

  ngAfterViewInit(): void {
    if (this.ngControl?.control) {
      this._syncDisplayControl();

      // statusChanges cobre: validators, setErrors(), disable()/enable(),
      // e também markAllAsTouched no Angular 18+ via unified events.
      // Para versões anteriores, ngDoCheck cobre o touched.
      this._statusSub = this.ngControl.control.statusChanges.subscribe(() => {
        this._syncDisplayControl();
      });
    }

    this.changeDetector.detectChanges();
  }

  /**
   * ngDoCheck roda em todo ciclo de detecção de mudanças do componente pai.
   * É o único hook confiável para detectar markAsTouched/markAllAsTouched
   * em todas as versões do Angular, já que esses métodos não emitem em
   * statusChanges (apenas mudam a propriedade `touched`).
   */
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

  /**
   * Sincroniza valor, erros e touched/dirty do control externo → displayControl.
   *
   * - setValue: faz o mat-label flutuar quando há texto selecionado
   * - setErrors: ativa a borda vermelha e exibe o mat-error nativamente
   * - markAsTouched/Dirty: satisfaz o ErrorStateMatcher padrão do Material
   *   (que só mostra erro quando touched OU dirty)
   */
  private _syncDisplayControl(): void {
    if (!this.ngControl?.control) return;

    const external = this.ngControl.control;

    // Valor: usa selectedLabel para que o mat-label flutue corretamente
    this.displayControl.setValue(this.selectedLabel, { emitEvent: false });

    // Erros: espelha exatamente os erros do control externo
    this.displayControl.setErrors(external.errors);

    // touched
    external.touched
      ? this.displayControl.markAsTouched()
      : this.displayControl.markAsUntouched();

    // dirty
    external.dirty
      ? this.displayControl.markAsDirty()
      : this.displayControl.markAsPristine();
  }

  // ─── Getters para o template ────────────────────────────────────────────────

  get viewportHeight(): number {
    return Math.min(Math.max(this.filteredList.length * 50, 50), 250);
  }

  get selectedLabel(): string {
    if (this.selected.size === 0) return "";
    if (this.selected.size === this.lista.length) return "Todos";

    const MAX_DISPLAY = 3;
    const names = this.lista
      .filter((item) => this.selected.has(item.id))
      .slice(0, MAX_DISPLAY)
      .map((item) => item.name);

    return this.selected.size > MAX_DISPLAY
      ? `${names.join(", ")} +${this.selected.size - MAX_DISPLAY}`
      : names.join(", ");
  }

  /** Estado do ícone: 'error' | 'disabled' | 'open' | 'default' */
  get iconState(): "error" | "disabled" | "open" | "default" {
    if (this.isDisabled) return "disabled";
    if (this.displayControl.invalid && this.displayControl.touched)
      return "error";
    if (this.exibirOverlayOpcoes) return "open";
    return "default";
  }

  get errorMessage(): string {
    const errors = this.ngControl?.control?.errors;
    if (!errors) return "";
    if (errors["required"]) return "Campo obrigatório";
    return "Campo inválido";
  }

  // ─── TrackBy ────────────────────────────────────────────────────────────────

  trackById(_index: number, item: SelectItem): number | string {
    return item.id;
  }

  // ─── Filtro e seleção ───────────────────────────────────────────────────────

  applyFilter(): void {
    const term = this.filterValue.trim().toLowerCase();
    this.filteredList = term
      ? this.lista.filter((item) => item.name.toLowerCase().includes(term))
      : this.lista.slice();

    this.updateStatusCheckAll();
    this.changeDetector.markForCheck();
  }

  clearFilter(): void {
    this.filterValue = "";
    this.applyFilter();
  }

  changeSelected(id: number | string): void {
    this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id);
    this._emitChange();
    this.updateStatusCheckAll();
  }

  changeAll(): void {
    const allCurrentlySelected = this.filteredList.every((item) =>
      this.selected.has(item.id),
    );

    this.filteredList.forEach((item) =>
      allCurrentlySelected
        ? this.selected.delete(item.id)
        : this.selected.add(item.id),
    );

    this._emitChange();
    this.updateStatusCheckAll();
  }

  updateStatusCheckAll(): void {
    const count = this.filteredList.length;
    const selectedCount = this.filteredList.filter((item) =>
      this.selected.has(item.id),
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
    this.lista.forEach((item) => this.selected.add(item.id));
    this._emitChange();
    this.updateStatusCheckAll();
  }

  private _emitChange(): void {
    this.onChange?.(Array.from(this.selected));
    // Atualiza o displayControl com o novo label após cada mudança de seleção
    this._syncDisplayControl();
    this.changeDetector.markForCheck();
  }

  // ─── ControlValueAccessor ───────────────────────────────────────────────────

  onTouched?: () => void;
  onChange?: (value: (number | string)[]) => void;
  isDisabled = false;

  writeValue(obj: (number | string)[] | null): void {
    this.selected = new Set(obj ?? []);
    this.updateStatusCheckAll();
    this._syncDisplayControl();
    this.changeDetector.markForCheck();
  }

  registerOnChange(fn: (value: (number | string)[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    isDisabled ? this.displayControl.disable() : this.displayControl.enable();
    this.changeDetector.markForCheck();
  }
}
