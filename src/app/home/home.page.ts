import { Component } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  latitude: number | null = null;
  longitude: number | null = null;
  errorMessage: string | null = null;

  constructor() {}

  async obtenerUbicacion() {
    this.latitude = null;
    this.longitude = null;
    this.errorMessage = null;

    try {
      // 1. Verificar estado actual de permisos
      let permStatus = await Geolocation.checkPermissions();

      // Si están denegados explícitamente, indicamos al usuario que debe habilitarlos manualmente
      if (permStatus.location === 'denied') {
        this.errorMessage = 'El permiso de ubicación está denegado. Por favor, habilítelo en la configuración de su dispositivo.';
        return;
      }

      // Si aún no se han solicitado, los solicitamos
      if (permStatus.location === 'prompt' || permStatus.location === 'prompt-with-rationale') {
        permStatus = await Geolocation.requestPermissions();
        if (permStatus.location !== 'granted') {
          this.errorMessage = 'Permiso de ubicación denegado por el usuario.';
          return;
        }
      }

      // 2. Intentar obtener la ubicación actual con GPS
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;

    } catch (error: any) {
      console.error('Error al obtener la ubicación:', error);

      // Manejo estricto de errores según el código o el mensaje de error recibido
      if (
        error.code === 1 || 
        (error.message && (
          error.message.toLowerCase().includes('denied') || 
          error.message.toLowerCase().includes('permission')
        ))
      ) {
        this.errorMessage = 'Acceso a la ubicación denegado. Verifique los permisos de la aplicación.';
      } else if (
        error.code === 2 || 
        (error.message && (
          error.message.toLowerCase().includes('unavailable') || 
          error.message.toLowerCase().includes('not enabled') || 
          error.message.toLowerCase().includes('disabled') || 
          error.message.toLowerCase().includes('turned off')
        ))
      ) {
        this.errorMessage = 'El GPS o los servicios de ubicación están apagados/no disponibles. Por favor, actívelos en su dispositivo.';
      } else if (
        error.code === 3 || 
        (error.message && error.message.toLowerCase().includes('timeout'))
      ) {
        this.errorMessage = 'Se agotó el tiempo de espera para obtener la ubicación. Inténtelo de nuevo en un espacio más abierto.';
      } else {
        this.errorMessage = `Error al obtener la ubicación: ${error.message || error}`;
      }
    }
  }

  getGoogleMapsUrl(): string {
    if (this.latitude !== null && this.longitude !== null) {
      return `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;
    }
    return '';
  }
}

