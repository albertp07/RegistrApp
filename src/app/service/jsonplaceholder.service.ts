import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JsonplaceholderService {
  private apiUrl = 'https://jsonplaceholder.typicode.com'; // URL base de la API

  constructor(private http: HttpClient) {}

  // Obtener todas las publicaciones
  getPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/posts`);
  }

  // Obtener una publicación específica por ID
  getPost(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/posts/${id}`);
  }

  // Crear una nueva publicación
  createPost(post: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts`, post);
  }

  // Actualizar una publicación
  updatePost(id: number, post: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/posts/${id}`, post);
  }

  // Eliminar una publicación
  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/posts/${id}`);
  }
}
