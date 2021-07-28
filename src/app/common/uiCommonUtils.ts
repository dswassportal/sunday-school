import { Injectable, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
// import { Router } from '@angular/router';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBar, MatSnackBarConfig, MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class uiCommonUtils {

    constructor(
        private snackBar: MatSnackBar,
        public router: Router
    ) { }

    showSnackBar(message: string, type: string, duration: number) {
        // this.snackBar.open(message, action, {
        //     duration: duration,
        // });

        let config = {
            message: message,
            type: type
        }
        let styleClass = type == 'success' ? 'successSnackBarStyle' : 'errorSnackBarStyle';
        this.snackBar.openFromComponent(customSnackBar, {
            duration: duration,
            data: config,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: [styleClass]
        });
    }

    hasPermissions(permission: string): boolean {

        let metaDataJSON = this.getUserMetaDataJson()
        let tempVar1 = metaDataJSON.permissions.indexOf(permission)
        if (tempVar1 >= 0)
            return true;
        else
            return false;

    }

    getUserMetaDataJson(): any {

        let metaDataJSON = {};
        try {
            metaDataJSON = JSON.parse(localStorage.getItem('chUserMetaData') || '{}')

            if (metaDataJSON == {}) {
                console.log('User metadata not found in the LocalStorage');
                this.router.navigate(['/signin']);
            }

        } catch (error) {
            console.error(error)
            this.router.navigate(['/signin']);
        }
        return metaDataJSON;
    }
}

@Component({
    selector: 'custom-snackbar.component',
    templateUrl: 'custom-snackbar.component.html',
    styles: [],
})
export class customSnackBar {
    constructor(
        public snackBarRef: MatSnackBarRef<customSnackBar>,
        @Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}