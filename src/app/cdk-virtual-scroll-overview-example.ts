import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";

/** @title Basic virtual scroll */
@Component({
  selector: "cdk-virtual-scroll-overview-example",
  styleUrls: ["cdk-virtual-scroll-overview-example.scss"],
  templateUrl: "cdk-virtual-scroll-overview-example.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CdkVirtualScrollOverviewExample implements OnInit {
  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;

  items = Array.from({ length: 100000 }).map((_, i) => {
    return {
      id: i + 1,
      name: `Item #${i + 1}`,
    };
  });

  filteredList = this.items.slice();
  filterValue = "";
  selected = new Set<number>();
  completed = false;
  indeterminated = false;
  exibirOverlayOpcoes = false;

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
  }

  changeAll() {
    this.filteredList.forEach((item) => {
      this.completed
        ? this.selected.delete(item.id)
        : this.selected.add(item.id);
    });
    this.updateStatusCheckAll();
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
}
