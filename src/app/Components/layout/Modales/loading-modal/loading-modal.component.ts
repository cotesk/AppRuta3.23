import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-loading-modal',
  templateUrl: './loading-modal.component.html',
  styleUrl: './loading-modal.component.css'
})
export class LoadingModalComponent implements OnInit {


  constructor(public dialogRef: MatDialogRef<LoadingModalComponent>) { }

  ngOnInit(): void {

    setTimeout(() => {
      this.dialogRef.close();
    }, 3000);
  }

}
