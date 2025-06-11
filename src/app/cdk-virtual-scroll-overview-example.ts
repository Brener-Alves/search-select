import {
  ChangeDetectionStrategy,
  Component,
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
export class CdkVirtualScrollOverviewExample {}
