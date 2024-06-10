/**
 * global
 */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

/**
 * project
 */
import { AuthenticationService } from '@wfm/service-layer';

/**
 * local
 */
import { ConfirmClearComponent } from './confirm-clear/confirm-clear.component';

@Component({
  selector: 'app-clear-storage',
  templateUrl: './clear-storage.component.html',
  styleUrls: ['./clear-storage.component.scss']
})
export class ClearStorageComponent implements OnInit {
  constructor(@Inject('AuthenticationService') private authService: AuthenticationService, private dialog: MatDialog) {}

  ngOnInit(): void {}

  clearLocalStorage(): void {
    const dialogRef = this.dialog.open(ConfirmClearComponent);
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        localStorage.clear();
        this.authService.logout();
      }
    });
  }
}
