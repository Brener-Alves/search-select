import { OverlayModule } from "@angular/cdk/overlay";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRippleModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

import { VirtualSearchSelectComponent } from "./virtual-search-select.component";

@NgModule({
  declarations: [VirtualSearchSelectComponent],
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatRippleModule,
    OverlayModule,
    ScrollingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [VirtualSearchSelectComponent],
})
export class VirtualSearchSelectModule {}
