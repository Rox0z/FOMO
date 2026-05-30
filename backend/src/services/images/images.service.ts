import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import sharp from 'sharp';

@Injectable()
export class ImagesService {
  private readonly imgBbApiKey = process.env.IMGBB_API_KEY;
  private readonly imgBbUrl = 'https://api.imgbb.com/1/upload';

  constructor(private readonly httpService: HttpService) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Ficheiro inválido.');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Só são permitidas imagens.');
    }

    try {
      // 1. COMPRESSÃO / OTIMIZAÇÃO
      const optimizedImage = await sharp(file.buffer)
        .resize({ width: 1200 }) // reduz tamanho máximo
        .jpeg({ quality: 80 })   // compressão leve (boa qualidade + performance)
        .toBuffer();

      // 2. Converter para base64
      const base64Image = optimizedImage.toString('base64').replace(/\s/g, '');

      // 3. Preparar request para ImgBB
      const formData = new FormData();
      formData.append('image', base64Image);

      // 4. Upload
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.imgBbUrl}?key=${this.imgBbApiKey}`,
          formData,
          {
            headers: formData.getHeaders(),
          },
        ),
      );

      // 5. Retornar URL final da imagem
      return response.data.data.url;

    } catch (error) {
      console.error('ImgBB upload error:', error?.response?.data || error.message);

      throw new BadRequestException(
        error?.response?.data?.error?.message || 'Falha no upload da imagem',
      );
    }
  }
}