import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'volontulo-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginModel: LoginRequestModel = {
    username: '',
    password: '',
  };
  resetPasswordUrl = this.authService.resetPasswordUrl;

  constructor(private authService: AuthService,
  ) { }

  login(username: string, password: string): void {
    this.authService.login(this.loginModel.username, this.loginModel.password);
  }

}
