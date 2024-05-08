import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrl: './login-status.component.css',
})
export class LoginStatusComponent implements OnInit {
  isAuth: boolean = false;
  userFullName: string = '';

  constructor(
    private oktaAuthService: OktaAuthStateService,
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth
  ) {}

  ngOnInit(): void {
    //Subscribe to authentication state changes
    this.oktaAuthService.authState$.subscribe((result) => {
      this.isAuth = result.isAuthenticated;
      this.getUserDetails();
    });
  }

  getUserDetails() {
    if (this.isAuth) {
      //Fetch the logger in user details
      //user full name is exposed as a property name
      this.oktaAuth.getUser().then((res) => {
        this.userFullName = res.name as string;
      });
    }
  }

  logout(){
    //terminates the session with okta and removes current tokens
    this.oktaAuth.signOut();  
  }
}
