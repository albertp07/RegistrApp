import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { WeatherService } from '../tiempo/weather.service'; 
import { HttpClient } from '@angular/common/http';
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';
import { Storage } from '@ionic/storage-angular'; 
import { AnimationController, ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../service/auth.service'; 
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  isModalOpen = false;

  segment: string = 'generar';
  qrText: string = '';
  materiaSeleccionada: string = '';
  username: string = '';
  result: string = '';
  scannedData: any;
  weatherData: any;
  horaActual: string = '';
  asignatura: string = '';
  seccion: string = '';
  sala: string = '';
  fecha: string = '';
  locationErrorMessage: string = '';

  // Coordenadas de referencia para la validación de distancia
  referencia = { lat: -33.499818, lon: -70.616237 }; // Cambia por las coordenadas correctas
  historialAsistencias: any;
  historialVisible: boolean = false;
  generarQRVisible: boolean = false;


  constructor(
    public httpClient: HttpClient,
    private userService: UserService,
    private router: Router,
    private animationCtrl: AnimationController,
    private navController: NavController,
    public weatherService: WeatherService,
    private alertController: AlertController,
    private storage: Storage,
    private toastController: ToastController,
    private authService: AuthService,
    private modalController: ModalController
  ) {}

  toggleGenerarQR() {
    this.generarQRVisible = !this.generarQRVisible;
  }
  

  ngOnInit() {
    this.storage.create().then(() => { 
      this.loadTheme();
    });
  
    setInterval(() => {
      this.obtenerHora();
    }, 1000);
  
    this.username = this.userService.getUsername(); 
    this.getUserLocation(); 
  }

  obtenerHora() {
    const now = new Date();
    this.horaActual = now.toLocaleTimeString();
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.getWeather(lat, lon);
          this.checkDistance(lat, lon);  // Verificamos la distancia después de obtener la ubicación
        },
        (error) => {
          console.error('Error obteniendo la ubicación', error);
        }
      );
    } else {
      console.error('Geolocalización no es soportada por este navegador.');
    }
  }

  // Función para obtener el clima
  getWeather(lat: number, lon: number) {
    this.weatherService.getWeatherByCoords(lat, lon).subscribe({
      next: (data: any) => {
        this.weatherData = data;
      },
      error: (error: any) => {
        console.error('Error obteniendo el clima', error);
      }
    });
  }

  // Función para calcular la distancia entre dos coordenadas
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Distancia en metros
    return distance;
  }

  // Función para convertir grados a radianes
  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Verificar radio en metros
  checkDistance(lat: number, lon: number) {
    const distance = this.calculateDistance(lat, lon, this.referencia.lat, this.referencia.lon);
    if (distance <= 100) {
      this.locationErrorMessage = ''; 
    } else {
      this.locationErrorMessage = 'Estan fuera del Duoc, no puedes registrar la asistencia.';
    }
  }


  navigateTo(page: string) {
    this.navController.navigateForward(`/${page}`);
  }

  // manejar la apertura de la cámara
  async qrcode(): Promise<void> {
    if (this.locationErrorMessage) {
      alert(this.locationErrorMessage); 
      return;
    }

    const result = await CapacitorBarcodeScanner.scanBarcode({
      hint: CapacitorBarcodeScannerTypeHint.ALL
    });
    this.result = result.ScanResult;


    //result
    if (result.ScanResult) {
      this.result = result.ScanResult;
  
      // Guardar el registro de asistencia
      const nuevaAsistencia = {
        texto: this.result,
        fecha: new Date().toLocaleString(), // Fecha y hora del escaneo
      };
  
      // Obtener el historial actual del almacenamiento
      const historial = (await this.storage.get('asistencias')) || [];
      historial.push(nuevaAsistencia);
  
      // Guardar el historial actualizado en el almacenamiento
      await this.storage.set('asistencias', historial);
      console.log('Asistencia registrada:', nuevaAsistencia);
      alert('¡Asistencia registrada exitosamente!');
    } else {
      alert('No se pudo leer el código QR.');
    }
  }

  //obtener asistencia

  async obtenerHistorial(): Promise<void> {
    const historial = (await this.storage.get('asistencias')) || [];
    console.log('Historial de asistencias:', historial);
    this.historialAsistencias = historial; // Asigna a una variable para mostrar en la vista
  }

  guardarSeleccion() {
    this.fecha = this.obtenerFechaSistema();
    if (this.asignatura && this.seccion && this.sala && this.fecha) {
      this.qrText = `${this.asignatura}|${this.seccion}|${this.sala}|${this.fecha}`;
    } else {
      this.qrText = 'QR Inválido. No ha ingresado todos los datos.';
    }

    console.log('Texto generado:', this.qrText);
  }

  obtenerFechaSistema(): string {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    
    return `${day}${month}${year}`;
  }

  toggleTheme() {
    const currentTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    document.body.classList.toggle('dark', currentTheme === 'dark');
    this.saveTheme(currentTheme);
  }

  async saveTheme(theme: string) {
    await this.storage.set('theme', theme);
  }

  async loadTheme() {
    const savedTheme = await this.storage.get('theme');
    if (savedTheme) {
      document.body.classList.toggle('dark', savedTheme === 'dark');
    }
  }


  //Preguntar para salir

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Hasta pronto!',
      duration: 3000,
      position: 'top',
      color: 'success'
    });
    toast.present();
  }

  async goToLogin() {
    await this.presentToast();
    this.router.navigate(['/login']);
  }

  async presentLogoutConfirm(page: string) {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Salida cancelada');
          }
        },
        {
          text: 'Salir',
          handler: async () => {
            this.authService.logout();
            this.goToLogin();
          }
        }
      ]
    });

    await alert.present();
  }

  toggleHistorial(): void {
    this.historialVisible = !this.historialVisible;

    if (this.historialVisible) {
      this.obtenerHistorial();
    }
  }

}