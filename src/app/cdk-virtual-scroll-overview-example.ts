import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

/** @title Basic virtual scroll */
@Component({
  selector: 'cdk-virtual-scroll-overview-example',
  styleUrls: ['cdk-virtual-scroll-overview-example.scss'],
  templateUrl: 'cdk-virtual-scroll-overview-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CdkVirtualScrollOverviewExample implements OnInit {
  items = Array.from({ length: 100000 }).map((_, i) => {
    return {
      id: i,
      name: `Item #${i}`,
    };
  });

  filteredList = this.items.slice();
  filterValue = '';
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
    this.filterValue = '';
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
  }

  fecharOverlay(): void {
    this.exibirOverlayOpcoes = false;
  }

  onOverlayKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') this.fecharOverlay();
  }
}
