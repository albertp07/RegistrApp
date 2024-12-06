import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

  userName: string = '';
  userEmail: string = 'albe.pena@duocuc.cl';
  userAge: number = 21;
  userSexo: string = 'Masculino';
  userFono: string = '9 9936 8231';
  userImage: string = '';
  

  constructor(private router: Router) {
    const savedImage = localStorage.getItem('userImage');
    this.userImage = savedImage || 'assets/icon/sin-foto.jpg';
  }

  ngOnInit() {
    // Recuperar el username desde sessionStorage
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      this.userName = storedUsername;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.userImage = reader.result as string;
        localStorage.setItem('userImage', this.userImage);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  navigateToHome() {
    this.router.navigate(['/home']); // Cambia '/home' al path real de tu página de inicio
  }
}
