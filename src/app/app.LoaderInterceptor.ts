import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { NgxSpinnerService } from "ngx-spinner";
import { uiCommonUtils } from "./common/uiCommonUtils";
import { Router } from '@angular/router';


@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
    constructor(private spinner: NgxSpinnerService, private uiCommonUtils: uiCommonUtils, public router: Router) {
    }

    excludeList = [
        "myprofile",
        "landingpage",
        "signin",
        "signup",
        'eventRegistration',
        "dashboard"];
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let userMetaData = this.uiCommonUtils.getUserMetaDataJson()
        if (userMetaData) {
            if (userMetaData.menus) {
                let excludeIndex = -1;
                let menuIndex = userMetaData.menus.findIndex((menuUrl: any) => {
                    let urlMapping = window.location.href.split('#');

                    if (urlMapping[1].includes('dashboard')) {
                        urlMapping = window.location.href.split('#');
                    } else {

                        if (urlMapping[1].indexOf('/') !== -1) {
                            let excludeUrl = urlMapping[1].split('/')[1];
                            excludeIndex = this.excludeList.indexOf(excludeUrl);
                        }
                    }
                    return ((urlMapping[1] === menuUrl.url) || excludeIndex === -1 ? true : false)
                })
                if (menuIndex === -1)
                    this.router.navigate(['/signin']);
            } else {
                let urlMapping = window.location.href.split('#');
                let excludeUrl = urlMapping[1].split('/')[1];
                if (!this.excludeList.indexOf(excludeUrl))
                    this.router.navigate(['/signin']);
            }
        } else this.router.navigate(['/signin']);
        this.spinner.show();
        return next.handle(req).pipe(
            finalize(() => this.spinner.hide())
        );
    }
}