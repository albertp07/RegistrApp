import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = false;

  login(username: string, password: string): boolean {
    const validUsername = 'admin';
    const validPassword = 'admin123'; 

    if (password === validPassword) {
      this.authenticated = true;
      return true;
    }
    return false;
  }

  isLoggedIn(): boolean {
    return this.authenticated;
  }

  logout() {
    this.authenticated = false;
  }
}
