import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { User } from 'src/app/models/user/user';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy{
  public showLoading: boolean;
  private subscriptions : Subscription[] = [];

  constructor(private router : Router, 
    private authenticationService : AuthenticationService,
    private notificationService : NotificationService ){
      this.showLoading = false;
    }

  ngOnInit(): void {
    if(this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/user/management');
      console.log("Ca fonctionne login");
    } else {
      this.router.navigateByUrl('/login');
      console.log("Ca ne fonctionne pas login");

    }

    
  }
  public onLogin(user: User): void {
    this.showLoading = true;
    this.subscriptions.push(
      this.authenticationService.login(user).subscribe(
        (response: HttpResponse<User>) => {
          const token = response.headers.get(HeaderType.JWT_TOKEN);
          this.authenticationService.saveToken(token!);
          this.authenticationService.addUserToLocalCache(response.body!);
          this.router.navigateByUrl('/user/management');
          this.showLoading = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendErrorNotification(NotificationType.ERROR, errorResponse.error.message);
          this.showLoading = false;
        }
      )
    );
  }

/*  public onLogin(user: User): void {
    this.showLoading = true;
    this.subscriptions.push(
      this.authenticationService.login(user).subscribe(
        (response: HttpResponse<User>) => {
          const token = response.headers.get(HeaderType.JWT_TOKEN);
          this.authenticationService.saveToken(token!);
          this.authenticationService.addUserToLocalCache(response.body!);
          this.router.navigateByUrl('/user/management');
          this.showLoading = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendErrorNotification(NotificationType.ERROR, errorResponse.error.message);
          this.showLoading = false;
        }
      )
    );
  }
  */
 /* public onLogin(user: User): void{
    this.showLoading = true;
    console.log(user);

    this.subscriptions.push(this.authenticationService.login(user).subscribe({
      next: (response: HttpResponse<User>)=>  {
       const token = response.headers.get(HeaderType.JWT_TOKEN);
       this.authenticationService.saveToken(token!);
       console.log("Token : "+token);
       
       this.authenticationService.addUserToLocalCache(response.body!);
       this.router.navigateByUrl('/user/management');
       this.showLoading = false;

         },
      error: (errorResponse: HttpErrorResponse) => {
          console.log(errorResponse);
          this.sendErrorNotification(NotificationType.ERROR, errorResponse.error.message);          
          this.showLoading = false;
      }
    }
      )
    )
    
  }*/
  
 private sendErrorNotification(notificationType: NotificationType, message: string) {
    if(message){
      this.notificationService.notify(notificationType,message);
    }else{
      this.notificationService.notify(notificationType,'AN ERROR OCCURED. PLEASE TRY AGAIN');
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
