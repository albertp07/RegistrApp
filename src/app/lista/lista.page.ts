import { Component, ElementRef, ViewChild } from '@angular/core';
import { AnimationController, IonContent, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { JsonplaceholderService } from '../service/jsonplaceholder.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.page.html',
  styleUrls: ['./lista.page.scss'],
})
export class ListaPage {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  people: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedPeople: any[] = [];
  totalPages: number = 0;
  targetPage: number = 1;

  @ViewChild('title', { read: ElementRef, static: true }) title!: ElementRef;

  constructor(
    private router: Router,
    private animationCtrl: AnimationController,
    private jsonPlaceholderService: JsonplaceholderService,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  goToHome() {
    this.router.navigate(['/home']);
  }

  ngAfterViewInit() {
    const animation = this.animationCtrl
      .create()
      .addElement(this.title.nativeElement)
      .duration(3500)
      .iterations(Infinity)
      .fromTo('opacity', '0', '1')
      .fromTo('transform', 'scale3d(1, 1, 1)', 'scale3d(1.5, 1.5, 1.5)');

    animation.play();
  }

  ngOnInit() {
    this.jsonPlaceholderService.getPosts().subscribe(
      (data) => {
        console.log('Datos recibidos:', data);
        this.people = data.map((item: any) => ({
          id: item.id,
          firstName: `Nombre ${item.id}`,
          lastName: `Apellido ${item.id}`,
          country: 'Chile',
          age: Math.floor(Math.random() * (50 - 20 + 1)) + 20
        }));
        this.totalPages = Math.ceil(this.people.length / this.itemsPerPage);
        this.updatePage();
      },
      (error) => {
        console.error('Error al obtener las publicaciones', error);
      }
    );
  }

  updatePage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPeople = this.people.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePage();
      this.content.scrollToTop(300);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePage();
      this.content.scrollToTop(300);
    }
  }

  async goToPage() {
    if (this.targetPage >= 1 && this.targetPage <= this.totalPages) {
      this.currentPage = this.targetPage;
      this.updatePage();
      this.content.scrollToTop(300);
    } else {
      this.showOutOfRangeToast();
    }
  }

  async showOutOfRangeToast() {
    const toast = await this.toastController.create({
      message: 'Número de página fuera de rango',
      duration: 2000,
      color: 'warning',
      position: 'top'
    });
    toast.present();
  }

  async editPerson(person: any) {
    const alert = await this.alertController.create({
      header: 'Editar Usuario',
      inputs: [
        {
          name: 'firstName',
          type: 'text',
          placeholder: 'Nombre',
          value: person.firstName
        },
        {
          name: 'lastName',
          type: 'text',
          placeholder: 'Apellido',
          value: person.lastName
        },
        {
          name: 'age',
          type: 'number',
          placeholder: 'Edad',
          value: person.age
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            person.firstName = data.firstName;
            person.lastName = data.lastName;
            person.age = data.age;
            this.updatePage();
          }
        }
      ]
    });

    await alert.present();
  }

  async deletePerson(person: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar a ${person.firstName} ${person.lastName}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.people = this.people.filter(p => p.id !== person.id);
            this.updatePage();
          }
        }
      ]
    });

    await alert.present();
  }
  
}
